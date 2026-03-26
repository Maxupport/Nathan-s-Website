import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Maxupport | 生涯擺渡人 Max",
  description: "如果你現在處於「選擇很多卻無法下決定」、「一直想往前卻停滯不前」，Maxupport 擺渡服務將打開你對於未來的期待！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-slate-50 selection:bg-orange-500/30 selection:text-orange-100 antialiased min-h-screen overflow-x-hidden relative`}>
        {children}
      </body>
    </html>
  );
}
