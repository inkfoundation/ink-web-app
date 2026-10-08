"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  InkIcon,
  Input,
  Modal,
  useModalContext,
} from "@inkonchain/ink-kit";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CloudflareProvider, getAddress } from "ethers";
import { useAccount } from "wagmi";

import { Backdrop } from "@/components/Backdrop";
import { ColoredText } from "@/components/ColoredText";
import { useCaptcha } from "@/contexts/CaptchaProvider";
import { clientEnv } from "@/env-client";

interface FaucetRequestButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onChange: (value: boolean | null) => void;
  address: string;
}

const validateTweetUrl = (url: string) => {
  // First, add https:// to URLs that don't start with http:// or https://
  const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

  // Updated regex to match both x.com and twitter.com URLs with status/ID pattern
  const tweetRegex =
    /^https?:\/\/((?:www\.)?(x|twitter)\.com)\/\w+\/status\/\d+/;
  return tweetRegex.test(normalizedUrl);
};

const validateTweetWithApi = async (chainId: number, tweetUrl: string) => {
  try {
    const response = await fetch("/api/validate-tweet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chainId, tweetUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.error || response.statusText);
    }

    const data = await response.json();
    return {
      isValid: data.isEligibleForMultiplier,
      multiplierToken: data.multiplierToken,
    };
  } catch (error) {
    console.error("Tweet validation error:", error);
    throw error;
  }
};

const validateAndProcessTweet = async (chainId: number, tweetUrl: string) => {
  // Step 1: Regex validation
  if (!tweetUrl || !validateTweetUrl(tweetUrl)) {
    throw new Error("Please provide a valid X/Twitter post URL.");
  }

  // Step 2: API validation
  const { isValid, multiplierToken } = await validateTweetWithApi(
    chainId,
    tweetUrl
  );
  if (!isValid) {
    throw new Error(
      "Tweet must include our faucet URL to be eligible for 2x bonus."
    );
  }

  // Store token
  localStorage.setItem("multiplierToken", multiplierToken);
  return true;
};

const TOAST_STYLE = { className: "dark:text-white text-black" };

const resolveAddress = async (address: string): Promise<string> => {
  // Handle ENS resolution
  if (address.endsWith(".eth")) {
    try {
      const provider = new CloudflareProvider();
      const resolved = await provider.resolveName(address);
      if (!resolved) {
        throw new Error("Invalid ENS name.");
      }
      return resolved;
    } catch (error) {
      throw error;
    }
  }

  // Validate the address format
  try {
    return getAddress(address);
  } catch (error) {
    throw error;
  }
};

const TWEET_TEMPLATES = [
  "Loading up on free #Ink Sepolia ETH using @inkonchain's faucet💧. Check it out if you're building on #Kraken's L2!",
  "Just stocked up on #Ink Sepolia ETH with @inkonchain's faucet. Perfect for testing on #Kraken's L2! ⚙️",
  "Smooth experience using @inkonchain's faucet. Ready to stress test 1 second block times on #Kraken's #Ink. 🔧",
  "Just received #Ink Sepolia ETH from @inkonchain's faucet 🔥. Time to test out #Kraken's L2. 💪",
  "Grabbing some #Ink Sepolia ETH from @inkonchain's faucet 🚀. Ready to build on #Kraken's L2.",
];

const TWEET_PARAMS = {
  url: "https://inkonchain.com/faucet",
  image: "https://inkonchain.com/faucet.png",
};

const getRandomTweetTemplate = () => {
  const randomIndex = Math.floor(Math.random() * TWEET_TEMPLATES.length);
  return TWEET_TEMPLATES[randomIndex];
};

