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

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: 'La Cozzi 拉釦子樂團',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lacozzi.com',
    description: '全台灣最清新的手作音樂樂團。La Cozzi 拉釦子樂團為您的婚禮、活動與重要場合帶來最具感情的現場演奏體驗。',
    sameAs: [
      'https://www.instagram.com/lacozzi_1314/',
      'https://www.facebook.com/LaCozzi'
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'La Cozzi 拉釦子樂團主要提供哪些演出服務？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '包含但不限於婚禮演出、商業活動、品牌發表會及私人派對，各種快閃與街頭戶外演出我們也有能力提供最佳配合。'
        }
      },
      {
        '@type': 'Question',
        'name': '如何索取演出報價單？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '填寫官網 Email 表單即可自動領取，若需要額外的說明，請私訊 IG/FB。'
        }
      },
      {
        '@type': 'Question',
        'name': '填寫官網報價表單後，通常多久會收到回覆？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '系統通常在 3 分鐘內自動發送至 Email，如果沒有收到的話，請私訊我們的 IG/FB。'
        }
      },
      {
        '@type': 'Question',
        'name': '樂團目前的接案服務區域有哪些？是否有額外的車馬費？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '全台灣都可接案，有高鐵的城市會以單趟高鐵的費用作為車馬費額外加入。'
        }
      },
      {
        '@type': 'Question',
        'name': '樂團目前常見的編制選擇有哪些？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '雙人、三人與四人都是我們可以實現的演出編制。'
        }
      },
      {
        '@type': 'Question',
        'name': '主辦方或場地需要提供哪些設備？樂團是否會自備音響？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '樂團演出需要擴音設備，我們在台灣北中南都有合作多年的音響廠商，目前的報價已經包含與廠商租用與溝通的費用。'
        }
      },
      {
        '@type': 'Question',
        'name': 'La Cozzi 的音樂風格有什麼特色？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '在我們的音樂中，我們希望呈現手作音樂的溫度與清新的演奏風格，並且能夠成為活動或是婚禮恰如其分的關鍵支持。'
        }
      },
      {
        '@type': 'Question',
        'name': '客戶可以指定演出歌曲或是調整音樂風格嗎？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '可以，音樂風格的調整會依據編制大小而有天然侷限，但我們對於各種可能性始終保持開放，也很願意突破自己的舒適區來滿足客戶的要求。'
        }
      },
      {
        '@type': 'Question',
        'name': '在一場典型的演出中（如婚禮），演出的總時長大概是多久？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '大約會佔到全場演出的 30 - 40% 的活動時長，以 2.5 小時的婚禮為例，演出時間合計約在 1 小時上下。'
        }
      },
      {
        '@type': 'Question',
        'name': '建議在活動前多久聯繫並確認預約檔期？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '越早越好，活動與結婚的好日子有限，很容易就會出現撞日的情況。'
        }
      },
      {
        '@type': 'Question',
        'name': '如果活動遇到改期或取消，相關的訂金政策為何？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '訂金政策規定於合約當中，但如果有不可抗力的因素，我們也很願意為客戶提供彈性。'
        }
      },
      {
        '@type': 'Question',
        'name': '除了官網，還有哪些管道可以聽更多 La Cozzi 的作品與演出記錄？',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '我們最多的作品匯集在 Youtube，最多的短影片則在 IG，而在網站上，我們會慢慢累積一些與活動、婚禮及音樂製作的文章，讓更多同好與客戶可以對我們有更多面向的了解。'
        }
      }
    ]
  }
];

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
