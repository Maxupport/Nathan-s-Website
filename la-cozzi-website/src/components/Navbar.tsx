"use client";

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const tabs = [
    { id: 'landing', label: '索取報價', href: '/' },
    { id: 'brand', label: '樂團簡介', href: '/brand' },
    { id: 'partners', label: '夥伴列表', href: '/partners' },
    { id: 'blog', label: '深度文章', href: '/blog' },
    { id: 'reviews', label: '客戶好評', href: '/reviews' },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/90 backdrop-blur-xl border-b-2 border-stone-800">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center relative">
        <Link href="/" className="flex items-center space-x-3 relative group cursor-pointer" onClick={handleLinkClick}>
          {/* 仿 Logo 的手繪圓形 */}
          <div className="w-8 h-8 rounded-organic border-2 border-stone-100 flex items-center justify-center shrink-0 group-hover:-rotate-6 transition-transform">
            <div className="w-1.5 h-1.5 bg-stone-100 rounded-full mr-1 -mt-1"></div>
            <div className="w-1.5 h-1.5 bg-stone-100 rounded-full"></div>
          </div>
          <div className="absolute -inset-2 bg-amber-500/20 rounded-organic-2 blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <span className="text-xl lg:text-2xl font-black tracking-widest text-stone-50 relative z-10 font-serif translate-y-px whitespace-nowrap">
            La Cozzi <span className="text-base lg:text-lg">拉釦子樂團</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8 text-xs lg:text-sm font-bold text-stone-400 font-sans tracking-wide">
          {tabs.map(tab => (
            <Link 
              key={tab.id} 
              href={tab.href} 
              className={`hover:text-amber-400 transition-colors duration-300 relative py-1 whitespace-nowrap ${isActive(tab.href) ? 'text-amber-400' : ''}`}
            >
              {tab.label}
              {isActive(tab.href) && <span className="absolute -bottom-1 left-[-2px] right-[-2px] h-1.5 bg-amber-500 rounded-organic shadow-[0_0_10px_rgba(245,158,11,0.6)]"></span>}
            </Link>
          ))}
          <a href="https://ig.me/m/lacozzi_1314" target="_blank" rel="noopener noreferrer" className="inline-block bg-amber-100 text-stone-950 px-4 lg:px-5 py-2 md:py-1.5 lg:py-2.5 text-xs lg:text-sm rounded-organic-2 border-2 border-amber-200 font-black font-serif hover:bg-white hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap">
            聯絡我們
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-stone-100 p-2 z-50 relative" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-stone-950/95 backdrop-blur-xl border-b border-stone-800 p-6 flex flex-col space-y-4 shadow-xl z-40 max-h-[80vh] overflow-y-auto">
          {tabs.map(tab => (
            <Link 
              key={tab.id} 
              href={tab.href} 
              onClick={handleLinkClick}
              className={`text-lg font-bold font-sans tracking-wide text-left py-3 px-4 rounded-xl transition-colors ${isActive(tab.href) ? 'bg-amber-900/30 text-amber-400 border border-amber-500/20' : 'text-stone-300 hover:bg-stone-800/50'}`}
            >
              {tab.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-stone-800">
            <a href="https://ig.me/m/lacozzi_1314" target="_blank" rel="noopener noreferrer" className="block text-center bg-amber-100 text-stone-950 px-5 py-3.5 rounded-organic-2 border-2 border-amber-200 font-black font-serif shadow-lg">
              聯絡我們
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
