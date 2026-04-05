import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC, Nunito } from "next/font/google";
import Navbar from "@/components/Navbar";
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
      <body className={`font-sans bg-stone-950 text-stone-50 selection:bg-amber-500/30 selection:text-amber-100 antialiased min-h-screen overflow-x-hidden relative flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <Navbar />
        
        <main className="flex-grow pt-16 relative z-10 w-full overflow-x-hidden">
          {children}
        </main>

        {/* Global Gradient Backgrounds: Warm tones */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[150px] rounded-full"></div>
        </div>

        <footer className="py-12 border-t border-white/5 text-center text-stone-500 text-xs bg-stone-950/80 backdrop-blur-md relative z-20 px-6">
          <div className="max-w-xl mx-auto space-y-3">
            <p className="font-medium text-stone-400 text-sm">La Cozzi 拉釦子樂團</p>
            <p className="font-light leading-relaxed">音樂不只是聽覺的饗宴，更重要的是拉近人與人之間距離的溫度。期待在下一個重要的時刻與您相遇。</p>
            <p className="font-mono tracking-wider pt-4 opacity-50">© 2026 La Cozzi. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
