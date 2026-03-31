"use client";

import { Mail, MessageSquare, Music, Facebook, Instagram } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [quoteType, setQuoteType] = useState('wedding');

  return (
    <div className="py-24 px-6 max-w-3xl mx-auto animate-in zoom-in-95 duration-700">
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full point-events-none"></div>
        <Music className="w-16 h-16 text-amber-500/40 mx-auto mb-6 relative z-10" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-100 tracking-tight relative z-10 drop-shadow-md mb-4 font-serif">
          專屬您的音樂演出報價
        </h1>
        <p className="text-stone-300 font-light leading-relaxed text-lg max-w-xl mx-auto relative z-10">
          選擇您的活動類型並留下 Email，系統將會立即將對應的報價單與詳細說明內容發送給您。
        </p>
      </div>

      <div className="bg-stone-900/60 backdrop-blur-md border-2 border-stone-800 p-10 md:p-14 rounded-organic shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative group max-w-xl mx-auto">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-rose-500/5 blur-[80px] rounded-full point-events-none transition-colors duration-1000 group-hover:bg-rose-500/10"></div>
        
        <form action="#" method="POST" target="hidden_iframe" onSubmit={(e) => { e.preventDefault(); setTimeout(() => { alert('🚀 [自動回覆佔位符] 報價單已發送至您的信箱，請查收！'); }, 500); }} className="relative z-10 space-y-8">
          
          {/* 報價類型選擇 (Radio Buttons) */}
          <div className="space-y-4">
            <label className="block text-stone-200 text-sm font-semibold mb-2">請選擇您需要的報價類型：</label>
            <div className="grid grid-cols-2 gap-6">
              <label className={`cursor-pointer border-2 p-4 text-center transition-all duration-300 ${quoteType === 'wedding' ? 'bg-amber-500/10 border-amber-500/50 rounded-organic shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-stone-950/50 border-stone-800 rounded-organic hover:border-amber-500/30 text-stone-400'}`}>
                <input type="radio" name="quote_type" value="wedding" className="hidden" checked={quoteType === 'wedding'} onChange={() => setQuoteType('wedding')} />
                <span className={`font-medium ${quoteType === 'wedding' ? 'text-amber-300' : 'text-stone-400'}`}>婚禮演出報價</span>
              </label>
              <label className={`cursor-pointer border-2 p-4 text-center transition-all duration-300 ${quoteType === 'commercial' ? 'bg-amber-500/10 border-amber-500/50 rounded-organic-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-stone-950/50 border-stone-800 rounded-organic-2 hover:border-amber-500/30 text-stone-400'}`}>
                <input type="radio" name="quote_type" value="commercial" className="hidden" checked={quoteType === 'commercial'} onChange={() => setQuoteType('commercial')} />
                <span className={`font-medium ${quoteType === 'commercial' ? 'text-amber-300' : 'text-stone-400'}`}>商業演出報價</span>
              </label>
            </div>
          </div>

          {/* Email 輸入框 */}
          <div className="space-y-4">
            <label className="block text-stone-200 text-sm font-semibold mb-2">接收報價單的 Email：</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-stone-500" />
              </div>
              <input type="email" name="email_placeholder" required placeholder="name@example.com" className="w-full pl-11 pr-5 py-4 bg-stone-950/70 border-2 border-stone-800 rounded-organic-3 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none text-base transition-all shadow-inner" />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-amber-500 text-stone-950 rounded-organic-2 font-black border-2 border-amber-400 hover:bg-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.2)] hover:shadow-[0_0_30px_rgba(217,119,6,0.4)] transition-all duration-300 text-lg mt-4 font-serif">
            [按鈕佔位符] 立即索取報價單
          </button>
        </form>
        <iframe name="hidden_iframe" id="hidden_iframe" style={{ display: 'none' }}></iframe>
        
        <div className="relative z-10 mt-8 pt-6 border-t border-stone-800 flex items-center justify-center space-x-2 text-xs text-stone-400">
          <MessageSquare size={14} className="text-amber-500/70 shrink-0" />
          <span className="font-light">系統將於 3 分鐘內自動發送，如未收到請檢查垃圾信件匣。</span>
        </div>
      </div>

      {/* 其他社群聯絡管道 */}
      <div className="mt-20 max-w-4xl mx-auto bg-stone-900/40 backdrop-blur-sm border-2 border-stone-800 rounded-organic-2 p-10 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full point-events-none group-hover:bg-amber-500/10 transition-colors duration-1000"></div>
        
        <h2 className="text-2xl font-black font-serif text-stone-100 mb-3 tracking-tight relative z-10">其他社群聯絡管道</h2>
        <p className="text-stone-400 font-light text-sm mb-10 relative z-10">除上述主要報價管道外，您也可以透過社群關注 la Cozzi 的最新動態，或是直接私訊我們。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Email / 專案詢問 */}
          <a href="mailto:band@lacozzi.com" className="bg-stone-950/60 border-2 border-stone-800 hover:border-amber-500/60 p-6 rounded-organic transition-all duration-300 hover:-translate-y-1 group/card flex flex-col justify-center items-start">
            <div className="bg-stone-800/80 p-3 rounded-organic-2 mb-4 group-hover/card:bg-amber-500/20 group-hover/card:text-amber-400 text-stone-400 transition-colors">
              <Mail size={24} />
            </div>
            <h3 className="text-stone-200 font-black font-serif text-lg mb-1 group-hover/card:text-amber-400 transition-colors">寫信給我們</h3>
            <p className="text-stone-500 text-xs font-light">專案與合作洽詢</p>
          </a>
          
          {/* Instagram */}
          <a href="#" target="_blank" rel="noopener noreferrer" className="bg-stone-950/60 border-2 border-stone-800 hover:border-amber-500/60 p-6 rounded-organic-2 transition-all duration-300 hover:-translate-y-1 group/card flex flex-col justify-center items-start">
            <div className="bg-stone-800/80 p-3 rounded-organic-3 mb-4 group-hover/card:bg-amber-500/20 group-hover/card:text-amber-400 text-stone-400 transition-colors">
              <Instagram size={24} />
            </div>
            <h3 className="text-stone-200 font-black font-serif text-lg mb-1 group-hover/card:text-amber-400 transition-colors">Instagram</h3>
            <p className="text-stone-500 text-xs font-light">演出花絮與動態</p>
          </a>
          
          {/* Facebook */}
          <a href="#" target="_blank" rel="noopener noreferrer" className="bg-stone-950/60 border-2 border-stone-800 hover:border-amber-500/60 p-6 rounded-organic transition-all duration-300 hover:-translate-y-1 group/card flex flex-col justify-center items-start">
            <div className="bg-stone-800/80 p-3 rounded-organic mb-4 group-hover/card:bg-amber-500/20 group-hover/card:text-amber-400 text-stone-400 transition-colors">
              <Facebook size={24} />
            </div>
            <h3 className="text-stone-200 font-black font-serif text-lg mb-1 group-hover/card:text-amber-400 transition-colors">Facebook</h3>
            <p className="text-stone-500 text-xs font-light">追蹤最新消息</p>
          </a>
        </div>
      </div>
    </div>
  );
}
