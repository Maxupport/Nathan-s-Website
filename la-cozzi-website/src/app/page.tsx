import ClientHome from '@/components/ClientHome';
import { getPublishedPosts, getPartners } from '@/lib/notion';

export const revalidate = 60; // SSR with ISR every 60 seconds

export default async function Home() {
  const posts = await getPublishedPosts(true);
  const partners = await getPartners();
  return <ClientHome posts={posts} partners={partners} />;
}
