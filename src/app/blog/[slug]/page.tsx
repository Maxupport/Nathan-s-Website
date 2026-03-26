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
  
  return {
    title: `${data.post.title} | Maxupport 深度文章`,
    description: `Maxupport 深度文章 - ${data.post.title}`,
  };
}

export default async function BlogPostPage(props: any) {
  const params = await props.params;
  const data = await getSinglePost(params.slug);
  
  if (!data) {
    notFound();
  }

  const { post, markdown } = data;

  return (
    <>
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/#blog" className="text-slate-400 hover:text-white flex items-center transition-colors text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" />
            返回首頁
          </Link>
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
            <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl mt-12 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </header>

        <article className="prose prose-invert prose-lg prose-sky max-w-none prose-headings:font-bold prose-a:text-sky-400 hover:prose-a:text-sky-300 prose-img:rounded-2xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </article>
      </main>
      
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[150px] rounded-full"></div>
      </div>
    </>
  );
}
