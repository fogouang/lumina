// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/providers";
import { getSEOTags } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata = getSEOTags();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning> 
      <body className={inter.className} suppressHydrationWarning> 
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}