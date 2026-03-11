"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@inkonchain/ink-kit";

import { unsubscribeFromBraze } from "@/actions/unsubscribe-from-braze";
import { FormStatus } from "@/components/FormStatus";
import { Link } from "@/routing";

interface UnsubscribeFormProps {
  userBrazeId: string;
  email: string;
  token: string;
}

export const UnsubscribeForm: React.FC<UnsubscribeFormProps> = ({
  userBrazeId,
  email,
  token,
}) => {
  const [state, formAction] = useActionState(unsubscribeFromBraze, {
    success: false,
    error: undefined,
  });

  if (state.success) {
    return (
      <div className="flex flex-col gap-6">
        <h1>
          You{"'"}ve successfully unsubscribed from the Ink Newsletter, If this
          was a mistake, use the button below to resubscribe
        </h1>

        <Button asChild variant="primary" size="md">
          <Link
            href={{
              pathname: "/newsletter/resubscribe",
              query: { token },
            }}
          >
            Resubscribe
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="relative flex flex-col gap-6" action={formAction}>
      <div>Email: {email}</div>
      <h2 className="text-3xl">What groups do you want to unsubscribe from?</h2>
      <div className="flex gap-4 pl-5">
        <input
          id="brazeId"
          name="brazeId"
          value={userBrazeId}
          className="hidden"
          aria-hidden
          readOnly
        />
        <input
          id="email"
          name="email"
          value={email}
          className="hidden"
          aria-hidden
          readOnly
        />

        <div className="h-6 flex items-center">
          <input
            type="checkbox"
            id="generalWailist"
            name="generalWailist"
            className="h-4 w-4 rounded-sm border-gray-300 text-whiteMagic"
          />
        </div>

        <label htmlFor="generalWailist" className="font-medium">
          General Waitlist
        </label>
      </div>

      <div className="flex gap-4 pl-5">
        <div className="h-6 flex items-center">
          <input
            type="checkbox"
            id="developerWailist"
            name="developerWailist"
            className="h-4 w-4 rounded-sm border-gray-300 text-whiteMagic"
          />
        </div>

        <label htmlFor="developerWailist" className="font-medium">
          Developer Waitlist
        </label>
      </div>

      <Submit />

      {state.error && <ErrorState errorMessage={state.error} />}
    </form>
  );
};

interface ErrorStateProps {
  errorMessage: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage }) => {
  const { pending } = useFormStatus();

  if (pending) return null;

  return (
    <div className="absolute -bottom-[100px] left-1/2 -translate-x-1/2">
      <FormStatus errorMessage={errorMessage} />
    </div>
  );
};

const Submit = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      type="submit"
      variant="primary"
      size="md"
      className="uppercase mt-6"
    >
      Unsubscribe
    </Button>
  );
};
