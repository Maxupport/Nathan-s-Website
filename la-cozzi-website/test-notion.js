const { env } = require('process');
require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log("NOTION_TOKEN exists:", !!process.env.NOTION_TOKEN);
  console.log("NOTION_DATABASE_ID exists:", !!process.env.NOTION_DATABASE_ID);
  
  const databaseId = process.env.NOTION_DATABASE_ID;
  const token = process.env.NOTION_TOKEN;
  
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: {
        property: '發布狀態',
        select: { equals: 'Published' }
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("API ERROR:", response.status, text);
    process.exit(1);
  }

  const data = await response.json();
  console.log("SUCCESS! Got", data.results.length, "posts.");
}

test();
