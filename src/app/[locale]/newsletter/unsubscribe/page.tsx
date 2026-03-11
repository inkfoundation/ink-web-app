import { notFound } from "next/navigation";

import { validateUnsubscribeToken } from "@/lib/unsubscribe-token";

import { UnsubscribeForm } from "./_components/UnsubscribeForm";

interface NewsletterUnsubscribePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NewsletterUnsubscribePage({
  searchParams,
}: NewsletterUnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token;

  // Validate token
  if (!token) {
    notFound();
  }

  const payload = await validateUnsubscribeToken(token);

  if (!payload) {
    notFound();
  }

  return (
    <div className="w-full h-screen px-4 flex flex-col items-center justify-center">
      <UnsubscribeForm
        userBrazeId={payload.brazeId}
        email={payload.email}
        token={token}
      />
    </div>
  );
}
