import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { CurrencyProvider } from './context/CurrencyContext';
import { UserProvider } from './context/UserContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "iCasino - Premium Gaming Experience",
  description: "Experience casino games with elegant design and smooth gameplay",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <UserProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </UserProvider>
      </body>
    </html>
  )
}
