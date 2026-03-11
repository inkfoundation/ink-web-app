"use server";

import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { WebClient } from "@slack/web-api";
import sharp from "sharp";

import { InkApp } from "@/app/[locale]/apps/_components/InkApp";
import { env } from "@/env";
import { captureError } from "@/integrations/sentry";
import { validateCaptcha } from "@/lib/hcaptcha";
import {
  AppSubmissionFormData,
  appSubmissionSchema,
} from "@/schemas/app-submission-schema";
import { isSquareAspectRatio } from "@/util/validation";

const {
  INK_APP_SUBMISSION_BOT_GITHUB_APP_ID,
  INK_APP_SUBMISSION_BOT_GITHUB_INSTALLATION_ID,
  INK_APP_SUBMISSION_BOT_GITHUB_PRIVATE_KEY,
  INK_APP_SUBMISSION_SLACK_BOT_TOKEN,
  INK_APP_SUBMISSION_SLACK_NOTIFICATION_CHANNEL,
  INK_APP_SUBMISSION_TARGET_BRANCH,
  INK_APP_SUBMISSION_TARGET_ORG,
  INK_APP_SUBMISSION_TARGET_REPO,
} = env;

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: INK_APP_SUBMISSION_BOT_GITHUB_APP_ID,
    privateKey: INK_APP_SUBMISSION_BOT_GITHUB_PRIVATE_KEY,
    installationId: INK_APP_SUBMISSION_BOT_GITHUB_INSTALLATION_ID,
  },
});

const slackClient = new WebClient(INK_APP_SUBMISSION_SLACK_BOT_TOKEN);

const GITHUB_CONFIG = {
  OWNER: INK_APP_SUBMISSION_TARGET_ORG,
  REPO: INK_APP_SUBMISSION_TARGET_REPO,
  FILE_PATH: "src/app/[locale]/apps/_components/apps-data.json",
  BRANCH: INK_APP_SUBMISSION_TARGET_BRANCH,
} as const;

const SLACK_CONFIG = {
  CHANNEL: INK_APP_SUBMISSION_SLACK_NOTIFICATION_CHANNEL,
} as const;

interface ImageValidationSuccess {
  isValid: true;
  webpBuffer: Buffer;
}

interface ImageValidationError {
  isValid: false;
  error: string;
}

type ImageValidationResult = ImageValidationSuccess | ImageValidationError;

async function validateAndConvertImage(
  file: File
): Promise<ImageValidationResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return {
        isValid: false,
        error: "Could not determine image dimensions",
      };
    }

    if (!isSquareAspectRatio(metadata.width, metadata.height)) {
      return {
        isValid: false,
        error: "Image must have a 1:1 aspect ratio",
      };
    }

    // Resize to 400x400 if needed and convert to WebP
    const webpBuffer = await image
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .webp({
        quality: 80, // 0-100, higher is better quality but larger file
        lossless: false,
        effort: 6, // 0-6, higher means more compression but slower
      })
      .toBuffer();

    return {
      isValid: true,
      webpBuffer,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    captureError(error);
    return {
      isValid: false,
      error: "Failed to process image",
    };
  }
}

export type FormState = {
  success: boolean;
  message: string;
  fields?: AppSubmissionFormData;
  issues?: string[];
  prUrl?: string;
};

interface ValidationSuccess {
  isValid: true;
  data: {
    formData: AppSubmissionFormData;
    webpBuffer: Buffer;
  };
}

interface ValidationError {
  isValid: false;
  error: {
    message: string;
    fields?: AppSubmissionFormData;
    issues?: string[];
  };
}

type ValidationResult = ValidationSuccess | ValidationError;

