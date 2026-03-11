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

export async function resubscribeToBraze(
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

  // Check if user was fully unsubscribed before making changes
  let wasUserFullyUnsubscribed = false;
  try {
    const { users } = await listUserSubscriptionGroups(
      brazeId,
      email as string
    );

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
