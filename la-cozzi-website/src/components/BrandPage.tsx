"use client";

import { ChevronRight, CheckCircle2, Music, Heart } from 'lucide-react';

export default function BrandPage({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {/* Hero Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full point-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/5 blur-[100px] rounded-full point-events-none"></div>

        <div className="relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold tracking-widest mb-6 uppercase">la Cozzi</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-stone-100 mb-6 leading-tight max-w-4xl mx-auto tracking-tight drop-shadow-sm font-serif">
            [品牌主標佔位符]<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 italic font-medium">[副標題佔位符] 用音樂訴說您的故事</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            [引言佔位符] 在人生的重要時刻，音樂不只是背景，而是深刻情感的連結。我們致力於為您打造專屬的手作音樂體驗。
          </p>
          <button onClick={() => { setActiveTab('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group bg-amber-600 text-stone-50 px-8 py-4 rounded-organic-2 font-black font-serif border-2 border-amber-500 hover:bg-amber-500 transition-all duration-300 shadow-[0_0_30px_rgba(217,119,6,0.25)] hover:shadow-[0_0_40px_rgba(217,119,6,0.4)] hover:-translate-y-1 inline-flex items-center">
            了解演出方案 <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black font-serif text-stone-100 mb-4 tracking-tight">[理念標題佔位符] 我們的堅持</h2>
              <p className="text-stone-300 font-light leading-relaxed text-lg">
                [理念內文佔位符] 為什麼成立 la Cozzi？我們相信手作與溫度的力量，我們重視每一場演出的互動與回饋。
              </p>
            </div>
            <div className="space-y-4 bg-stone-900/50 p-8 border-2 border-stone-800 rounded-organic backdrop-blur-md shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
              {[
                { t: "[特色 1 佔位符]", d: "[特色 1 描述佔位符] 量身打造專屬歌單" },
                { t: "[特色 2 佔位符]", d: "[特色 2 描述佔位符] 細緻的現場氛圍營造" },
                { t: "[特色 3 佔位符]", d: "[特色 3 描述佔位符] 充滿人情味的互動" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="bg-rose-500/10 p-1.5 rounded-full shrink-0 mt-0.5 border border-rose-500/20">
                    <Heart className="text-rose-400 fill-rose-400/20" size={18} />
                  </div>
                  <div><span className="font-semibold text-stone-200">{item.t}：</span><span className="text-stone-400 font-light ml-1">{item.d}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-stone-800 to-amber-950 border-2 border-amber-500/30 text-stone-100 p-10 rounded-organic-2 relative overflow-hidden group shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-center">
            <Music className="absolute -bottom-6 -right-6 text-amber-500/10 group-hover:text-amber-500/20 group-hover:scale-110 group-hover:-rotate-12 transition duration-700" size={180} strokeWidth={1} />
            <h3 className="text-2xl font-black font-serif mb-6 relative z-10 text-stone-100 tracking-tight">[核心價值佔位符]</h3>
            <div className="space-y-5 relative z-10 text-base font-light text-stone-300 mb-8">
              <p>[內容佔位符] 描述你們不僅是一支樂團，更是婚禮與活動中的共情者，用心體會主人的期待，並用音樂傳遞感動。</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 relative z-10 backdrop-blur-sm shadow-inner overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
              <p className="text-amber-300 font-medium text-sm leading-relaxed relative z-10">[總結佔位符] la Cozzi - 拉近彼此，用音樂釦上心弦。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile/History Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <div className="bg-stone-900/40 backdrop-blur-md border-2 border-stone-800 rounded-organic p-10 md:p-14 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-rose-500/5 to-transparent pointer-events-none"></div>
          <div className="flex flex-col items-center max-w-3xl mx-auto relative z-10">
            {/* Photo Placeholder */}
            <div className="flex justify-center relative mb-12">
              <div className="absolute inset-0 bg-rose-500/10 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-organic-3 bg-stone-800 backdrop-blur-sm border-4 border-stone-700 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center group-hover:border-rose-400/40 transition-colors duration-500 overflow-hidden relative z-10">
                {/* 預留更換樂團照片的位置 */}
                <div className="text-stone-500 flex flex-col items-center space-y-2 group-hover:text-rose-300 transition-colors">
                  <Music size={40} />
                  <span className="text-sm font-mono">[樂團合照佔位符]</span>
                </div>
              </div>
            </div>
            {/* Text Placeholder */}
            <div className="space-y-6 text-center w-full">
              <h2 className="text-3xl font-black font-serif text-stone-100 tracking-tight">[品牌故事標題佔位符] la Cozzi 的誕生</h2>
              <div className="w-12 h-1.5 bg-gradient-to-r from-amber-500 to-rose-500 rounded-organic mx-auto"></div>
              <div className="text-stone-300 font-light leading-relaxed space-y-5 text-[15px] text-left mt-8 inline-block max-w-2xl px-4 md:px-0">
                <p className="text-lg font-medium text-amber-100/90">[段落一佔位符] 講述樂團成立的契機與初衷。</p>
                <p>[段落二佔位符] 分享你們過去的演出經驗，例如婚禮、商演等，以及這些經歷帶給你們的啟發。</p>
                <p>[段落三佔位符] 為什麼叫做「拉釦子」？解釋品牌的名稱涵義與背後想傳達的手作/溫度精神。</p>
                <div className="bg-rose-950/30 border border-rose-900/50 p-5 rounded-xl relative group-hover:shadow-[0_0_20px_rgba(244,63,94,0.1)] transition-all duration-500 flex items-start space-x-3">
                  <Heart className="text-rose-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-rose-300 mb-1">[核心精神佔位符] 我們的承諾</p>
                    <p className="text-rose-200/80 text-[14px]">無論舞台大小，我們都將帶來最真誠的感動與溫度。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
