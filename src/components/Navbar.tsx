"use client";

import { useState } from 'react';
import { MessageSquare, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'brand', label: '品牌簡介' },
    { id: 'services', label: '服務說明' },
    { id: 'blog', label: '深度文章' },
    { id: 'reviews', label: '使用者好評' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 relative group cursor-pointer" onClick={() => { handleNavClick('brand'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="absolute -inset-2 bg-orange-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <span className="text-xl font-extrabold tracking-tighter text-white relative z-10">Maxupport</span>
          <span className="text-sm text-slate-500 font-light relative z-10 hidden sm:inline-block">| 生涯擺渡人 Max</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          {navItems.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`hover:text-orange-400 transition-colors duration-300 relative ${activeTab === tab.id ? 'text-orange-400' : ''}`}>
              {tab.label}
              {activeTab === tab.id && <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>}
            </button>
          ))}
          <button onClick={() => setActiveTab('contact')} className={`bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all duration-300 text-xs flex items-center shadow-lg hover:shadow-xl ${activeTab === 'contact' ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950' : ''}`}>
            <MessageSquare size={14} className="mr-1.5" /> 聯絡 Max
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/5 shadow-2xl w-full">
          <div className="flex flex-col px-6 py-4 space-y-4">
            {navItems.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => handleNavClick(tab.id)} 
                className={`text-left text-sm font-medium hover:text-orange-400 transition-colors py-2 ${activeTab === tab.id ? 'text-orange-400' : 'text-slate-400'}`}
              >
                {tab.label}
              </button>
            ))}
            <button 
              onClick={() => handleNavClick('contact')} 
              className={`bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all duration-300 text-sm font-medium flex items-center justify-center shadow-lg mt-4 w-full ${activeTab === 'contact' ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950' : ''}`}
            >
              <MessageSquare size={16} className="mr-2" /> 聯絡 Max
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
