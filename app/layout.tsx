import type { Metadata } from "next";
import { SF_Pro_Display } from "next/font/google";
import "./globals.css";

const sfPro = SF_Pro_Display({
  subsets: ["latin"],
  variable: "--font-sf-pro",
});

export const metadata: Metadata = {
  title: "iCasino - Premium Gaming Experience",
  description: "Experience casino games with elegant design and smooth gameplay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sfPro.variable} font-sf-pro bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