function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, "") // Remove < and > characters
    .replace(/[&'"]/g, "") // Remove potentially dangerous characters
    .trim();
}

function formatAppId(name: string): string {
  const sanitized = sanitizeString(name);
  return sanitized.toLowerCase().replace(/\s+/g, "-");
}

async function checkForDuplicateApp(appName: string): Promise<boolean> {
  const { data: fileData } = await octokit.repos.getContent({
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    path: GITHUB_CONFIG.FILE_PATH,
    ref: GITHUB_CONFIG.BRANCH,
  });

  if (!("content" in fileData)) {
    throw new Error("No content found in apps-data.json");
  }

  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  const { apps } = JSON.parse(content) as { apps: InkApp[] };

  return apps.some((app) => app.id === formatAppId(appName));
}

function formatAppData(
  parsedData: AppSubmissionFormData,
  fileName: string
): InkApp {
  const appId = formatAppId(parsedData.name);

  return {
    id: appId,
    name: sanitizeString(parsedData.name),
    description: sanitizeString(parsedData.shortDescription),
    imageUrl: `/featured-apps/icons/${fileName}`,
    category: parsedData.categories,
    network: parsedData.network,
    tags: parsedData.tags,
    links: {
      mainnetWebsite: sanitizeString(parsedData.mainnetWebsite),
      testnetWebsite: parsedData.testnetWebsite
        ? sanitizeString(parsedData.testnetWebsite)
        : sanitizeString(parsedData.mainnetWebsite),
      x: parsedData.x ? sanitizeString(parsedData.x) : "",
      discord: parsedData.discord ? sanitizeString(parsedData.discord) : "",
      telegram: parsedData.telegram ? sanitizeString(parsedData.telegram) : "",
      github: parsedData.github ? sanitizeString(parsedData.github) : "",
      farcaster: parsedData.farcaster
        ? sanitizeString(parsedData.farcaster)
        : "",
      smartContractUrl: parsedData.smartContractUrl
        ? sanitizeString(parsedData.smartContractUrl)
        : "",
    },
  };
}

async function validateSubmission(
  formData: AppSubmissionFormData
): Promise<ValidationResult> {
  const isCaptchaValid = await validateCaptcha(formData.captchaToken!);
  if (!isCaptchaValid) {
    return {
      isValid: false,
      error: {
        message: "Captcha verification failed",
        fields: formData,
      },
    };
  }

  const parsed = appSubmissionSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      isValid: false,
      error: {
        message: "Invalid form data",
        fields: formData,
        issues: parsed.error.issues.map((issue) => issue.message),
      },
    };
  }

  const isDuplicate = await checkForDuplicateApp(parsed.data.name);
  if (isDuplicate) {
    return {
      isValid: false,
      error: {
        message: `An app with the name "${parsed.data.name}" already exists. Please choose a different name.`,
        fields: formData,
      },
    };
  }

  const imageValidation = await validateAndConvertImage(parsed.data.iconFile);

  if (!imageValidation.isValid) {
    return {
      isValid: false,
      error: {
        message: "Invalid image format or dimensions",
        fields: {
          ...formData,
          iconFile: imageValidation.error,
        },
      },
    };
  }

  return {
    isValid: true,
    data: {
      formData: parsed.data,
      webpBuffer: imageValidation.webpBuffer,
    },
  };
}

function generatePrTitle(appName: string): string {
  const sanitized = sanitizeString(appName);
  return `[ink-app-submission-bot] feat: add ${sanitized} to the list of apps`;
}

async function createPullRequest(
  app: InkApp,
  webpBuffer: Buffer
): Promise<string> {
  const timestamp = Date.now();
  const branchName = `feat/app-submission-${app.id}-${timestamp}`;

  // 1. Get the latest commit from the base branch
  const mainRef = await octokit.git.getRef({
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    ref: `heads/${GITHUB_CONFIG.BRANCH}`,
  });

  // 2. Create blob for the image
  const imageBlob = await octokit.git.createBlob({
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    content: webpBuffer.toString("base64"),
    encoding: "base64",
  });

  // 3. Get and update apps-data.json content
  const { data: fileData } = await octokit.repos.getContent({
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    path: GITHUB_CONFIG.FILE_PATH,
    ref: GITHUB_CONFIG.BRANCH,
  });

  if (!("content" in fileData)) {
    throw new Error("No content found in apps-data.json");
  }

  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  const currentData = JSON.parse(content) as { apps: InkApp[] };
  const updatedContent = {
    apps: [...currentData.apps, app].sort((a, b) =>
      a.id.localeCompare(b.id, "en", { sensitivity: "base" })
    ),
  };

  // 4. Create a tree with both files
  const tree = await octokit.git.createTree({
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    base_tree: mainRef.data.object.sha,
    tree: [
      {
        path: `public/featured-apps/icons/${app.id}.webp`,
        mode: "100644",
        type: "blob",
        sha: imageBlob.data.sha, // Reference the blob we created
      },
      {
        path: GITHUB_CONFIG.FILE_PATH,
        mode: "100644",
        type: "blob",
        content: JSON.stringify(updatedContent, null, 2),
      },
    ],
  });

  // 5. Create a commit with both changes
  const commit = await octokit.git.createCommit({
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    message: `feat: add ${sanitizeString(app.name)} to apps list`,
    tree: tree.data.sha,
    parents: [mainRef.data.object.sha],
  });

  // 6. Create the new branch pointing to our commit
  await octokit.git.createRef({
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    ref: `refs/heads/${branchName}`,
    sha: commit.data.sha,
  });

  // 7. Create PR
  const pr = await octokit.pulls.create({
    owner: GITHUB_CONFIG.OWNER,
    repo: GITHUB_CONFIG.REPO,
    title: generatePrTitle(app.name),
    head: branchName,
    base: GITHUB_CONFIG.BRANCH,
    body: [
      `Adding \`${sanitizeString(app.name)}\` to the list of apps.`,
      "",
      "Before merging, review the preview URL and make sure:",
      "",
      "- [ ] App image is displayed correctly",
      "- [ ] App links all work well",
      "- [ ] App is not a duplicate entry",
      "- [ ] Category and tags are appropriate for the app",
      "- [ ] Network selection (Mainnet/Testnet/Both) matches the app's availability",
      "- [ ] Smart contract URL (if provided) is valid and matches the network",
      "- [ ] App is legitimate and safe for users",
    ].join("\n"),
  });

  return pr.data.html_url;
}

