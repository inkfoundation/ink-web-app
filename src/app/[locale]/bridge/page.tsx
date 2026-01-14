"use client";

import { ColoredText } from "@/components/ColoredText";
import { RelayKitUI } from "@/components/RelayKitUI";
import { newLayoutContainerClasses } from "@/components/styles/container";
import { useBridgeAvailability } from "@/hooks/useBridgeAvailability";

export default function BridgePage() {
  const { isAvailable, isLoading } = useBridgeAvailability();

  if (isLoading) {
    return (
      <div className={newLayoutContainerClasses()}>
        <ColoredText className="ink:text-h2 lg:hidden" variant="purple">
          Bridge
        </ColoredText>
        <div className="flex items-center justify-center py-12">
          <ColoredText variant="purple">Checking bridge status...</ColoredText>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className={newLayoutContainerClasses()}>
        <ColoredText className="ink:text-h2 lg:hidden" variant="purple">
          Bridge
        </ColoredText>
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <ColoredText variant="purple" className="ink:text-h3">
            Bridge Temporarily Unavailable
          </ColoredText>
          <ColoredText variant="purple" className="text-base opacity-80">
            The bridge is currently disabled. Please check back later or use an
            alternative bridge service.
          </ColoredText>
        </div>
      </div>
    );
  }

  return (
    <div className={newLayoutContainerClasses()}>
      <ColoredText className="ink:text-h2 lg:hidden" variant="purple">
        Bridge
      </ColoredText>
      <RelayKitUI />
    </div>
  );
}
