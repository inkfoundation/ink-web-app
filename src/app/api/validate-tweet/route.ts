import { SignJWT } from "jose";
import { NextResponse } from "next/server";

import { env } from "@/env";
import { clientEnv } from "@/env-client";
import { formatDuration } from "@/util/formatDuration";

const MULTIPLIER_JWT_SECRET_KEY = new TextEncoder().encode(
  env.MULTIPLIER_JWT_SECRET
);

const TWEET_AGE_LIMIT = 30 * 60 * 1000; // 30 minutes in milliseconds

function getTimestampFromTweetId(tweetId: string): number {
  try {
    // Convert to BigInt without using literals to support ES2019 and below
    const timestamp = Number(
      (BigInt(tweetId) >> BigInt(22)) + BigInt(1288834974657)
    );
    return timestamp;
  } catch (error) {
    console.error("Error converting tweet ID to timestamp:", error);
    throw error;
  }
}

// Function to expand t.co URLs
async function expandShortUrl(shortUrl: string): Promise<string> {
  try {
    const response = await fetch(shortUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const text = await response.text();

    // Try to extract URL from the JavaScript redirect
    const jsMatch = text.match(/location\.replace\("([^"]+)"\)/);
    if (jsMatch && jsMatch[1]) {
      return jsMatch[1].replace(/\\/g, ""); // Remove escape characters
    }

    // Fallback to meta refresh if JS redirect isn't found
    const metaMatch = text.match(/content="0;URL=([^"]+)"/);
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1];
    }

    // If neither is found, return the original URL
    return shortUrl;
  } catch (error) {
    console.error("URL expansion error:", error);
    throw new Error("Failed to expand shortened URL");
  }
}

export async function POST(request: Request) {
  try {
    const { chainId, tweetUrl } = await request.json();

    if (!tweetUrl) {
      return NextResponse.json(
        { error: "Tweet URL is required." },
        { status: 400 }
      );
    }

    // Extract username from URL first
    const usernameMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/([^\/]+)/i);
    if (!usernameMatch) {
      return NextResponse.json(
        { error: "Invalid tweet URL format." },
        { status: 400 }
      );
    }

    const username = usernameMatch[1].toLowerCase();

    // Check with faucet API if this X/Twitter user is rate limited
    const rateCheckResponse = await fetch(
      `${clientEnv.NEXT_PUBLIC_FAUCET_API_URL}/api/check-tweet-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chainId, username }),
      }
    );

    if (!rateCheckResponse.ok) {
      const errorData = await rateCheckResponse.json();
      return NextResponse.json(
        {
          error:
            errorData.error ||
            "This X/Twitter account has already been used in the past 24 hours.",
          isEligibleForMultiplier: false,
        },
        { status: 400 }
      );
    }

    // Extract tweet ID and verify age
    const tweetId = tweetUrl.match(/status\/(\d+)/)?.[1];
    if (!tweetId) {
      return NextResponse.json(
        { error: "Invalid tweet URL format." },
        { status: 400 }
      );
    }

    const timestamp = getTimestampFromTweetId(tweetId);
    const tweetAge = Date.now() - timestamp;

    if (tweetAge > TWEET_AGE_LIMIT) {
      const ageInSeconds = Math.floor(tweetAge / 1000);
      return NextResponse.json(
        {
          error: `Tweet is ${formatDuration(ageInSeconds)} old. Must be less than 30 minutes old for the multiplier bonus.`,
          isEligibleForMultiplier: false,
        },
        { status: 400 }
      );
    }

    // Normalize the URL: ensure https:// and convert x.com to twitter.com
    const normalizedUrl = tweetUrl.match(/^https?:\/\//)
      ? tweetUrl
      : `https://${tweetUrl}`;

    const xUrl = normalizedUrl.replace(
      /^https?:\/\/((?:www\.)?twitter\.com\/)/,
      "https://x.com/"
    );

    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(xUrl)}`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error("Failed to validate tweet.");
    }

    const data = await response.json();

    // Extract all t.co URLs from the tweet HTML
    const tcoUrlRegex = /https?:\/\/t\.co\/[a-zA-Z0-9]+/g;
    const shortUrls = Array.from(
      new Set<string>(data.html.match(tcoUrlRegex) || [])
    );

    // Expand all unique t.co URLs in parallel
    const expandedUrls = await Promise.all(
      shortUrls.map((url) => expandShortUrl(url))
    );

    // Convert to lowercase for case-insensitive matching
    const expandedUrlsLower = expandedUrls.map((url) => url.toLowerCase());

    // Check if any of the expanded URLs match our criteria
    const hasMainDomain = expandedUrlsLower.some((url) =>
      url.includes("inkonchain.com")
    );

    const hasFaucetPath = expandedUrlsLower.some(
      (url) =>
        url.includes("inkonchain.com/faucet") ||
        /inkonchain\.com\/[a-z-]+\/faucet/.test(url)
    );

    const validatedData = {
      html: data.html,
      author_name: data.author_name,
      author_url: data.author_url,
      type: data.type,
      isEligibleForMultiplier: hasMainDomain && hasFaucetPath,
      multiplierToken: "",
    };

    if (validatedData.isEligibleForMultiplier) {
      // Create a short-lived JWT (e.g., 5 minutes)
      const multiplierToken = await new SignJWT({
        tweetUrl,
        authorName: data.author_name,
        multiplier: 2,
        tweetId,
        timestamp,
        username,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(MULTIPLIER_JWT_SECRET_KEY);

      validatedData.multiplierToken = multiplierToken;
    }

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error("Tweet validation error:", error);
    return NextResponse.json(
      {
        error: "Invalid tweet URL.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
