import BlogPage from "@/components/BlogPage";
import { getPublishedPosts } from "@/lib/notion";

export const revalidate = 60;

export const metadata = {
  title: "深度文章 | La Cozzi 拉釦子樂團",
  description: "關於婚禮音樂、活動規劃與音響知識的深度分享。",
};

export default async function Page() {
  const posts = await getPublishedPosts(true);
  return <BlogPage posts={posts} />;
}
