import { createClient } from '@supabase/supabase-js';
import { embedMany } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// 1. Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Service Role Key is missing in .env.local');
}
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Initialize Google Generative AI
const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!googleKey) {
  throw new Error('Google Generative AI Key is missing in .env.local');
}
const google = createGoogleGenerativeAI({
  apiKey: googleKey,
});

async function main() {
  console.log('Reading marcus.md...');
  const filePath = path.join(process.cwd(), 'marcus.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  let chunks: string[] = [];
  let metadataList: any[] = [];

  // 3. Chunk the document. Detect JSON or Markdown
  try {
    const jsonData = JSON.parse(fileContent);
    if (Array.isArray(jsonData)) {
      console.log('Detected JSON format. Parsing items...');
      jsonData.forEach((item: any) => {
        if (item.text) {
          chunks.push(item.text);
          metadataList.push({
            id: item.id || 'unknown',
            source: 'marcus.md',
            ...(item.metadata || {})
          });
        }
      });
    } else {
      throw new Error('JSON is not an array');
    }
  } catch (e) {
    console.log('Detected Markdown format (or invalid JSON). Splitting by headings...');
    // Fallback to original Markdown splitting
    const rawChunks = fileContent.split(/\n(?=#{2,3}\s)/);
    chunks = rawChunks
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0);
    
    chunks.forEach((chunk) => {
       const firstLine = chunk.split('\n')[0];
       metadataList.push({ source: 'marcus.md', heading: firstLine });
    });
  }

  console.log(`Found ${chunks.length} chunks. Generating embeddings...`);

  // 4. Generate Embeddings using Google's gemini-embedding-001
  const { embeddings } = await embedMany({
    model: google.textEmbeddingModel('gemini-embedding-001'),
    values: chunks,
  });

  console.log('Embeddings generated successfully. Clearing old chunks from Supabase...');

  // 4.5. Clear existing records so we don't have duplicates
  const { error: deleteError } = await supabase
    .from('document_chunks')
    .delete()
    .neq('id', 0); // Deletes all rows

  if (deleteError) {
    console.error('Error deleting old chunks:', deleteError);
    return;
  }

  console.log('Old chunks cleared. Inserting new chunks into Supabase...');

  // 5. Insert into Supabase
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    const metadata = metadataList[i];

    const { error } = await supabase.from('document_chunks').insert({
      content: chunk,
      metadata: metadata,
      embedding: embedding,
    });

    if (error) {
      console.error(`Error inserting chunk ${i + 1}:`, error);
    } else {
      console.log(`Successfully inserted chunk ${i + 1}/${chunks.length}`);
    }
  }

  console.log('✅ Finished embedding and inserting all chunks!');
}

main().catch(console.error);
