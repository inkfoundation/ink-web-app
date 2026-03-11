"use server";

import {
  changeUserSubscriptionGroupStatus,
  listUserSubscriptionGroups,
  SubscriptionGroup,
  SubscriptionStatus,
  updateEmailStatusById,
} from "@/integrations/braze";

interface FormState {
  success: boolean;
  error?: string;
}

export async function unsubscribeFromBraze(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const brazeId = formData.get("brazeId");
  const email = formData.get("email");
  const generalWailist = formData.get("generalWailist");
  const developerWailist = formData.get("developerWailist");

  if (!brazeId || typeof brazeId !== "string") {
    return {
      error: "Issue submitting form",
      success: false,
    };
  }

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

  const { users } = await listUserSubscriptionGroups(brazeId, email as string);

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
