import { getPublishedPosts, getSinglePost } from './src/lib/notion';

async function run() {
  const posts = await getPublishedPosts(false);
  console.log(`Found ${posts.length} published posts.`);
  
  for (const p of posts) {
    if (p.title.includes('幸運無關機率')) {
      console.log('--- FOUND TARGET POST ---');
      console.log('Title:', p.title);
      console.log('Slug:', JSON.stringify(p.slug));
      console.log('URLEncoded Slug:', encodeURIComponent(p.slug));
      
      const single = await getSinglePost(p.slug);
      console.log('getSinglePost result using exact slug:', single ? 'SUCCESS' : 'FAILED - NULL');
      
      const singleEncoded = await getSinglePost(encodeURIComponent(p.slug));
      console.log('getSinglePost result using encoded slug:', singleEncoded ? 'SUCCESS' : 'FAILED - NULL');
    }
  }
}
run();
