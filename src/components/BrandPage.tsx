"use client";

import { ChevronRight, CheckCircle2, XCircle, Quote } from 'lucide-react';

export default function BrandPage({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {/* Hero Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full point-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full point-events-none"></div>

        <div className="relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-widest mb-6">MAXUPPORT</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl mx-auto tracking-tight drop-shadow-sm">
            你不是不夠努力，<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">只是在某些地方過度用力了</span>
          </h1>
          <div className="text-lg md:text-xl text-slate-400 max-w-5xl mx-auto mb-10 leading-relaxed font-light space-y-6 px-4">
            <p>這是一個提供線上職涯價值重估以及困境陪伴的一對一訪談服務，可以協助職場人梳理混亂、<br className="hidden md:block" />釐清方向的生涯/職涯擺渡（引導）服務，已服務超過 300+ 職場人重新審視職涯與人生。</p>
            <p className="text-slate-300">如果你現在處於「選擇很多卻無法下決定」、「一直想往前卻停滯不前」或是「找不到自己的優勢路線」的情況，<br className="hidden md:block" />Maxupport 擺渡服務將幫你梳理現在眼前的混亂，並打開你對於自己未來的期待！</p>
          </div>
          <button onClick={() => setActiveTab('contact')} className="group bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-400 transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:-translate-y-1 inline-flex items-center">
            預約 30 分鐘，把問題講清楚 <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">「生涯擺渡」能解決的核心問題</h2>
              <p className="text-slate-400 font-light leading-relaxed text-lg">
                我無法教你怎麼立即成功，但我可以引導你找出梳理眼前的混亂的關鍵步驟與方向，讓改變開始發生。
              </p>
            </div>
            <div className="space-y-4 bg-slate-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl">
              {[
                { t: "問題講清楚", d: "不要一直想，而是學會多角度檢視" },
                { t: "選項攤開", d: "客觀為選項評分，讓「決定」變簡單" },
                { t: "下一步定出來", d: "在不確定的情況下仍敢於行動" },
              ].map(item => (
                <div key={item.t} className="flex items-start space-x-4">
                  <div className="bg-emerald-500/10 p-1.5 rounded-full shrink-0">
                    <CheckCircle2 className="text-emerald-400" size={18} />
                  </div>
                  <div className="mt-1"><span className="font-semibold text-slate-200">{item.t}：</span><span className="text-slate-500 font-light">{item.d}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-white p-10 rounded-[2rem] relative overflow-hidden group shadow-2xl">
            <Quote className="absolute -bottom-6 -right-6 text-orange-500/10 group-hover:text-orange-500/20 group-hover:scale-110 transition duration-700" size={180} strokeWidth={1} />
            <h3 className="text-2xl font-bold mb-8 relative z-10 text-white tracking-tight">不適合所有人</h3>
            <div className="space-y-5 relative z-10 text-base font-light text-slate-300 mb-10">
              {[
                { type: "X", t: "快速且確定會成功的方法" },
                { type: "X", t: "一套照做就會贏的標準程序 (SOP)" },
                { type: "X", t: "有人直接告訴你標準答案" },
              ].map(item => (
                <div key={item.t} className="flex items-center space-x-3">
                  <XCircle className="text-rose-400 shrink-0" size={20} />
                  <span className="text-slate-400">想要 <span className="text-slate-200 font-medium">{item.t}</span></span>
                </div>
              ))}
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 relative z-10 backdrop-blur-sm">
              <p className="text-orange-300 font-medium text-sm leading-relaxed">如果你卡住但講不清楚、缺資訊缺判斷框架...那這裡會對你有用。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none"></div>
          <div className="flex flex-col items-center max-w-3xl mx-auto relative z-10">
            {/* Photo Placeholder */}
            <div className="flex justify-center relative mb-12">
              <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-slate-900/80 backdrop-blur-sm border-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center group-hover:border-orange-500/30 transition-colors duration-500 overflow-hidden relative z-10">
                <img src="https://lh3.googleusercontent.com/d/1CCyFkbZ1UTYiQzrXS6HdJtrfH_zV03vk" alt="Max 個人照" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            {/* Text Placeholder */}
            <div className="space-y-6 text-center w-full">
              <h2 className="text-3xl font-bold text-white tracking-tight">我是 Max，生涯擺渡人</h2>
              <div className="w-12 h-1 bg-orange-500/50 rounded-full mx-auto"></div>
              <div className="text-slate-300 font-light leading-relaxed space-y-5 text-[15px] text-left mt-8 inline-block max-w-2xl px-4 md:px-0">
                <p className="text-lg font-medium text-slate-200">從 2022 年起協助超過 300+ 職場人重新審視職涯與人生，始終相信每個人都能擁有專屬於自己的榮耀時刻！</p>
                <p>有些人，是在一切都準備好之後才往前走；<br />也有一些人，是在還不確定的時候，選擇繼續相信。</p>
                <p>白天，我在風險投資基金看趨勢、在天使投資俱樂部淘選創辦人，評估從太空到生活的各類項目；這些評估說來專業但其實無非就是「識人」的延伸 — 看一個人，能不能在混亂與不確定中，撐住自己想走的方向。</p>
                <p>這些年，我看過很多聰明、努力、條件很好的人。<br />他們不是做不到，而是太早開始懷疑自己。</p>
                <p>透過文字、對話與陪伴，去理解那些「看起來都很好，卻過得不太快樂」的時刻，也試著陪一個人，在現實裡找到繼續走下去的方式。</p>
                <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-xl relative group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-500">
                  <p className="font-semibold text-orange-400 mb-2">我做的事情很簡單——</p>
                  <p className="text-orange-200/90 text-[15px]">就是在你快要放棄選擇之前，陪你把最關鍵的那一步，再想清楚一點。</p>
                </div>
                <p className="pt-4 text-slate-500 font-medium text-center">我是 Max，我是在現實裡持續尋找理想的人。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
