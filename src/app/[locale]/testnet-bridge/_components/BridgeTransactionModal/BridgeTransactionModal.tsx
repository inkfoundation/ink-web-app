"use client";
import React from "react";
import { Button, Modal, useModalContext } from "@inkonchain/ink-kit";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";

import { BlockExplorerButton } from "../BlockExplorerButton";

import { useBridgeTransactionModal } from "./BridgeTransactionModalContext";
import animation from "./BroadcastSent-checkMark.json";

// lottie-web touches `document` at import time, which crashes server
// rendering (and Node 22+ where `navigator` exists), so load it client-only.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const BRIDGE_TRANSACTION_MODAL_KEY = "bridge-transaction-modal";

export interface BridgeTransactionModalProps {}

export const BridgeTransactionModal: React.FC<
  BridgeTransactionModalProps
> = () => {
  const t = useTranslations("Bridge");
  const { txHash, setTxHash } = useBridgeTransactionModal();
  const { closeModal } = useModalContext(BRIDGE_TRANSACTION_MODAL_KEY);

  function onCloseModal() {
    setTxHash(null);
  }

  return (
    <Modal id={BRIDGE_TRANSACTION_MODAL_KEY} hasBackdrop onClose={onCloseModal}>
      {() => (
        <div className="flex-1 relative p-6">
          <div className="flex flex-col gap-2 items-center">
            <Lottie
              animationData={animation}
              loop={false}
              className="w-[200px]"
            />
            <div className="flex flex-col gap-6 items-center">
              <ColoredText
                variant="purple"
                className="text-2xl font-bold text-center"
              >
                {t("transactionSubmitted")}
              </ColoredText>
              <p className="text-center text-md">
                {t.rich("bridgingTime", {
                  network: (network) => <strong>{network}</strong>,
                })}
              </p>
            </div>
          </div>
          <div className="mt-[45px] flex justify-center">
            <BlockExplorerButton transactionHash={txHash || ""} />
          </div>
          <div className="w-full mt-[108px]">
            <Button
              onClick={closeModal}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {t("done")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
