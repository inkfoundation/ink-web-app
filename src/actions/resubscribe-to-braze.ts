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

export async function resubscribeToBraze(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // The `brazeId`/`email` identifying which user to mutate must come from a
  // signed token, not from raw form fields — otherwise anyone who learns a
  // Braze ID (exposed by Braze pixels/SDK) can resubscribe arbitrary users.
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

  // Check if user was fully unsubscribed before making changes
  let wasUserFullyUnsubscribed = false;
  try {
    const { users } = await listUserSubscriptionGroups(brazeId, email);

    if (users && users.length > 0) {
      wasUserFullyUnsubscribed = users[0].subscription_groups.every(
        ({ status }) =>
          status.toLowerCase() === SubscriptionStatus.UNSUBSCRIBED.toLowerCase()
      );
    }
  } catch {
    wasUserFullyUnsubscribed = false;
  }

  if (generalWailist === "on") {
    try {
      await changeUserSubscriptionGroupStatus(
        brazeId,
        SubscriptionGroup.GENERAL_WAITLIST,
        SubscriptionStatus.SUBSCRIBED
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
        SubscriptionStatus.SUBSCRIBED
      );
    } catch {
      return {
        success: false,
        error: "Issue submitting form",
      };
    }
  }

  // Update email status only if user was fully unsubscribed
  if (wasUserFullyUnsubscribed) {
    try {
      await updateEmailStatusById(brazeId, SubscriptionStatus.SUBSCRIBED);
    } catch {
      // If email status update fails, don't fail the entire operation
    }
  }

  return {
    success: true,
    error: undefined,
  };
}
