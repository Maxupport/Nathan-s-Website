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
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lacozzi.com';
  
  return {
    title: `${data.post.title} | La Cozzi 深度文章`,
    description: `La Cozzi 深度文章 - ${data.post.title}`,
    openGraph: {
      title: `${data.post.title} | La Cozzi 深度文章`,
      description: `La Cozzi 深度文章 - ${data.post.title}`,
      url: `${baseUrl}/blog/${params.slug}`,
      type: 'article',
      publishedTime: data.post.date,
      authors: ['La Cozzi 拉釦子樂團'],
      tags: data.post.tags,
      images: data.post.cover ? [data.post.cover] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.post.title} | La Cozzi 深度文章`,
      description: `La Cozzi 深度文章 - ${data.post.title}`,
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lacozzi.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'La Cozzi 拉釦子樂團',
      url: 'https://www.instagram.com/lacozzi_1314/',
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
      <nav className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/#blog" className="text-stone-400 hover:text-amber-400 flex items-center transition-colors text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" />
            返回深度文章列表
          </Link>
          <div className="text-sm font-black tracking-tighter text-stone-100 font-serif">La Cozzi 拉釦子樂團</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-14 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-amber-400 font-mono mb-6">
            <span className="flex items-center"><Calendar size={14} className="mr-1.5" />{post.date ? post.date.split('T')[0] : ''}</span>
            {post.tags.length > 0 && (
              <span className="flex items-center"><Tag size={14} className="mr-1.5" /> {post.tags.join(', ')}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-stone-100 leading-tight tracking-tight mb-8">
            {post.title}
          </h1>
          {post.cover && (
            <div className="w-full rounded-organic-2 overflow-hidden border-2 border-stone-800 shadow-2xl mt-12 bg-stone-900/50 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt={post.title} className="max-w-full h-auto max-h-[70vh] object-contain rounded-organic-2" />
            </div>
          )}
        </header>

        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:font-serif prose-a:text-amber-500 hover:prose-a:text-amber-400 prose-img:rounded-organic-2 text-stone-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </article>

        <div className="mt-24 pt-10 border-t border-stone-800 flex flex-col md:flex-row gap-6 items-center justify-between">
          {nextPost && (
            <Link 
              href={nextPost.slug.startsWith('http') ? nextPost.slug : `/blog/${nextPost.slug}`}
              target={nextPost.slug.startsWith('http') ? "_blank" : undefined}
              className="w-full md:w-1/2 text-left px-6 py-5 rounded-organic bg-stone-900/60 border-2 border-stone-800 text-stone-300 hover:border-amber-500/40 transition-all shadow-[0_15px_40px_-20px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-15px_rgba(217,119,6,0.2)] group"
            >
              <div className="text-xs text-stone-500 mb-1.5 font-medium tracking-wider">再讀一篇</div>
              <div className="font-bold text-amber-500 font-serif group-hover:text-amber-400 transition-colors line-clamp-2">{nextPost.title}</div>
            </Link>
          )}
          
          <a 
            href="https://ig.me/m/lacozzi_1314"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto text-center px-10 py-5 rounded-organic-2 bg-amber-600 border-2 border-amber-500 text-stone-50 font-black font-serif hover:bg-amber-500 transition-all shadow-lg hover:shadow-xl md:ml-auto shrink-0 text-lg"
          >
            與我們聊聊
          </a>
        </div>
      </main>
      
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[150px] rounded-full"></div>
      </div>
    </>
  );
}
