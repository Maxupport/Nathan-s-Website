import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC, Nunito } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-noto-sans-tc',
});

const notoSerifTC = Noto_Serif_TC({
  weight: ['400', '700', '900'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-noto-serif-tc',
});

const nunito = Nunito({
  weight: ['300', '400', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lacozzi.com'),
  title: "La Cozzi 拉釦子樂團 | 官方網站",
  description: "La Cozzi 拉釦子樂團，為您的婚禮與重要場合帶來最具感情的手作音樂體驗。",
  openGraph: {
    title: "La Cozzi 拉釦子樂團 | 官方網站",
    description: "La Cozzi 拉釦子樂團，為您的婚禮與重要場合帶來最具感情的手作音樂體驗。",
    url: '/',
    siteName: 'La Cozzi',
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "La Cozzi 拉釦子樂團 | 官方網站",
    description: "La Cozzi 拉釦子樂團，為您的婚禮與重要場合帶來最具感情的手作音樂體驗。",
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'La Cozzi 拉釦子樂團',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lacozzi.com',
  description: '全台灣最清新的手作音樂樂團。La Cozzi 拉釦子樂團為您的婚禮、活動與重要場合帶來最具感情的現場演奏體驗。',
  sameAs: [
    'https://www.instagram.com/lacozzi_1314/',
    'https://www.facebook.com/LaCozzi'
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`dark scroll-smooth ${notoSansTC.variable} ${notoSerifTC.variable} ${nunito.variable}`}>
      <body className={`font-sans bg-stone-950 text-stone-50 selection:bg-amber-500/30 selection:text-amber-100 antialiased min-h-screen overflow-x-hidden relative`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
