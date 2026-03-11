"use client";

import { Card, CardContent } from "@inkonchain/ink-kit";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { ColoredText } from "@/components/ColoredText";
import { Link } from "@/routing";

export function VerifyPerks() {
  const t = useTranslations("Verify.perks");

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-4">
        <ColoredText
          className="text-2xl sm:text-4xl font-medium"
          variant="purple"
          dampen="md"
        >
          {t("title")}
        </ColoredText>
        <div className="text-blackMagic/50 dark:text-whiteMagic/50 text-md">
          {t("description")}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link href="https://gm.inkonchain.com" target="_blank">
          <Card variant="secondary" className="flex-1">
            <CardContent.Tiny
              title={"GM"}
              description={"Boost your GMs with Kraken Verify"}
              icon={
                <Image
                  src="/verify/gm.webp"
                  alt="A coin with a checkmark inside"
                  width={56}
                  height={56}
                />
              }
            />
          </Card>
        </Link>
        <Card variant="secondary" className="flex-1">
          <CardContent.Tiny title={"Stay tuned for more"} description={""} />
        </Card>
      </div>
    </div>
  );
}
