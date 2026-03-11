import { env } from "@/env";
import { clientEnv } from "@/env-client";

interface HCaptchaVerifyResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  credit?: boolean;
  "error-codes"?: string[];
}

export async function validateCaptcha(token: string): Promise<boolean> {
  if (clientEnv.NEXT_PUBLIC_DISABLE_CAPTCHA) {
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", env.HCAPTCHA_SECRET);
    formData.append("response", token);

    const response = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      console.error("hCaptcha API error:", response.statusText);
      return false;
    }

    const data: HCaptchaVerifyResponse = await response.json();

    if (!data.success) {
      console.error("hCaptcha verification failed:", data["error-codes"]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("hCaptcha verification error:", error);
    return false;
  }
}
