import { Providers } from "./providers";
import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "QueenChat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
