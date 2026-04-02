import { getPartners } from './src/lib/notion';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const p = await getPartners();
  console.log(JSON.stringify(p, null, 2));
}
run();
