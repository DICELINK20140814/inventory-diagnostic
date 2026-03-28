import type { Metadata } from "next";
import { ClientDocumentTitle } from "@/components/ClientDocumentTitle";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "在庫診断",
  description: "在庫運営の構造をもとに、在庫削減ポテンシャルと主要な改善論点を可視化する簡易診断です。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientDocumentTitle />
        {children}
      </body>
    </html>
  );
}