export const FaucetRequestButton: React.FC<FaucetRequestButtonProps> = ({
  disabled,
  children,
  type = "button",
  onChange,
  address,
}) => {
  const chainId = 763373; // Ink Sepolia
  const [requestLoading, setRequestLoading] = useState(false);
  const [waitingForConnection, setWaitingForConnection] = useState(false);
  const hasAutoRequested = useRef(false);
  const { isReady, executeHCaptcha } = useCaptcha();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [tweetUrl, setTweetUrl] = useState("");
  const [isHCaptchaVisible, setIsHCaptchaVisible] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [skipTweetPrompt, setSkipTweetPrompt] = useState(false);
  const [tweetModalLoading, setTweetModalLoading] = useState(false);
  const modalId = "tweet-prompt-modal";
  const { openModal: openTweetPrompt } = useModalContext(modalId);

  const handleRequest = useCallback(
    async (forceSkip?: boolean, setLoading = setRequestLoading) => {
      setLoading(true);

      if (!isConnected && address.trim() === "" && openConnectModal) {
        setWaitingForConnection(true);
        openConnectModal();
        setLoading(false);
        return;
      }

      if (address.trim() === "") {
        toast.error("Please enter an address or ENS name first.", {
          toastId: "address-error",
          ...TOAST_STYLE,
        });
        setLoading(false);
        return;
      }

      let resolvedAddress: string;
      try {
        resolvedAddress = await resolveAddress(address);
      } catch (error) {
        toast.error((error as Error).message, TOAST_STYLE);
        setLoading(false);
        return;
      }

      try {
        // Check rate limit first
        const rateLimitRes = await fetch(
          `${clientEnv.NEXT_PUBLIC_FAUCET_API_URL}/api/check-rate-limit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ address: resolvedAddress, chainId }),
          }
        );

        if (!rateLimitRes.ok) {
          const errorData = await rateLimitRes.json();
          toast.error(
            <>
              <span
                style={{
                  color: "inherit",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {errorData.message ??
                  "Faucet is temporarily unavailable. Please try again later."}
              </span>
              <span style={{ color: "inherit" }}>
                See{" "}
                <a
                  href="https://docs.inkonchain.com/quick-start/faucets"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#60A5FA", textDecoration: "underline" }}
                >
                  docs.inkonchain.com
                </a>{" "}
                for other faucet options.
              </span>
            </>,
            TOAST_STYLE
          );
          setLoading(false);
          return;
        }

        const rateLimitData = await rateLimitRes.json();

        if (!rateLimitData.allowed) {
          toast.error(
            <>
              <span
                style={{
                  color: "inherit",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {rateLimitData.message ??
                  "Faucet is temporarily unavailable. Please try again later."}
              </span>
              <span style={{ color: "inherit" }}>
                See{" "}
                <a
                  href="https://docs.inkonchain.com/quick-start/faucets"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#60A5FA", textDecoration: "underline" }}
                >
                  docs.inkonchain.com
                </a>{" "}
                for other faucet options.
              </span>
            </>,
            TOAST_STYLE
          );
          setLoading(false);
          return;
        }

        if (forceSkip) {
          setTweetUrl("");
        } else if (!tweetUrl && !skipTweetPrompt) {
          setLoading(false);
          openTweetPrompt();
          return;
        } else if (tweetUrl && !validateTweetUrl(tweetUrl)) {
          toast.error(
            "Please provide a valid X/Twitter post URL.",
            TOAST_STYLE
          );
          setLoading(false);
          return;
        }

        // If not rate limited, proceed with captcha verification
        let hcaptchaToken: string | undefined;
        if (isReady) {
          try {
            setIsHCaptchaVisible(true);

            // Small delay before showing backdrop
            setTimeout(() => {
              setShowBackdrop(true);
            }, 600);

            const captcha = await executeHCaptcha();
            hcaptchaToken = captcha.response;

            setShowBackdrop(false);
            setIsHCaptchaVisible(false);
          } catch (error) {
            setShowBackdrop(false);
            setIsHCaptchaVisible(false);
            console.error("hCaptcha execution error:", error);
            toast.error("Failed to verify captcha.", TOAST_STYLE);
            setLoading(false);
            return;
          }
        } else {
          console.warn("hCaptcha not loaded or not ready");
          toast.warning("hCaptcha not ready. Please try again.", TOAST_STYLE);
          setLoading(false);
          return;
        }

        // If captcha is solved, proceed with the claim
        const res = await fetch(
          `${clientEnv.NEXT_PUBLIC_FAUCET_API_URL}/api/claim`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: resolvedAddress,
              chainId,
              hcaptchaToken,
              multiplierToken: localStorage.getItem("multiplierToken"),
            }),
          }
        );

        const responseData = await res.json();

        await onChange(true);

        res.ok
          ? toast.success(
              `🎉 Testnet ETH successfully claimed! Enjoy!`,
              TOAST_STYLE
            )
          : toast.error(`${responseData.message}`, TOAST_STYLE);
      } catch (error) {
        console.error("Request error:", error);
        await onChange(false);
        toast.error(
          `${error instanceof Error ? error.message : "❌ Failed to claim testnet ETH. Please try again."}`,
          TOAST_STYLE
        );
      } finally {
        localStorage.removeItem("multiplierToken");
        setLoading(false);
        setSkipTweetPrompt(false);
        setTweetUrl("");
      }
    },
    [
      address,
      isConnected,
      openConnectModal,
      onChange,
      isReady,
      executeHCaptcha,
      tweetUrl,
      skipTweetPrompt,
      setTweetUrl,
      openTweetPrompt,
    ]
  );

  // Watch for connection success and address being populated
  useEffect(() => {
    if (
      waitingForConnection &&
      isConnected &&
      address &&
      !hasAutoRequested.current
    ) {
      setWaitingForConnection(false);
      hasAutoRequested.current = true;
      handleRequest();
    }
  }, [isConnected, waitingForConnection, address, handleRequest]);

  // Reset auto-request flag when address changes
  useEffect(() => {
    hasAutoRequested.current = false;
  }, [address]);

  return (
    <>
      <Button
        onClick={(e) => {
          e.preventDefault(); // Prevent form submission
          handleRequest(false, setRequestLoading);
        }}
        disabled={requestLoading || disabled}
        type={type}
        variant="primary"
        size="md"
      >
        {requestLoading ? "Requesting..." : children}
      </Button>

      {isHCaptchaVisible && (
        <Backdrop
          isVisible={showBackdrop}
          onClick={() => {
            const closeButton = document.querySelector(
              'iframe[title="close"]'
            ) as HTMLIFrameElement;
            if (closeButton) {
              closeButton.click();
            }
          }}
        />
      )}

      <Modal title="Share a tweet!" id={modalId} hasBackdrop>
        {({ closeModal }) => (
          <div className="flex flex-col gap-8 items-center w-full p-8">
            <div className="flex flex-col gap-4 items-center">
              <ColoredText
                variant="purple"
                className="text-2xl text-center font-medium"
              >
                Share a tweet for a 2x bonus!
              </ColoredText>
              <p className="text-body text-center">
                Tweet about our faucet and include the faucet URL to get 2x more
                testnet ETH.
              </p>
            </div>

            <div className="flex flex-col items-center -my-2">
              <Button
                type="button"
                onClick={() => {
                  const tweetText = getRandomTweetTemplate();
                  const shareUrl = new URL("https://x.com/intent/tweet");
                  shareUrl.searchParams.set("text", tweetText);
                  shareUrl.searchParams.set("url", TWEET_PARAMS.url);
                  shareUrl.searchParams.set("cards", "summary_large_image");
                  window.open(shareUrl.toString(), "_blank");
                }}
                variant="primary"
                size="md"
                disabled={tweetModalLoading}
              >
                Generate Tweet
              </Button>
            </div>

            <Input
              className={
                tweetUrl !== "" && !validateTweetUrl(tweetUrl)
                  ? "ink:border-status-error"
                  : ""
              }
              value={tweetUrl}
              iconRight={<InkIcon.Social.X />}
              onChange={(e) => setTweetUrl(e.target.value)}
              placeholder="Paste your tweet URL here"
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  try {
                    await validateAndProcessTweet(chainId, tweetUrl);
                    handleRequest(false, setTweetModalLoading);
                    closeModal();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Failed to validate tweet. Please try again.",
                      TOAST_STYLE
                    );
                  }
                }
              }}
            />

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  closeModal();
                  setSkipTweetPrompt(true);
                  handleRequest(true, setTweetModalLoading);
                }}
                variant="secondary"
                size="md"
                disabled={tweetModalLoading}
              >
                Skip
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await validateAndProcessTweet(chainId, tweetUrl);
                    handleRequest(false, setTweetModalLoading);
                    closeModal();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Failed to validate tweet. Please try again.",
                      TOAST_STYLE
                    );
                  }
                }}
                variant="primary"
                size="md"
                disabled={tweetModalLoading}
              >
                {tweetModalLoading ? "Processing..." : "Continue"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

FaucetRequestButton.displayName = "FaucetRequestButton";
