"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import BrandPage from '@/components/BrandPage';
import ServicesPage from '@/components/ServicesPage';
import BlogPage from '@/components/BlogPage';
import ReviewsPage from '@/components/ReviewsPage';
import ContactPage from '@/components/ContactPage';
import type { Post } from '@/lib/notion';

export default function ClientHome({ posts }: { posts: Post[] }) {
  const [activeTab, setActiveTab] = useState('brand');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (['brand', 'services', 'blog', 'reviews', 'contact'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    
    // Run on initial mount
    handleHashChange();
    
    // Optional: listen for subsequent hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="font-sans antialiased text-slate-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pt-16 pb-16 relative z-10 w-full overflow-x-hidden min-h-[calc(100vh-140px)]">
        {activeTab === 'brand' && <BrandPage setActiveTab={setActiveTab} />}
        {activeTab === 'services' && <ServicesPage />}
        {activeTab === 'blog' && <BlogPage posts={posts} />}
        {activeTab === 'reviews' && <ReviewsPage />}
        {activeTab === 'contact' && <ContactPage />}
      </main>

      {/* Global Gradient Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[150px] rounded-full"></div>
      </div>

      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-xs bg-slate-950/80 backdrop-blur-md relative z-20 px-6">
        <div className="max-w-xl mx-auto space-y-3">
          <p className="font-medium text-slate-400 text-sm">Maxupport @ 生涯擺渡人 Max</p>
          <p className="font-light leading-relaxed">如果你也正處於卡住但講不清楚卡在哪的狀態，帶上你的混亂，讓我們一起在其中找到再出發的可能。</p>
          <p className="font-mono tracking-wider pt-4 opacity-50">© 2022. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
