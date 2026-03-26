const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');

const databaseId = "32fd111c6f0d80089914eb77653a123f";
const token = "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";

async function test() {
  console.log("Init...");
  const notion = new Client({ auth: token });
  const n2m = new NotionToMarkdown({ notionClient: notion });
  console.log("Fetching blocks...");
  
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({ page_size: 5 })
  }).then(r => r.json());

  if (!res.results || !res.results.length) return console.log("RAW RESPONSE:", JSON.stringify(res, null, 2));
  
  const postId = res.results[0].id;
  console.log("Post found:", postId);
  
  // Test n2m
  try {
    const mdBlocks = await n2m.pageToMarkdown(postId);
    const markdown = n2m.toMarkdownString(mdBlocks);
    console.log("TYPEOF:", typeof markdown);
    console.log("KEYS:", Object.keys(markdown));
    console.log("PARENT:", markdown.parent ? markdown.parent.substring(0, 50) : "EMPTY/UNDEFINED");
    console.log("IS IT A STRING NATIVELY?:", typeof markdown === 'string');
  } catch(e) {
    console.log("ERROR in N2M:", e.message);
  }
}
test();
