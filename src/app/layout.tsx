import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Peerjs Zoom",
  description: "WebRTC Demo",
};

export const viewport: Viewport = {
  initialScale: 0.8,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
