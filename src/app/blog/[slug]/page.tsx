import { getSinglePost, getPublishedPosts } from '@/lib/notion';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

export const revalidate = 60; // ISR cache timing

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: any) {
  const params = await props.params;
  const data = await getSinglePost(params.slug);
  if (!data) return { title: 'Not Found' };
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maxupport.com';
  
  return {
    title: `${data.post.title} | Maxupport 深度文章`,
    description: `Maxupport 深度文章 - ${data.post.title}`,
    openGraph: {
      title: `${data.post.title} | Maxupport 深度文章`,
      description: `Maxupport 深度文章 - ${data.post.title}`,
      url: `${baseUrl}/blog/${params.slug}`,
      type: 'article',
      publishedTime: data.post.date,
      authors: ['Max'],
      tags: data.post.tags,
      images: data.post.cover ? [data.post.cover] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.post.title} | Maxupport 深度文章`,
      description: `Maxupport 深度文章 - ${data.post.title}`,
      images: data.post.cover ? [data.post.cover] : [],
    },
  };
}

export default async function BlogPostPage(props: any) {
  const params = await props.params;
  const data = await getSinglePost(params.slug);
  
  if (!data) {
    notFound();
  }

  const { post, markdown, nextPost } = data;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maxupport.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'Max',
      url: 'https://www.instagram.com/maxupport/',
    },
    image: post.cover ? [post.cover] : [],
    url: `${baseUrl}/blog/${params.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/#blog" className="text-slate-400 hover:text-white flex items-center transition-colors text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" />
            返回深度文章列表
          </a>
          <div className="text-sm font-extrabold tracking-tighter text-white">Maxupport</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-14 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-sky-400 font-mono mb-6">
            <span className="flex items-center"><Calendar size={14} className="mr-1.5" />{post.date ? post.date.split('T')[0] : ''}</span>
            {post.tags.length > 0 && (
              <span className="flex items-center"><Tag size={14} className="mr-1.5" /> {post.tags.join(', ')}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-8">
            {post.title}
          </h1>
          {post.cover && (
            <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl mt-12 bg-slate-900/50 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt={post.title} className="max-w-full h-auto max-h-[70vh] object-contain rounded-3xl" />
            </div>
          )}
        </header>

        <article className="prose prose-invert prose-lg prose-sky max-w-none prose-headings:font-bold prose-a:text-sky-400 hover:prose-a:text-sky-300 prose-img:rounded-2xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </article>

        <div className="mt-24 pt-10 border-t border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
          {nextPost && (
            <Link 
              href={nextPost.slug.startsWith('http') ? nextPost.slug : `/blog/${nextPost.slug}`}
              target={nextPost.slug.startsWith('http') ? "_blank" : undefined}
              className="w-full md:w-1/2 text-left px-6 py-5 rounded-2xl bg-slate-900 border border-white/5 text-slate-300 hover:border-sky-500/30 transition-all shadow-xl hover:shadow-[0_10px_30px_rgba(14,165,233,0.1)] group"
            >
              <div className="text-xs text-slate-500 mb-1.5 font-medium tracking-wider">再讀一篇</div>
              <div className="font-bold text-sky-400 group-hover:text-sky-300 transition-colors line-clamp-2">{nextPost.title}</div>
            </Link>
          )}
          
          <a 
            href="/#contact"
            className="w-full md:w-auto text-center px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold hover:to-orange-500 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] md:ml-auto shrink-0 text-lg"
          >
            與 Max 聊聊
          </a>
        </div>
      </main>
      
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[150px] rounded-full"></div>
      </div>
    </>
  );
}
