"use client";

import { Calendar, ArrowRight, Mail, MessageSquare, Linkedin, Instagram, Facebook } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-24 px-6 max-w-6xl mx-auto animate-in zoom-in-95 duration-700">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16 relative z-10">
        {/* 左側: 主要轉換日曆預約 */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 text-white p-10 rounded-[2rem] relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 opacity-50"></div>
          <div className="absolute -bottom-10 -right-10 text-orange-500/5 group-hover:text-orange-500/10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700"><Calendar size={220} strokeWidth={1} /></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <Calendar className="text-orange-400" size={28} />
            </div>
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">線上聊聊 / 專業傾聽 / 經驗分享</h2>
            <p className="text-slate-400 mb-10 leading-relaxed font-light text-base max-w-sm grow">
              不用特別準備好，也不用什麼都要自己先想清楚，你只需要帶著你最在意的事情與真正的自己過來，剩下的，讓我們一起聊聊、一起把它梳理＆彙整出來！
            </p>
            <a href="https://calendar.app.google/Vr5jfcaB2aAD35rN9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-orange-400 font-semibold hover:text-orange-300 transition-colors text-sm py-3 px-6 bg-orange-500/10 rounded-xl border border-orange-500/20 hover:bg-orange-500/20 w-max group/btn">
              前往 Google 日曆預約 <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
            </a>
          </div>
        </div>

        {/* 右側: 知識領取與AI */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-10 rounded-[2rem] shadow-xl relative">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8">
            <Mail className="text-blue-400" size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">訂閱「每週一信」</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed font-light">
            訂閱後可 <span className="text-slate-200 font-medium">立即領取【職場覺醒指引】PDF</span>，並獲得 <span className="text-slate-200 font-medium">Max AI 數位雙生</span> 24h 社群提問權限。
          </p>
          <form action="https://docs.google.com/forms/u/0/d/e/1FAIpQLScjPUif6r1y_82PTK5rKjYFK7Qjt6dWf_p3U2UG19O7gS8pVw/formResponse" method="POST" target="hidden_iframe" onSubmit={() => { setTimeout(() => { alert('🚀 訂閱成功！請至信箱收取您的專屬 PDF 與社群連結。'); }, 500); }} className="space-y-4">
            <input type="email" name="entry.952220156" required placeholder="你的 Email 地址 (例如：maxupport@gmail.com)" className="w-full px-5 py-4 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:outline-none text-sm transition-all" />
            <button type="submit" className="w-full py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 text-sm">
              免費領取覺醒指引與 AI 社群權限
            </button>
          </form>
          <iframe name="hidden_iframe" id="hidden_iframe" style={{ display: 'none' }}></iframe>
          <div className="mt-8 flex items-center space-x-3 text-xs text-slate-300 bg-slate-800/50 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <MessageSquare size={16} className="text-blue-400 shrink-0" />
            <span className="font-light">已有 <span className="text-white font-medium">300+</span> 位職場迷惘人士在 AI 社群中持續學習</span>
          </div>
        </div>
      </div>

      {/* 社群連結區域 */}
      <div className="bg-slate-900/40 rounded-[2rem] p-10 border border-white/5 shadow-lg relative overflow-hidden group col-span-1 md:col-span-2 mt-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-orange-500/5 to-blue-500/5 opacity-50 blur-3xl point-events-none"></div>
        <div className="absolute top-10 right-10 text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-1000"><Linkedin size={100} strokeWidth={1} /></div>
        <div className="relative z-10">
          <div className="mb-10 max-w-xl">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">其他社群聯絡管道</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">除上述主要管道外，你也可以透過社群追蹤 Max 的最新職場觀點或是直接私訊我。</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Linkedin, label: 'LinkedIn', d: '專業定位連結', link: 'https://www.linkedin.com/in/max-tung-342b86ba/', style: 'hover:bg-sky-500/10 hover:border-sky-500/30 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] group/social hover:text-sky-400' },
              { icon: Instagram, label: 'Instagram', d: '職涯導引文章', link: 'https://www.instagram.com/maxupport/', style: 'hover:bg-pink-500/10 hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] group/social hover:text-pink-400' },
              { icon: Facebook, label: 'Facebook', d: '追蹤最新動態', link: 'https://docs.google.com/forms/d/e/1FAIpQLSfbRWr5TB6ZvA3djtR-oIZyeaJN5zPm6ncjgB32_TeJWGeCMw/viewform', style: 'hover:bg-blue-600/10 hover:border-blue-600/30 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] group/social hover:text-blue-500' },
            ].map(social => (
              <a key={social.label} href={social.link} target="_blank" rel="noopener noreferrer" className={`bg-slate-900/80 p-6 rounded-2xl border border-white/5 flex flex-col items-start space-y-4 transition-all duration-300 ${social.style}`}>
                <div className="p-3 bg-slate-800 rounded-xl group-hover/social:bg-transparent group-hover/social:text-current transition-colors text-slate-300">
                  <social.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-slate-200 text-sm group-hover/social:text-current transition-colors">{social.label}</p>
                  <p className="text-xs text-slate-500 font-light mt-1.5 tracking-wider">{social.d}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
