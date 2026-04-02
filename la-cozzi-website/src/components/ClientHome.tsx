"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import BrandPage from '@/components/BrandPage';
import PartnersPage from '@/components/PartnersPage';
import BlogPage from '@/components/BlogPage';
import ReviewsPage from '@/components/ReviewsPage';
import type { Post, Partner } from '@/lib/notion';

export default function ClientHome({ posts, partners }: { posts: Post[], partners: Partner[] }) {
  const [activeTab, setActiveTab] = useState('landing');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (['landing', 'brand', 'partners', 'blog', 'reviews'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    
    // Run on initial mount
    handleHashChange();
    
    // Optional: listen for subsequent hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 當切換分頁時，自動將畫面捲動回最上方，避免殘留上一個頁面的捲動距離
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="font-sans antialiased text-stone-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pt-16 pb-16 relative z-10 w-full overflow-x-hidden min-h-[calc(100vh-140px)]">
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'brand' && <BrandPage setActiveTab={setActiveTab} />}
        {activeTab === 'partners' && <PartnersPage partners={partners} />}
        {activeTab === 'blog' && <BlogPage posts={posts} />}
        {activeTab === 'reviews' && <ReviewsPage />}
      </main>

      {/* Global Gradient Backgrounds: Warm tones */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[150px] rounded-full"></div>
      </div>

      <footer className="py-12 border-t border-white/5 text-center text-stone-500 text-xs bg-stone-950/80 backdrop-blur-md relative z-20 px-6">
        <div className="max-w-xl mx-auto space-y-3">
          <p className="font-medium text-stone-400 text-sm">La Cozzi 拉釦子樂團</p>
          <p className="font-light leading-relaxed">音樂不只是聽覺的饗宴，更重要的是拉近人與人之間距離的溫度。期待在下一個重要的時刻與您相遇。</p>
          <p className="font-mono tracking-wider pt-4 opacity-50">© 2026 La Cozzi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
