import { JWTPayload, jwtVerify, SignJWT } from "jose";

import { env } from "@/env";

const UNSUBSCRIBE_JWT_SECRET_KEY = new TextEncoder().encode(
  env.UNSUBSCRIBE_JWT_SECRET
);

export interface UnsubscribeTokenPayload extends JWTPayload {
  email: string;
  brazeId: string;
  campaignId?: string;
  sentAt: string;
}

export async function generateUnsubscribeToken(
  payload: UnsubscribeTokenPayload
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(UNSUBSCRIBE_JWT_SECRET_KEY);
}

export async function validateUnsubscribeToken(
  token: string
): Promise<UnsubscribeTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, UNSUBSCRIBE_JWT_SECRET_KEY);

    if (
      typeof payload.email !== "string" ||
      typeof payload.brazeId !== "string" ||
      typeof payload.sentAt !== "string"
    ) {
      return null;
    }

    return payload as UnsubscribeTokenPayload;
  } catch {
    return null;
  }
}
