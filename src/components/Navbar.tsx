"use client";

import { MessageSquare } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 relative group cursor-pointer" onClick={() => { setActiveTab('brand'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="absolute -inset-2 bg-orange-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <span className="text-xl font-extrabold tracking-tighter text-white relative z-10">Maxupport</span>
          <span className="text-sm text-slate-500 font-light relative z-10 hidden sm:inline-block">| 生涯擺渡人 Max</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          {[
            { id: 'brand', label: '品牌簡介' },
            { id: 'services', label: '服務說明' },
            { id: 'blog', label: '深度文章' },
            { id: 'reviews', label: '使用者好評' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`hover:text-orange-400 transition-colors duration-300 relative ${activeTab === tab.id ? 'text-orange-400' : ''}`}>
              {tab.label}
              {activeTab === tab.id && <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>}
            </button>
          ))}
          <button onClick={() => setActiveTab('contact')} className={`bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all duration-300 text-xs flex items-center shadow-lg hover:shadow-xl ${activeTab === 'contact' ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950' : ''}`}>
            <MessageSquare size={14} className="mr-1.5" /> 聯絡 Max
          </button>
        </div>
      </div>
    </nav>
  );
}
