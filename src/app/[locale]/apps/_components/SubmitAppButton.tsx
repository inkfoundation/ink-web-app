"use client";
import { Button, InkIcon, useModalContext } from "@inkonchain/ink-kit";

import { APP_SUBMISSION_MODAL_KEY } from "@/components/Modals/AppSubmissionModal/AppSubmissionModal";
import { classNames } from "@/util/classes";

import "./SubmitAppButton.css";

export function SubmitAppButton() {
  const { openModal } = useModalContext(APP_SUBMISSION_MODAL_KEY);

  return (
    <Button
      className={classNames("gradient-border ink:text-text-default")}
      variant="secondary"
      size="md"
      iconLeft={<InkIcon.Plus className="ink:size-3" />}
      onClick={openModal}
    >
      Submit app
    </Button>
  );
}
