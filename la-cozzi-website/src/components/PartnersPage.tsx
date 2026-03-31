"use client";

import { User } from 'lucide-react';

export default function PartnersPage() {
  // 預留 10 個人頭位置，之後可以用 Notion API 或 Props 傳入
  const partners = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    name: `[夥伴姓名佔位符 ${i + 1}]`,
    role: `[樂團角色/職稱 ${i + 1}]`,
    description: [
      "[簡介項目 1：例如，擅長曲風或經歷]",
      "[簡介項目 2：演出特色]",
      "[簡介項目 3：得獎紀錄或個人特質]"
    ]
  }));

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-700 fade-in pb-32">
      <div className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[150px] bg-rose-500/10 blur-[100px] rounded-full point-events-none"></div>
        <h2 className="text-4xl font-black font-serif text-stone-100 tracking-tight relative z-10 drop-shadow-lg mb-6">
          [標題佔位符] 遇見我們的靈魂樂手
        </h2>
        <p className="text-stone-300 max-w-2xl mx-auto font-light leading-relaxed text-lg relative z-10">
          [文字佔位符] 每一段動人的旋律，都來自這群熱愛音樂、充滿故事的夥伴。認識 la Cozzi 幕後的溫暖推手。
        </p>
      </div>

      {/* 卡片式排版設計：一排兩個 */}
      <div className="grid md:grid-cols-2 gap-8 items-stretch relative z-10">
        {partners.map(partner => (
          <div key={partner.id} className="border-2 border-amber-500/30 rounded-organic p-8 flex flex-col sm:flex-row gap-8 group bg-stone-900/40 backdrop-blur-md hover:bg-stone-900/80 hover:border-amber-500/60 transition-all duration-500 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-amber-500/10 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 bg-amber-500/5 w-40 h-40 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors duration-1000 point-events-none"></div>
            
            {/* 照片區域：預留為圓形或大方片 */}
            <div className="flex-shrink-0 flex items-center justify-center sm:items-start relative">
              <div className="w-32 h-32 rounded-organic-2 overflow-hidden bg-stone-800 border-4 border-stone-700/50 group-hover:border-amber-400/50 transition-colors shadow-inner flex items-center justify-center relative rotate-2 group-hover:rotate-0">
                <User size={48} className="text-stone-600 group-hover:text-amber-500/50 transition-colors" />
                <span className="absolute bottom-2 text-[10px] text-stone-500 font-mono text-center w-full block">Photo<br/>Placeholder</span>
              </div>
            </div>

            {/* 內容區塊 */}
            <div className="flex flex-col grow justify-center text-center sm:text-left">
              <div className="mb-3"><span className="bg-amber-950/50 text-amber-200 border-2 border-amber-500/30 px-3 py-1 rounded-organic text-xs font-black font-serif tracking-widest">{partner.role}</span></div>
              <h3 className="text-2xl font-black font-serif text-stone-100 mb-4">{partner.name}</h3>
              
              <ul className="space-y-2 text-stone-300 text-sm font-light">
                {partner.description.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-amber-500 mr-2 mt-0.5 opacity-70">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
