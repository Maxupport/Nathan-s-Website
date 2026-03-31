"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Maxupport 到底在做什麼？ 不是心理諮商，也不是職涯顧問，那你在幫什麼？",
    answer: `Maxupport 在做的事情很簡單——
幫你把「卡住的地方」說清楚，並一起找出下一步。

很多人不是不努力，而是：
• 不知道問題在哪 
• 分不清什麼才是關鍵 
• 做了很多，但沒有推進 

我會透過對話，幫你釐清現況、拆解選項，
讓你從「模糊焦慮」走到「可以行動」。

👉 如果你已經卡一段時間，這會對你有幫助。`
  },
  {
    question: "這跟一般職涯諮詢或教練有什麼不一樣？",
    answer: `差別在於：我不提供標準答案，也不帶你走既定路線。

多數服務會：
• 給你建議 
• 告訴你該怎麼做 

但現實是——
別人的方法，不一定適用在你的人生。

Maxupport 更像是：
• 幫你釐清判斷邏輯 
• 陪你做出「你能承擔的選擇」 

這不是「教你怎麼選」，而是讓你知道「為什麼這樣選」。`
  },
  {
    question: "我現在的狀態，適合找你嗎？",
    answer: `如果你有以下其中一種感覺，很適合：
• 有很多選項，但不知道怎麼選 
• 明明很努力，但進展有限 
• 想做改變，但不確定風險 
• 對未來有方向感，但不夠清晰 

但如果你只是想要一個「快速答案」，或希望有人直接告訴你該怎麼做，那這可能不適合。
因為這裡會比較誠實，也比較慢一點。`
  },
  {
    question: "一次對話大概會得到什麼？",
    answer: `不會是「解決人生」，但會有三個很實際的收穫：

1. 你會更清楚現在卡在哪 
2. 你會知道有哪些選項（而不是只有一條路） 
3. 你會帶走一個可以開始行動的方向 

簡單說，就是從「混亂」變成「可推進」。`
  },
  {
    question: "需要準備什麼嗎？",
    answer: `不用特別準備，但如果你願意，可以先想：
• 最近最困擾你的一件事 
• 你卡住最久的問題 
• 或一個你一直沒有做決定的選擇 

你越真實，我們的對話就會越有效。`
  },
  {
    question: "要怎麼開始？",
    answer: `很簡單：

👉 寫信給我 / 預約一個時間
👉 簡單說明你的狀況
👉 我們約一個線上或線下的對話

如果你還在猶豫，也沒關係。
等你準備好，再來找我。`
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate JSON-LD for Answer Engine Optimization (AEO) and SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.replace(/\n/g, '<br/>')
      }
    }))
  };

  return (
    <section className="mt-32 max-w-3xl mx-auto w-full relative z-10 animate-in fade-in duration-700 delay-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">常見問題 Q&A</h2>
        <p className="text-slate-400 font-light text-lg">在預約之前，解答你可能有的疑惑</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-orange-500/30"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left px-6 py-5 flex items-start sm:items-center justify-between gap-4 focus:outline-none"
            >
              <span className="font-semibold text-lg text-slate-200 group-hover:text-white leading-relaxed">
                {faq.question}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-orange-400 shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index 
                  ? 'max-h-[500px] opacity-100 pb-6' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="px-6 text-slate-400 font-light leading-relaxed whitespace-pre-wrap">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
