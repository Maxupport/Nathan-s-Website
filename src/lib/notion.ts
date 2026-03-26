// Using native fetch to bypass Turbopack CJS Edge-runtime bundling bugs from the official Notion SDK
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

const parseRichText = (richTextArr: any[]) => {
  if (!richTextArr) return '';
  return richTextArr.map((rt) => {
    let text = rt.plain_text;
    if (rt.annotations) {
      if (rt.annotations.bold) text = `**${text}**`;
      if (rt.annotations.italic) text = `*${text}*`;
      if (rt.annotations.strikethrough) text = `~~${text}~~`;
      if (rt.annotations.code) text = `\`${text}\``;
    }
    if (rt.href) text = `[${text}](${rt.href})`;
    return text;
  }).join('');
};

const fetchNotionBlocksAsMarkdown = async (blockId: string): Promise<string> => {
  const url = `https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch Notion blocks', await response.text());
    return '';
  }

  const data = await response.json();
  const blocks = data.results || [];
  let markdown = '';

  for (const block of blocks) {
    const type = block.type;
    const content = block[type];
    
    switch (type) {
      case 'paragraph':
        markdown += `${parseRichText(content.rich_text)}\n\n`;
        break;
      case 'heading_1':
        markdown += `# ${parseRichText(content.rich_text)}\n\n`;
        break;
      case 'heading_2':
        markdown += `## ${parseRichText(content.rich_text)}\n\n`;
        break;
      case 'heading_3':
        markdown += `### ${parseRichText(content.rich_text)}\n\n`;
        break;
      case 'bulleted_list_item':
        markdown += `- ${parseRichText(content.rich_text)}\n`;
        break;
      case 'numbered_list_item':
        markdown += `1. ${parseRichText(content.rich_text)}\n`;
        break;
      case 'to_do':
        markdown += `- [${content.checked ? 'x' : ' '}] ${parseRichText(content.rich_text)}\n`;
        break;
      case 'toggle':
        markdown += `<details><summary>${parseRichText(content.rich_text)}</summary>\n\n</details>\n\n`;
        break;
      case 'quote':
        markdown += `> ${parseRichText(content.rich_text)}\n\n`;
        break;
      case 'code':
        markdown += `\`\`\`${content.language || ''}\n${parseRichText(content.rich_text)}\n\`\`\`\n\n`;
        break;
      case 'divider':
        markdown += `---\n\n`;
        break;
      case 'image':
        const imgUrl = content.type === 'external' ? content.external.url : content.file.url;
        const caption = parseRichText(content.caption) || '';
        markdown += `![${caption}](${imgUrl})\n\n`;
        break;
      case 'callout':
        const icon = content.icon?.emoji || '💡';
        markdown += `> ${icon} ${parseRichText(content.rich_text)}\n\n`;
        break;
      case 'bookmark':
        markdown += `[${content.url}](${content.url})\n\n`;
        break;
      default:
        break;
    }
  }

  return markdown;
};

export const getSinglePost = async (slug: string) => {
  const posts = await getPublishedPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  const markdown = await fetchNotionBlocksAsMarkdown(post.id);
  
  return {
    post,
    markdown,
  };
};
