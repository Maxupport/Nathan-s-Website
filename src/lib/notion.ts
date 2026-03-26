import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export interface Post {
  id: string;
  slug: string;
  title: string;
  status: string;
  tags: string[];
  cover: string;
  date: string;
}

const getPropertyText = (prop: any): string => {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title.map((t: any) => t.plain_text).join('');
  if (prop.type === 'rich_text') return prop.rich_text.map((t: any) => t.plain_text).join('');
  if (prop.type === 'select') return prop.select?.name || '';
  if (prop.type === 'url') return prop.url || '';
  return '';
};

const getPropertyTags = (prop: any): string[] => {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select.map((s: any) => s.name);
};

const getPropertyCover = (prop: any): string => {
  if (!prop || prop.type !== 'files') return '';
  if (prop.files.length === 0) return '';
  const file = prop.files[0];
  if (file.type === 'external') return file.external.url;
  if (file.type === 'file') return file.file.url;
  return '';
};

export const getPublishedPosts = async (): Promise<Post[]> => {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return [];

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: '發布狀態',
          select: {
            equals: 'Published'
          }
        },
        sorts: [
          {
            timestamp: 'created_time',
            direction: 'descending'
          }
        ]
      })
    });
    
    if (!response.ok) {
      console.error('Notion API Error:', await response.text());
      return [];
    }

    const result = await response.json();
    return result.results.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        // Match user's setup based on the exact names they were told
        title: getPropertyText(p['標題'] || p.Title || p.Name),
        slug: getPropertyText(p['短網址'] || p.Slug || p.URL),
        status: getPropertyText(p['發布狀態'] || p.Status),
        tags: getPropertyTags(p['#標籤'] || p.Tags || p['標籤']),
        cover: getPropertyCover(p['封面圖'] || p.Cover || p.Thumbnail),
        date: page.created_time,
      };
    }).filter((post: any) => post.title); // Ensure it's not a completely empty row
  } catch (error) {
    console.error("Failed to fetch Notion posts", error);
    return [];
  }
};

export const getSinglePost = async (slug: string) => {
  const posts = await getPublishedPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  const mdBlocks = await n2m.pageToMarkdown(post.id);
  const markdown = n2m.toMarkdownString(mdBlocks);
  
  return {
    post,
    markdown: markdown.parent || '',
  };
};
