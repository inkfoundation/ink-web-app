"use client";
import { PropsWithChildren } from "react";
import { ModalProvider } from "@inkonchain/ink-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AnalyticsProvider } from "@/contexts/AnalyticsProvider";
import { CaptchaProvider } from "@/contexts/CaptchaProvider";
import { RelayProvider } from "@/contexts/RelayProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { WalletProvider } from "@/contexts/WalletProvider";
import { clientEnv } from "@/env-client";
import { useGlobalKeyCallback } from "@/hooks/useGlobalKey";

const queryClient = new QueryClient();

export const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  useGlobalKeyCallback();

  return (
    <ThemeProvider>
      <ModalProvider>
        <AnalyticsProvider writeKey={clientEnv.NEXT_PUBLIC_SEGMENT_WRITE_KEY}>
          <QueryClientProvider client={queryClient}>
            <WalletProvider>
              <RelayProvider>
                <CaptchaProvider>{children}</CaptchaProvider>
              </RelayProvider>
            </WalletProvider>
          </QueryClientProvider>
        </AnalyticsProvider>
      </ModalProvider>
    </ThemeProvider>
  );
};
