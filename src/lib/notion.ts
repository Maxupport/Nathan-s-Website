// Using native fetch to bypass Turbopack CJS Edge-runtime bundling bugs from the official Notion SDK
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
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

export const getPublishedPosts = async (withExcerpts = false): Promise<Post[]> => {
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

    let postsWithoutBody = result.results.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        title: getPropertyText(p['標題'] || p.Title || p.Name),
        excerpt: getPropertyText(p['文字'] || p['內文'] || p['簡介'] || p.Text || p.Excerpt || p.Description),
        slug: getPropertyText(p['短網址'] || p.Slug || p.URL),
        status: getPropertyText(p['發布狀態'] || p.Status),
        tags: getPropertyTags(p['#標籤'] || p.Tags || p['標籤']),
        cover: getPropertyCover(p['封面圖'] || p.Cover || p.Thumbnail),
        date: page.created_time,
      };
    }).filter((post: any) => post.title);
    
    if (withExcerpts) {
      for (const post of postsWithoutBody) {
        if (!post.excerpt) {
          try {
            const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${post.id}/children?page_size=10`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28',
              }
            }).then(r => r.json());
            
            if (blocksRes.results) {
              for (const b of blocksRes.results) {
                if (b.type === 'paragraph' && b.paragraph.rich_text?.length > 0) {
                  post.excerpt = b.paragraph.rich_text.map((rt: any) => rt.plain_text).join('');
                  break; // found the first paragraph
                }
              }
            }
          } catch(e) {
            // gracefully skip if error
          }
        }
      }
    }
    
    return postsWithoutBody;
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
    const errText = await response.text();
    console.error('Failed to fetch Notion blocks', errText);
    return `> ⚠️ **無法讀取文章內容** \n> 請確認此文章是否存在於您的 Notion 資料庫中。`;
  }

  const data = await response.json();
  const blocks = data.results || [];
  
  if (blocks.length === 0) {
    return `*目前作者正在撰寫這篇文章的正文，敬請期待！*`;
  }
  
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
        markdown += `> ℹ️ [不支援的 Notion 區塊類型: ${type}]\n\n`;
        break;
    }
  }

  return markdown;
};

export const getSinglePost = async (slug: string) => {
  const posts = await getPublishedPosts(false);
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  const markdown = await fetchNotionBlocksAsMarkdown(post.id);
  
  return {
    post,
    markdown,
  };
};
