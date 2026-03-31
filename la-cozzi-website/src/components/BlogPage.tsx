"use client";

import { useState } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/notion';
import Link from 'next/link';

export default function BlogPage({ posts }: { posts: Post[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));

  const filteredPosts = selectedTag 
    ? posts.filter(p => p.tags.includes(selectedTag))
    : posts;

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto animate-in fade-in duration-700 pb-32">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-amber-500/20 blur-[80px] rounded-full point-events-none"></div>
        <h2 className="text-4xl font-black font-serif text-stone-100 mb-6 relative z-10 tracking-tight">
          [專欄標題佔位符] 演出花絮與專欄
        </h2>
        <p className="text-stone-300 max-w-xl mx-auto font-light leading-relaxed text-lg relative z-10">
          [副標題佔位符] 紀錄每一場演出的感動、婚禮的幕後故事，以及我們對音樂的觀察與堅持。
        </p>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12 relative z-10">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-1.5 rounded-organic border-2 text-sm font-black font-serif transition-all ${selectedTag === null ? 'bg-amber-500 border-amber-600 text-stone-950 shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-stone-800/80 text-stone-400 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-stone-50 border-stone-700/50'}`}
          >
            全部文章
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-organic border-2 text-sm font-black font-serif transition-all ${selectedTag === tag ? 'bg-amber-500 border-amber-600 text-stone-950 shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-stone-800/80 text-stone-400 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-stone-50 border-stone-700/50'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-20 text-stone-500 relative z-10 bg-stone-900/40 rounded-organic border-2 border-stone-800 p-8 shadow-inner">
          <p className="text-lg font-bold">[佔位符] 目前還沒有上架文章。未來這裡將會呈現從 Notion 同步的花絮與專欄。</p>
          <span className="text-xs mt-4 block text-amber-500/70 font-mono">（系統提示：請準備新的 Notion Database ID 來串接）</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {filteredPosts.map((post, i) => {
            const isExternal = post.slug.startsWith('http');
            const href = isExternal ? post.slug : `/blog/${post.slug}`;
            const Tag = isExternal ? 'a' : Link;

            let youtubeId = '';
            if (post.youtubeUrl) {
              if (post.youtubeUrl.includes('youtube.com/watch')) {
                youtubeId = new URL(post.youtubeUrl).searchParams.get('v') || '';
              } else if (post.youtubeUrl.includes('youtu.be/')) {
                youtubeId = post.youtubeUrl.split('youtu.be/')[1].split('?')[0];
              }
            }

            return (
              <div 
                key={i} 
                className="bg-stone-900/60 rounded-organic border-2 border-stone-800 overflow-hidden group hover:border-amber-500/40 transition-all duration-500 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_rgba(217,119,6,0.2)] flex flex-col relative"
              >
                {youtubeId ? (
                  <div className="h-56 bg-stone-950 relative border-b-2 border-stone-800 shrink-0">
                    <iframe src={`https://www.youtube.com/embed/${youtubeId}?rel=0`} className="w-full h-full absolute inset-0 z-20" allowFullScreen></iframe>
                  </div>
                ) : (
                  <Tag 
                    href={href as any}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="h-48 bg-stone-800 relative overflow-hidden shrink-0 block z-10"
                  >
                    {post.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 to-stone-900 flex items-center justify-center">
                        <FileText size={40} className="text-amber-500/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                  </Tag>
                )}
                
                <Tag
                  href={href as any}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="p-8 flex flex-col grow z-10"
                >
                  <div className="text-xs font-mono text-amber-400 mb-3 tracking-wider flex items-center justify-between">
                    <span>{post.date ? post.date.split('T')[0] : ''}</span>
                    <div className="flex space-x-2">
                       {post.tags.slice(0, 2).map((t, idx) => (
                         <span key={idx} className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-[10px]">#{t}</span>
                       ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-black font-serif text-stone-100 mb-2 line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-stone-400 text-sm line-clamp-3 mb-4 leading-relaxed font-light">{post.excerpt}</p>
                  )}
                  <div className="mt-8 pt-4 border-t-2 border-stone-800 flex items-center justify-between text-sm font-bold text-stone-500 group-hover:text-amber-500 transition-colors mt-auto">
                    <span>閱讀全文</span>
                    <ArrowRight size={16} />
                  </div>
                </Tag>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
