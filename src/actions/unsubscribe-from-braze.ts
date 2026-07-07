"use server";

import {
  changeUserSubscriptionGroupStatus,
  listUserSubscriptionGroups,
  SubscriptionGroup,
  SubscriptionStatus,
  updateEmailStatusById,
} from "@/integrations/braze";
import { validateUnsubscribeToken } from "@/lib/unsubscribe-token";

interface FormState {
  success: boolean;
  error?: string;
}

export async function unsubscribeFromBraze(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // The `brazeId`/`email` identifying which user to mutate must come from a
  // signed token, not from raw form fields — otherwise anyone who learns a
  // Braze ID (exposed by Braze pixels/SDK) can unsubscribe arbitrary users.
  const token = formData.get("token");
  const generalWailist = formData.get("generalWailist");
  const developerWailist = formData.get("developerWailist");

  if (!token || typeof token !== "string") {
    return {
      error: "Issue submitting form",
      success: false,
    };
  }

  const payload = await validateUnsubscribeToken(token);
  if (!payload) {
    return {
      error: "Issue submitting form",
      success: false,
    };
  }

  const { brazeId, email } = payload;

  if (generalWailist !== "on" && developerWailist !== "on") {
    return {
      error: "Make sure to select at least one of the waitlists",
      success: false,
    };
  }

  if (generalWailist === "on") {
    try {
      await changeUserSubscriptionGroupStatus(
        brazeId,
        SubscriptionGroup.GENERAL_WAITLIST,
        SubscriptionStatus.UNSUBSCRIBED
      );
    } catch {
      return {
        success: false,
        error: "Issue submitting form",
      };
    }
  }

  if (developerWailist === "on") {
    try {
      await changeUserSubscriptionGroupStatus(
        brazeId,
        SubscriptionGroup.DEVELOPER_WAITLIST,
        SubscriptionStatus.UNSUBSCRIBED
      );
    } catch {
      return {
        success: false,
        error: "Issue submitting form",
      };
    }
  }

  const { users } = await listUserSubscriptionGroups(brazeId, email);

  if (!users || users.length === 0) {
    return {
      error: "Could not update your preferences",
      success: false,
    };
  }

  const isUserUnsubscribedFromAllGroups = users[0].subscription_groups.every(
    ({ status }) =>
      status.toLowerCase() === SubscriptionStatus.UNSUBSCRIBED.toLowerCase()
  );

  if (isUserUnsubscribedFromAllGroups) {
    try {
      await updateEmailStatusById(brazeId, SubscriptionStatus.UNSUBSCRIBED);
    } catch {
      return {
        success: false,
        error: "Issue submitting form",
      };
    }
  }

  return {
    success: true,
    error: undefined,
  };
}
