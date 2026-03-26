"use client";

import { useState } from 'react';
import { ChevronRight, FileText, ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/notion';
import Link from 'next/link';

export default function BlogPage({ posts }: { posts: Post[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));

  const filteredPosts = selectedTag 
    ? posts.filter(p => p.tags.includes(selectedTag))
    : posts;

  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto animate-in fade-in duration-700 pb-32">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-sky-500/20 blur-[80px] rounded-full point-events-none"></div>
        <h2 className="text-4xl font-extrabold text-white mb-6 relative z-10 tracking-tight">深度文章與觀點</h2>
        <p className="text-slate-400 max-w-xl mx-auto font-light leading-relaxed text-lg relative z-10">從混亂到清晰、從分散到收斂，用文字記錄對職場及人生的看法與觀點。</p>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12 relative z-10">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTag === null ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5'}`}
          >
            全部文章
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTag === tag ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500 relative z-10">
          目前還沒有上架任何深度文章。<br />
          <span className="text-xs mt-2 block">（系統提示：請在 Notion 將文章狀態改為 Published）</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {filteredPosts.map((post, i) => {
            const isExternal = post.slug.startsWith('http');
            const href = isExternal ? post.slug : `/blog/${post.slug}`;
            const Tag = isExternal ? 'a' : Link;

            return (
              <Tag 
                key={i} 
                href={href as any}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined} 
                className="bg-slate-900/60 rounded-[2rem] border border-white/5 overflow-hidden group hover:border-sky-500/30 transition-all duration-500 shadow-xl hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(14,165,233,0.15)] flex flex-col"
              >
                <div className="h-48 bg-slate-800 relative overflow-hidden shrink-0">
                  {post.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-900 to-slate-900 flex items-center justify-center">
                      <FileText size={40} className="text-sky-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <div className="p-8 flex flex-col grow">
                  <div className="text-xs font-mono text-sky-400 mb-3 tracking-wider flex items-center justify-between">
                    <span>{post.date ? post.date.split('T')[0] : ''}</span>
                    <div className="flex space-x-2">
                       {post.tags.slice(0, 2).map((t, idx) => (
                         <span key={idx} className="bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded text-[10px]">#{t}</span>
                       ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-sky-300 transition-colors">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed">{post.excerpt}</p>
                  )}
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-sm text-slate-500 group-hover:text-sky-400 transition-colors mt-auto">
                    <span>閱讀全文</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
}
