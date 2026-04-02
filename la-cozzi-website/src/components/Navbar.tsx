"use client";

import { MessageSquare } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/90 backdrop-blur-xl border-b-2 border-stone-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 relative group cursor-pointer" onClick={() => setActiveTab('landing')}>
          {/* 仿 Logo 的手繪圓形 */}
          <div className="w-8 h-8 rounded-organic border-2 border-stone-100 flex items-center justify-center shrink-0 group-hover:-rotate-6 transition-transform">
            <div className="w-1.5 h-1.5 bg-stone-100 rounded-full mr-1 -mt-1"></div>
            <div className="w-1.5 h-1.5 bg-stone-100 rounded-full"></div>
          </div>
          <div className="absolute -inset-2 bg-amber-500/20 rounded-organic-2 blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <span className="text-2xl font-black tracking-widest text-stone-50 relative z-10 font-serif translate-y-px">
            La Cozzi <span className="text-lg">拉釦子樂團</span>
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-stone-400 font-sans tracking-wide">
          {[
            { id: 'landing', label: '索取報價' },
            { id: 'brand', label: '樂團簡介' },
            { id: 'partners', label: '夥伴列表' },
            { id: 'blog', label: '深度文章' },
            { id: 'reviews', label: '客戶好評' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`hover:text-amber-400 transition-colors duration-300 relative py-1 ${activeTab === tab.id ? 'text-amber-400' : ''}`}>
              {tab.label}
              {activeTab === tab.id && <span className="absolute -bottom-1 left-[-2px] right-[-2px] h-1.5 bg-amber-500 rounded-organic shadow-[0_0_10px_rgba(245,158,11,0.6)]"></span>}
            </button>
          ))}
          <a href="https://ig.me/m/lacozzi_1314" target="_blank" rel="noopener noreferrer" className="inline-block bg-amber-100 text-stone-950 px-5 py-2.5 rounded-organic-2 border-2 border-amber-200 font-black font-serif hover:bg-white hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl">
            聯絡我們
          </a>
        </div>
      </div>
    </nav>
  );
}
