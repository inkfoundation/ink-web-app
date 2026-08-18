import { z } from "zod";

import { isSquareAspectRatio } from "@/util/validation";

const noXSSCharacters = (val: string) => !/[<>&'"]/g.test(val);
const xssErrorMessage = "Input contains invalid characters";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
// Vercel rejects server action payloads over 4.5MB at the platform layer,
// before Next.js runs, and the failure is silent (the form just hangs). Keep
// the total payload guard comfortably below that so users get a clear error.
const MAX_PAYLOAD_BYTES = 4.25 * 1024 * 1024;

export const appSubmissionSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(1, "Name is required")
      .max(50, "Name must be less than 50 characters")
      .refine(noXSSCharacters, xssErrorMessage),
    shortDescription: z
      .string({
        required_error: "Description is required",
      })
      .min(1, "Description is required")
      .max(200, "Description must be less than 200 characters")
      .refine(noXSSCharacters, xssErrorMessage),
    categories: z
      .array(
        z.enum(
          [
            "Bridge",
            "DeFi",
            "Explorers",
            "Infra",
            "Social",
            "On-ramps",
            "Other",
          ],
          {
            errorMap: () => ({ message: "Please select valid categories" }),
          }
        )
      )
      .min(1, "Select at least one category"),
    network: z.enum(["Mainnet", "Testnet", "Both"], {
      errorMap: () => ({ message: "Please select a valid network" }),
    }),
    tags: z
      .array(
        z.enum(
          [
            "cross-chain",
            "data",
            "dex",
            "domain names",
            "explorer",
            "faucet",
            "fun",
            "funding",
            "interop",
            "lending",
            "nfts",
            "oracle",
            "rpc",
            "security",
            "tokens",
            "tools",
            "wallet",
            "yield",
          ],
          {
            errorMap: () => ({ message: "Please select valid tags" }),
          }
        )
      )
      .min(1, "Select at least one tag"),
    iconFile: z
      .any()
      .refine((file) => {
        // Skip validation on the server side
        if (typeof window === "undefined") return true;

        // Browser-side validation
        if (!(file instanceof File)) return false;
        if (file.size === 0) return false;
        if (!file.type.startsWith("image/")) return false;
        if (file.size > MAX_IMAGE_BYTES) return false;

        return true;
      }, "Please provide an image file less than 4MB")
      .refine((file) => {
        // Skip validation on the server side
        if (typeof window === "undefined") return true;

        // Check aspect ratio
        return new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve(isSquareAspectRatio(img.width, img.height));
          };
          img.onerror = () => resolve(false);
          img.src = URL.createObjectURL(file);
        });
      }, "Image must have a square (1:1) aspect ratio"),
    mainnetWebsite: z
      .string({
        required_error: "The website URL is required",
      })
      .min(1, "Website URL is required")
      .refine((val) => val.match(/^https?:\/\/.+/), "Please enter a valid URL")
      .refine(noXSSCharacters, xssErrorMessage),
    testnetWebsite: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.match(/^https?:\/\/.+/),
        "Please enter a valid URL"
      )
      .refine((val) => !val || noXSSCharacters(val), xssErrorMessage),
    x: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          val.match(/^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/.+/),
        "Please enter a valid X (Twitter) URL (e.g., https://x.com/username)"
      )
      .refine((val) => !val || noXSSCharacters(val), xssErrorMessage),
    discord: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val || val.match(/^https?:\/\/(?:www\.)?discord\.(?:gg|com)\/.+/),
        "Please enter a valid Discord invite URL (e.g., https://discord.gg/invite)"
      )
      .refine((val) => !val || noXSSCharacters(val), xssErrorMessage),
    telegram: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.match(/^https?:\/\/(?:www\.)?t\.me\/.+/),
        "Please enter a valid Telegram URL (e.g., https://t.me/username)"
      )
      .refine((val) => !val || noXSSCharacters(val), xssErrorMessage),
    github: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.match(/^https?:\/\/(?:www\.)?github\.com\/.+/),
        "Please enter a valid GitHub URL (e.g., https://github.com/username)"
      )
      .refine((val) => !val || noXSSCharacters(val), xssErrorMessage),
    farcaster: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.match(/^https?:\/\/(?:www\.)?warpcast\.com\/.+/),
        "Please enter a valid Farcaster URL (e.g., https://warpcast.com/username)"
      )
      .refine((val) => !val || noXSSCharacters(val), xssErrorMessage),
    smartContractUrl: z
      .string()
      .optional()
      .refine((val) => !val || noXSSCharacters(val), xssErrorMessage),
    captchaToken: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.smartContractUrl) return true; // Optional field

      const mainnetPattern =
        /^https:\/\/explorer\.inkonchain\.com\/address\/0x[a-fA-F0-9]{40}$/;
      const testnetPattern =
        /^https:\/\/explorer-sepolia\.inkonchain\.com\/address\/0x[a-fA-F0-9]{40}$/;

      if (data.network === "Testnet") {
        return testnetPattern.test(data.smartContractUrl);
      } else if (data.network === "Mainnet") {
        return mainnetPattern.test(data.smartContractUrl);
      } else if (data.network === "Both") {
        return (
          mainnetPattern.test(data.smartContractUrl) ||
          testnetPattern.test(data.smartContractUrl)
        );
      }

      return false;
    },
    {
      message: "Please enter a valid contract URL for the selected network",
      path: ["smartContractUrl"],
    }
  )
  .superRefine((data, ctx) => {
    // Browser-only guard against the platform payload limit (see
    // MAX_PAYLOAD_BYTES above); the image dominates, text fields are tiny.
    if (typeof window === "undefined") return;

    const fileBytes = data.iconFile instanceof File ? data.iconFile.size : 0;
    const textBytes = Object.values(data).reduce<number>(
      (sum, value) => (typeof value === "string" ? sum + value.length : sum),
      0
    );

    if (fileBytes + textBytes > MAX_PAYLOAD_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["iconFile"],
        message:
          "Submission is too large to upload — please use a smaller image",
      });
    }
  });

export type AppSubmissionFormData = z.infer<typeof appSubmissionSchema>;
export type CategoryValue = z.infer<
  typeof appSubmissionSchema
>["categories"][number];
export type TagValue = z.infer<typeof appSubmissionSchema>["tags"][number];
