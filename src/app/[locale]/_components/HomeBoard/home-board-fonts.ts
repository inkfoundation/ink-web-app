import localFont from "next/font/local";

export const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "block",
  adjustFontFallback: false,
});

export const departureMono = localFont({
  src: "./fonts/DepartureMono-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-departure-mono",
  display: "block",
  adjustFontFallback: false,
});
