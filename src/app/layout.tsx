import React from "react";
import { Metadata, Viewport } from "next";

import "@/app/tailwind.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://inkonchain.com"),
  openGraph: {
    images: [
      {
        url: "/ink-opengraph.png",
        width: 1200,
        height: 650,
        alt: "Ink logo beside a silver Ink coin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ink-opengraph.png"],
  },
  verification: {
    // TODO: Put the valid verification ID here.
    google: "",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
