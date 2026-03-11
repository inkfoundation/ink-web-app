import { notFound } from "next/navigation";

import { validateUnsubscribeToken } from "@/lib/unsubscribe-token";

import { ResubscribeForm } from "./_components/ResubscribeForm";

interface NewsletterResubscribePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NewsletterResubscribePage({
  searchParams,
}: NewsletterResubscribePageProps) {
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
      <ResubscribeForm userBrazeId={payload.brazeId} email={payload.email} />
    </div>
  );
}
