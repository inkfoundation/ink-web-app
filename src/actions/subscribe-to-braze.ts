"use server";

import { clientEnv } from "@/env-client";
import {
  subscribeUserToGroup,
  SubscriptionGroup,
  SubscriptionStatus,
  updateEmailStatus,
} from "@/integrations/braze";
import { validateCaptcha } from "@/lib/hcaptcha";
import { isValidEmail } from "@/util/validation";

interface FormState {
  success: boolean;
  error?: {
    form?: string;
    email?: string;
  };
}

export async function subscribeToWaitlists(
  prevState: FormState,
  formData: FormData
) {
  return subscribeToBrazeGroups(prevState, formData, [
    ...(formData.has("subscribe-general-list")
      ? [SubscriptionGroup.GENERAL_WAITLIST]
      : []),
    ...(formData.has("subscribe-builder-list")
      ? [SubscriptionGroup.DEVELOPER_WAITLIST]
      : []),
  ]);
}

export async function subscribeToGeneralWaitlist(
  prevState: FormState,
  formData: FormData
) {
  return subscribeToBrazeGroups(prevState, formData, [
    SubscriptionGroup.GENERAL_WAITLIST,
  ]);
}

export async function subscribeToDeveloperWaitlist(
  prevState: FormState,
  formData: FormData
) {
  return subscribeToBrazeGroups(prevState, formData, [
    SubscriptionGroup.DEVELOPER_WAITLIST,
  ]);
}

async function subscribeToBrazeGroups(
  _prevState: FormState,
  formData: FormData,
  subscriptionGroups: SubscriptionGroup[]
) {
  const email = formData.get("email");
  const captchaToken = formData.get("captchaToken");

  if (!clientEnv.NEXT_PUBLIC_DISABLE_CAPTCHA) {
    if (!captchaToken || typeof captchaToken !== "string") {
      return {
        error: {
          form: "Captcha verification required",
        },
        success: false,
      };
    }

    const isCaptchaValid = await validateCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return {
        error: {
          form: "Captcha verification failed",
        },
        success: false,
      };
    }
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return {
      error: {
        email: "Enter a valid email address",
      },
      success: false,
    };
  }

  if (subscriptionGroups.length === 0) {
    return {
      error: {
        form: "No waitlists selected",
      },
      success: false,
    };
  }

  try {
    await Promise.all(
      subscriptionGroups.map((group) => {
        return subscribeUserToGroup(email, group);
      })
    );
    await updateEmailStatus(email, SubscriptionStatus.SUBSCRIBED);
    return {
      error: undefined,
      success: true,
    };
  } catch {
    return {
      error: {
        form: "Issue submitting form",
      },
      success: false,
    };
  }
}
