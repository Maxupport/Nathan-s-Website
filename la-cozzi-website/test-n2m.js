require('dotenv').config({path: '.env.local'});
const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const databaseId = process.env.NOTION_DATABASE_ID;

async function test() {
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: { property: '發布狀態', select: { equals: 'Published' } },
      page_size: 1
    })
  }).then(r => r.json());

  if (!response.results || response.results.length === 0) {
    console.log("NO POSTS FOUND"); return;
  }
  const postId = response.results[0].id;
  console.log("Post ID:", postId);
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const n2m = new NotionToMarkdown({ notionClient: notion });
  console.log("Fetching blocks...");
  const mdBlocks = await n2m.pageToMarkdown(postId);
  console.log("Blocks count:", mdBlocks.length);
  const markdown = n2m.toMarkdownString(mdBlocks);
  console.log("String return type:", typeof markdown);
  console.log("String parent:", markdown.parent ? markdown.parent.substring(0, 100) : "UNDEFINED");
  console.log("Raw object:", markdown);
}
test().catch(console.error);
