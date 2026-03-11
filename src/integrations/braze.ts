import { randomUUID } from "crypto";

import { env } from "@/env";
import { CustomError, ErrorCode } from "@/util/custom-error";

import { captureError } from "./sentry";

type BrazeUser = {
  email: string;
  external_id: string;
  braze_id: string;
};

export enum SubscriptionGroup {
  GENERAL_WAITLIST = "general_waitlist",
  DEVELOPER_WAITLIST = "developer_newsletter",
}

export enum SubscriptionStatus {
  SUBSCRIBED = "subscribed",
  UNSUBSCRIBED = "unsubscribed",
}

export async function subscribeUserToGroup(
  email: string,
  subscriptionGroup: SubscriptionGroup
) {
  try {
    const user = await retrieveUserByEmail(email);
    const data = {
      attributes: [
        {
          email: !user ? email : undefined,
          external_id: !user ? randomUUID() : user.external_id, // update the existing user if already present
          subscription_state: "opted_in",
          subscription_groups: [
            {
              subscription_group_id: getSubscriptionGroupId(subscriptionGroup),
              subscription_state: SubscriptionStatus.SUBSCRIBED,
            },
          ],
        },
      ],
    };

    await postToBraze("/users/track", data);
  } catch (error: unknown) {
    captureError(
      new CustomError({
        status: 500,
        code: ErrorCode.Braze,
        message: "subscribeToBraze: Could not subscribe user to group",
        extra: {
          subscriptionGroup,
        },
        causeError: error,
      })
    );

    throw error;
  }
}

function getSubscriptionGroupId(group: SubscriptionGroup) {
  if (group === SubscriptionGroup.DEVELOPER_WAITLIST) {
    return env.BRAZE_DEVELOPERS_WAITLIST_GROUP_ID;
  }

  if (group === SubscriptionGroup.GENERAL_WAITLIST) {
    return env.BRAZE_GENERAL_WAITLIST_GROUP_ID;
  }

  throw new Error(`Invalid subscription group ${group}`);
}

export async function changeUserSubscriptionGroupStatus(
  id: string,
  subscriptionGroup: SubscriptionGroup,
  newStatus: SubscriptionStatus
) {
  try {
    await postToBraze("/subscription/status/set", {
      subscription_group_id: getSubscriptionGroupId(subscriptionGroup),
      subscription_state: newStatus,
      external_id: id,
    });
  } catch (error: unknown) {
    captureError(
      new CustomError({
        status: 500,
        code: ErrorCode.Braze,
        message:
          "changeUserSubscriptionGroupStatus: Could not unsubscribe user from group",
        extra: {
          subscriptionGroup,
        },
        causeError: error,
      })
    );

    throw error;
  }
}

interface ListUserSubscriptionGroupsReturn {
  users: Array<{
    email: string | null;
    phone: string | null;
    external_id: string | null;
    subscription_groups: Array<{
      id: string;
      name: string;
      channel: string;
      status: string;
    }>;
  }>;
}

export async function listUserSubscriptionGroups(
  brazeUserId: string,
  email?: string
) {
  // If email is provided, use it (more reliable than braze_id)
  if (email) {
    return getFromBraze<ListUserSubscriptionGroupsReturn>(
      `/subscription/user/status?email=${encodeURIComponent(email)}`
    );
  }
  // Fallback to external_id approach
  return getFromBraze<ListUserSubscriptionGroupsReturn>(
    `/subscription/user/status?external_id=${brazeUserId}`
  );
}

export async function updateEmailStatus(
  email: string,
  newStatus: SubscriptionStatus
): Promise<void> {
  try {
    await postToBraze("/email/status", {
      email,
      subscription_state: newStatus,
    });
  } catch (error: unknown) {
    captureError(
      new CustomError({
        status: 500,
        code: ErrorCode.Braze,
        message: "updateEmailStatus: Could not update email status",
        extra: {
          newStatus,
        },
        causeError: error,
      })
    );

    throw error;
  }
}

export async function updateEmailStatusById(
  id: string,
  newStatus: SubscriptionStatus
): Promise<void> {
  try {
    const email = await retrieveUserEmailById(id);

    /**
     * Although the user can not be found we do not want to throw an error
     * as that may let know a malicious user that the given id does/does not exists
     */
    if (!email) {
      return;
    }

    await postToBraze("/email/status", {
      email,
      subscription_state: newStatus,
    });
  } catch (error: unknown) {
    captureError(
      new CustomError({
        status: 500,
        code: ErrorCode.Braze,
        message: "updateEmailStatusById: Could not update email status",
        extra: {
          newStatus,
        },
        causeError: error,
      })
    );

    throw error;
  }
}

interface SubscriptionStatusResponse {
  total_count: number;
  message: string;
  users?: Array<{
    email: string;
    external_id: string;
  }>;
}

export async function retrieveUserByEmail(email: string) {
  try {
    const response = await getFromBraze<SubscriptionStatusResponse>(
      `/subscription/user/status?email=${email}`
    );

    const { users, total_count, message } = response;

    if (message !== "success" || !users || total_count === 0) {
      return undefined;
    }

    return users[0];
  } catch (error) {
    throw error;
  }
}

interface BrazeUserExportIdsResponse {
  users: BrazeUser[];
  message: string;
}

export async function retrieveUserEmailById(
  id: string
): Promise<string | undefined> {
  try {
    const { users, message } = await postToBraze<BrazeUserExportIdsResponse>(
      "/users/export/ids",
      { external_ids: [id] }
    );

    if (message !== "success" || users.length === 0) {
      throw new Error(`No user found for id ${id}`);
    }

    return users[0].email;
  } catch (error: unknown) {
    captureError(
      new CustomError({
        status: 500,
        code: ErrorCode.Braze,
        message: "retrieveUserEmailById: Could not retrieve user by id",
        extra: {},
        causeError: error,
      })
    );

    throw error;
  }
}

async function getFromBraze<T>(path: string) {
  const url = `${env.BRAZE_INSTANCE_URL}${path}`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || "Unexpected error from Braze");
  }

  return res.json() as Promise<T>;
}

async function postToBraze<T>(path: string, data: Record<string, unknown>) {
  const url = `${env.BRAZE_INSTANCE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(message || "Unexpected error from Braze");
  }

  return res.json() as Promise<T>;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${env.BRAZE_API_KEY}`,
    "Content-Type": "application/json",
  };
}
