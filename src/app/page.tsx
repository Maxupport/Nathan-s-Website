import ClientHome from '@/components/ClientHome';
import { getPublishedPosts } from '@/lib/notion';

export const revalidate = 60; // SSR with ISR every 60 seconds

export default async function Home() {
  const posts = await getPublishedPosts();
  return <ClientHome posts={posts} />;
}