async function sendSlackNotification(
  app: InkApp,
  prUrl: string
): Promise<void> {
  // Build social links array first
  const socialLinksArray = [
    {
      text: "Website",
      emoji: ":globe_with_meridians:",
      url: app.links.mainnetWebsite,
    },
    { text: "X/Twitter", emoji: ":twitter-x-new:", url: app.links.x },
    { text: "Discord", emoji: ":discord1:", url: app.links.discord },
    { text: "Telegram", emoji: ":telegram:", url: app.links.telegram },
    { text: "Github", emoji: ":github:", url: app.links.github },
    { text: "Farcaster", emoji: ":farcaster:", url: app.links.farcaster },
    {
      text: "Contract",
      emoji: ":blockscout:",
      url: app.links.smartContractUrl,
    },
  ].filter((link) => link.url);

  // Format social links into one or two lines
  const formattedLinks =
    socialLinksArray.length > 4
      ? [
          socialLinksArray
            .slice(0, 4)
            .map((link) => `${link.emoji} <${link.url}|${link.text}>`)
            .join(" "),
          socialLinksArray
            .slice(4)
            .map((link) => `${link.emoji} <${link.url}|${link.text}>`)
            .join(" "),
        ].join("\n> ")
      : socialLinksArray
          .map((link) => `${link.emoji} <${link.url}|${link.text}>`)
          .join(" ");

  await slackClient.chat.postMessage({
    channel: SLACK_CONFIG.CHANNEL,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `:mr-open: <${prUrl}|${generatePrTitle(app.name)}>`,
            `> *${app.name}*`,
            `> ${app.description}`,
            `> ${formattedLinks}`,
          ].join("\n"),
        },
      },
    ],
    text: `New App Submission: ${app.name}`,
    unfurl_links: false,
    unfurl_media: false,
  });
}

export async function submitYourApp(
  _prevState: FormState,
  formData: AppSubmissionFormData
): Promise<FormState> {
  try {
    // 1. Validate submission
    const validation = await validateSubmission(formData);

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error.message,
        fields: validation.error.fields,
        issues: validation.error.issues,
      };
    }

    // 2. Format app data
    const appId = formatAppId(validation.data.formData.name);
    const fileName = `${appId}.webp`;
    const newApp = formatAppData(validation.data.formData, fileName);

    // 3. Create PR
    const prUrl = await createPullRequest(newApp, validation.data.webpBuffer);

    // 4. Send Slack notification
    try {
      await sendSlackNotification(newApp, prUrl);
    } catch (slackError) {
      console.error("Failed to send Slack notification:", slackError);
      captureError(slackError);
    }

    // 5. Return success with PR URL
    return {
      success: true,
      message: `Successfully submitted app. View the pull request at: ${prUrl}`,
      prUrl: prUrl,
    };
  } catch (error) {
    console.error(error);
    captureError(error);
    return { success: false, message: "Failed to submit app" };
  }
}
