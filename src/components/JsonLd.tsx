import React from "react";
import type {
  CollectionPage,
  Organization,
  WebApplication,
  WebPage,
} from "schema-dts";

export interface JsonLdProps {
  schema: CollectionPage | Organization | WebApplication | WebPage;
}

export const JsonLd: React.FC<JsonLdProps> = ({ schema }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          provider: {
            "@type": "Organization",
            name: "Ink",
            url: "https://inkonchain.com/",
          },
          ...(typeof schema === "object" ? schema : {}),
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
};
