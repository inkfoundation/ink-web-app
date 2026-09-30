"use client";

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Script from "next/script";

import { clientEnv } from "@/env-client";

declare global {
  interface Window {
    hcaptcha: {
      render: (
        containerId: string,
        options: {
          sitekey: string;
          size?: string;
          callback?: (token: string) => void;
        }
      ) => string;
      execute: (
        widgetId?: string,
        options?: { async: boolean }
      ) => Promise<{ response: string }>;
      reset: (widgetId?: string) => void;
    };
  }
}

async function executeHCaptcha(widgetId: string) {
  if (!widgetId) throw new Error("hCaptcha not initialized");
  try {
    console.debug("Executing hCaptcha with widgetId:", widgetId);
    const token = await window.hcaptcha.execute(widgetId, { async: true });
    return token;
  } catch (error) {
    console.error("hCaptcha execution error:", error);
    throw error;
  }
}

interface CaptchaContextType {
  executeHCaptcha: () => Promise<{ response: string }>;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  requestScript: () => void;
}

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

export const useCaptcha = ({
  load = true,
}: { load?: boolean } = {}): CaptchaContextType => {
  const context = useContext(CaptchaContext);
  const requestScript = context?.requestScript;

  useEffect(() => {
    if (load) {
      requestScript?.();
    }
  }, [load, requestScript]);

  if (!context) {
    throw new Error("useCaptcha must be used within a CaptchaProvider");
  }
  return context;
};

export const CaptchaProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isScriptRequested, setIsScriptRequested] = useState(false);
  const requestScript = useCallback(() => setIsScriptRequested(true), []);

  // If captcha is disabled in local environment, mark as ready immediately
  const isCaptchaDisabled = clientEnv.NEXT_PUBLIC_DISABLE_CAPTCHA;
  const [widgetId, setWidgetId] = useState<string | null>(
    isCaptchaDisabled ? "disabled" : null
  );

  function init() {
    if (isCaptchaDisabled) {
      setWidgetId("disabled");
      return;
    }

    const id = window.hcaptcha.render("hcaptcha-container", {
      sitekey: clientEnv.NEXT_PUBLIC_HCAPTCHA_SITEKEY,
      size: "invisible",
    });
    setWidgetId(id);
  }

  const handleExecuteHCaptcha = useCallback(async () => {
    if (isCaptchaDisabled) {
      return { response: "disabled-in-local" };
    }

    if (!widgetId || widgetId === "disabled") {
      setError(new Error("hCaptcha not initialized"));
      throw new Error("hCaptcha not initialized");
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = await executeHCaptcha(widgetId);
      return token;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to execute captcha");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, isCaptchaDisabled]);

  return (
    <CaptchaContext.Provider
      value={{
        executeHCaptcha: handleExecuteHCaptcha,
        isReady: isCaptchaDisabled || !!widgetId,
        isLoading,
        error,
        requestScript,
      }}
    >
      {children}
      {!isCaptchaDisabled && (
        <>
          {/* ~300KB of hCaptcha script + iframe: only requested by forms that
              are mounted and visible, then loaded off the critical path. */}
          {isScriptRequested && (
            <Script
              src="https://js.hcaptcha.com/1/api.js?render=explicit"
              strategy="lazyOnload"
              onLoad={init}
            />
          )}
          <div
            id="hcaptcha-container"
            style={{
              display: "none",
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              overflow: "hidden",
            }}
          />
        </>
      )}
    </CaptchaContext.Provider>
  );
};
