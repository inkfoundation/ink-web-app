"use client";
import { Button, Card, CardContent, InkIcon } from "@inkonchain/ink-kit";

import { ColoredText } from "@/components/ColoredText";
import { useBridgeAvailability } from "@/hooks/useBridgeAvailability";
import { Link } from "@/routing";

export const HomeTagLine = () => {
  const { isAvailable: isBridgeAvailable } = useBridgeAvailability();

  return (
    <Card>
      <CardContent.Tagline
        title={
          <ColoredText variant="ink" className="ink:text-h1">
            The future isn&apos;t written,
            <br />
            it&apos;s waiting to be inked.
          </ColoredText>
        }
        buttons={
          <>
            {isBridgeAvailable && (
              <Button asChild size="lg" iconLeft={<InkIcon.Bridge />}>
                <Link href="/bridge">Bridge now</Link>
              </Button>
            )}
            <Button
              asChild
              variant="secondary"
              size="lg"
              iconLeft={<InkIcon.Social.X />}
            >
              <Link href="https://x.com/inkonchain">Follow us</Link>
            </Button>
          </>
        }
      ></CardContent.Tagline>
    </Card>
  );
};
