import { SyntheticEvent, useActionState, useTransition } from "react";
import {
  DefaultValues,
  FieldValues,
  useForm as useReactHookForm,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";

import { useCaptcha } from "@/contexts/CaptchaProvider";
import { captureError } from "@/integrations/sentry";

export interface UseFormHook<FormState, FormValues extends FieldValues> {
  state: FormState;
  isSubmitting: boolean;
  form: UseFormReturn<FormValues>;
  formAction: (payload: FormValues) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  reset: () => void;
}

export function useForm<FormState, FormValues extends FieldValues>(
  action: (
    state: Awaited<FormState>,
    formData: FormValues
  ) => Promise<FormState>,
  initialState: Awaited<FormState>,
  schema: ZodSchema,
  defaultValues?: Partial<FormValues>
): UseFormHook<FormState, FormValues> {
  const [isSubmitting, startTransition] = useTransition();
  const { isReady, executeHCaptcha } = useCaptcha();

  const [state, formAction] = useActionState(
    async (state: Awaited<FormState>, payload: FormValues | null) => {
      if (!payload) {
        return initialState;
      }
      const data = await action(state, payload);
      return data;
    },
    initialState
  );

  const form = useReactHookForm<FormValues>({
    shouldFocusError: false,
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<FormValues>,
  });

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    form.handleSubmit(async (formData) => {
      if (isReady) {
        try {
          const captcha = await executeHCaptcha();
          startTransition(() =>
            formAction({
              ...formData,
              captchaToken: captcha.response,
            })
          );
        } catch (error) {
          console.error("hCaptcha execution error:", error);
          captureError(error);
          return;
        }
      } else {
        console.warn("hCaptcha not loaded or not ready");
        return;
      }
    }, smoothScrollToFirstError)(event);
  };

  const reset = () => {
    startTransition(() => formAction(null));
  };

  return {
    state,
    isSubmitting,
    form,
    formAction,
    onSubmit,
    reset,
  };
}

// Helper function
const smoothScrollToFirstError = (errors: Record<string, any>) => {
  const firstErrorKey = Object.keys(errors)[0];
  if (firstErrorKey) {
    const errorElement = document.querySelector(`[name="${firstErrorKey}"]`);
    errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};
