"use client";

import FAQSection from './FAQSection';

export default function ServicesPage() {
  return (
    <div className="py-24 px-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-700 fade-in pb-32">
      <div className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[150px] bg-orange-500/10 blur-[100px] rounded-full point-events-none"></div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight relative z-10 drop-shadow-lg mb-6">理性與溫暖並存的職涯支援</h2>
        <p className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed text-lg relative z-10">
          （您可以在這裡補充服務初衷。例如：為什麼您會設計這些服務？您的核心觀點是什麼？或者是您希望帶給每個來諮詢的人什麼樣的轉變與價值...）
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 items-stretch relative z-10">
        {/* S1: $99 */}
        <div className="border border-white/10 rounded-[2rem] p-8 flex flex-col group bg-slate-900/40 backdrop-blur-md hover:bg-slate-900/80 hover:border-orange-500/30 transition-all duration-500 shadow-xl hover:shadow-orange-500/10">
          <div className="mb-8"><span className="bg-white/5 text-slate-300 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">Email 限時回覆</span></div>
          <h3 className="text-2xl font-bold text-white mb-4">正能量傳輸服務</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-light grow">
            有時候卡住，只是因為你撐太久了。幫你情緒整理成可理解脈絡，並提供一個立刻採取的小行動。快速修復「重新上線」。
          </p>
          <p className="text-3xl font-black text-orange-400 mb-8">$99 <span className="text-sm text-slate-600 font-normal">/ 次</span></p>
          <a href="mailto:maxupport@gmail.com?subject=%E3%80%90%E6%AD%A3%E8%83%BD%E9%87%8F%E5%82%B3%E8%BC%B8%E6%9C%8D%E5%8B%99%E3%80%91%E6%88%91%E9%9C%80%E8%A6%81%E5%B9%AB%E5%BF%99%E8%A3%9C%E5%85%85%E6%AD%A3%E8%83%BD%E9%87%8F%EF%BC%81&body=Hi%20Max%EF%BC%8C%0A%0A%E6%88%91%E6%9C%80%E8%BF%91%E9%81%87%E5%88%B0%E4%BA%86%E4%B8%80%E4%BA%9B%E7%8B%80%E6%B3%81%EF%BC%8C%E9%9C%80%E8%A6%81%E8%A3%9C%E5%85%85%E6%AD%A3%E8%83%BD%E9%87%8F%EF%BC%8C%E6%88%91%E7%8F%BE%E5%9C%A8%E7%9A%84%E7%8B%80%E6%B3%81%E6%98%AF%E4%B8%8B%E9%9D%A2%E9%80%99%E6%A8%A3%EF%BC%9A%0A%0A1.%20%E6%88%91%E6%98%AF%E8%AA%B0%EF%BC%9F%0A(%E6%96%B9%E4%BE%BF%E7%A8%B1%E5%91%BC%E4%BD%A0%E7%9A%84%E6%96%B9%E5%BC%8F%E9%83%BD%E5%8F%AF%E4%BB%A5%EF%BC%8C%E4%B8%8D%E9%99%90%E6%96%BC%E6%9C%AC%E5%90%8D%EF%BC%9B%E8%8B%A5%E5%B8%8C%E6%9C%9B%E6%88%91%E6%9B%B4%E6%B7%B1%E5%85%A5%E5%8D%94%E5%8A%A9%EF%BC%8C%E5%8F%AF%E4%BB%A5%E6%8F%90%E4%BE%9B%E7%A4%BE%E4%BA%A4%E5%B9%B3%E5%8F%B0%E5%B8%B3%E8%99%9F%E7%B5%A6%E6%88%91%EF%BC%8C%E8%AE%93%E6%88%91%E8%83%BD%E6%9B%B4%E4%BA%86%E8%A7%A3%E4%BD%A0%E4%B8%80%E9%BB%9E%E3%80%82)%0A%0A2.%20%E4%BB%A5%E4%B8%8B%E6%98%AF%E6%88%91%E7%9B%AE%E5%89%8D%E7%9A%84%E6%83%85%E6%B3%81%EF%BC%9A%0A%EF%BC%88%E8%AB%8B%E7%B0%A1%E5%96%AE%E6%8F%8F%E8%BF%B0%E4%BD%A0%E7%8F%BE%E5%9C%A8%E9%81%87%E5%88%B0%E7%9A%84%E7%8B%80%E6%B3%81%E6%88%96%E5%8D%A1%E4%BD%8F%E7%9A%84%E5%9C%B0%E6%96%B9%EF%BC%89%0A%0A3.%20%E5%B8%8C%E6%9C%9B%E5%BE%97%E5%88%B0%E6%80%8E%E9%BA%BC%E6%A8%A3%E7%9A%84%E9%BC%93%E5%8B%B5%E8%88%87%E5%8F%8D%E9%A5%8B%EF%BC%9F%0A(%E4%B9%9F%E5%8F%AF%E4%BB%A5%E8%AE%93%E6%88%91%E8%87%AA%E7%94%B1%E7%99%BC%E6%8F%AE%EF%BC%8C%E7%9C%8B%E4%BD%A0~~)%0A%0AAll%20the%20best%2C" className="block text-center w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300 shadow-sm">正能量補充</a>
        </div>
        {/* S2: $999 (Most Popular) */}
        <div className="border border-orange-500/50 rounded-[2rem] p-8 flex flex-col relative bg-gradient-to-b from-slate-800 to-slate-900 md:-translate-y-4 shadow-[0_0_40px_rgba(249,115,22,0.15)] group hover:shadow-[0_0_60px_rgba(249,115,22,0.25)] transition-all duration-500">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-orange-500/30">1 對 1 深度諮詢</div>
          <div className="mb-6 mt-2"><span className="opacity-0 px-4 py-1.5 rounded-full text-xs">Spacer</span></div>
          <h3 className="text-2xl font-bold text-white mb-4">職涯重新定位服務</h3>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed font-light grow">
            問題不在選項，而在你沒有清楚的判斷框架。幫你建立「你自己的選擇系統」，提供可行路徑與風險分析。
          </p>
          <p className="text-3xl font-black text-orange-400 mb-8">$999 <span className="text-sm text-slate-500 font-normal">/ 專案</span></p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfE2PNCwzEKaULuA2zq8eVipIf67CLHNPU2lXTfRqydZkr-NQ/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="block text-center w-full py-3.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)]">建立框架</a>
        </div>
        {/* S3: $999 */}
        <div className="border border-white/10 rounded-[2rem] p-8 flex flex-col group bg-slate-900/40 backdrop-blur-md hover:bg-slate-900/80 hover:border-orange-500/30 transition-all duration-500 shadow-xl hover:shadow-orange-500/10">
          <div className="mb-8"><span className="bg-white/5 text-slate-300 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">職涯價值重估</span></div>
          <h3 className="text-2xl font-bold text-white mb-4">履歷優化 ＋ 模擬面試</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-light grow">
            多數人投履歷沒回音，是因為價值沒被正確呈現。重建你的職涯邏輯，翻譯成「市場看得懂的人才語言」。
          </p>
          <p className="text-3xl font-black text-orange-400 mb-8">$999 <span className="text-sm text-slate-600 font-normal">/ 專案</span></p>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfE2PNCwzEKaULuA2zq8eVipIf67CLHNPU2lXTfRqydZkr-NQ/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="block text-center w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300 shadow-sm">立即體驗</a>
        </div>
      </div>

      <FAQSection />
    </div>
  );
}
