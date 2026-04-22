import { createClient } from '@supabase/supabase-js';
import { embedMany } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { trips, pick, type Trip } from '../lib/trips';
import { personalDetails, skillGroups, projects, classes } from '../lib/data';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Service Role Key is missing in .env.local');
}
const supabase = createClient(supabaseUrl, supabaseKey);

const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!googleKey) {
  throw new Error('Google Generative AI Key is missing in .env.local');
}
const google = createGoogleGenerativeAI({ apiKey: googleKey });

type Metadata = Record<string, unknown>;
type MarcusMdItem = { id?: string; text?: string; metadata?: Metadata };

type Chunk = { content: string; metadata: Metadata };

function loadMarcusMd(): Chunk[] {
  const filePath = path.join(process.cwd(), 'marcus.md');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const out: Chunk[] = [];
  try {
    const data = JSON.parse(raw) as MarcusMdItem[];
    if (!Array.isArray(data)) throw new Error('not an array');
    console.log(`marcus.md: JSON format, ${data.length} entries`);
    for (const item of data) {
      if (!item.text) continue;
      out.push({
        content: item.text,
        metadata: {
          id: item.id ?? 'unknown',
          source: 'marcus.md',
          ...(item.metadata ?? {}),
        },
      });
    }
  } catch {
    console.log('marcus.md: markdown fallback, splitting by headings');
    const rawChunks = raw.split(/\n(?=#{2,3}\s)/);
    for (const c of rawChunks) {
      const text = c.trim();
      if (!text) continue;
      const firstLine = text.split('\n')[0];
      out.push({
        content: text,
        metadata: { source: 'marcus.md', heading: firstLine },
      });
    }
  }
  return out;
}

function tripToChunks(trip: Trip): Chunk[] {
  // Use Danish fields — the embedding model (gemini-embedding-001) is
  // multilingual, so Danish content still matches English queries.
  const lang = 'dk' as const;
  const title = pick(trip.title, lang);
  const waypoints = trip.waypoints.map((w) => w.name).join(' → ');
  const highlights = pick(trip.highlights, lang).join(' · ');
  const story = pick(trip.story, lang).join(' ');

  const header = `Motorcykel-tur: ${title}. Periode: ${trip.dateSort}. Varighed: ${pick(
    trip.duration,
    lang,
  )}. Distance: ca. ${trip.distanceKm.toLocaleString('da-DK')} km. Område: ${pick(trip.location, lang)}.${
    trip.bike ? ` Cykel: ${trip.bike}.` : ''
  }`;
  const body = `${pick(trip.subtitle, lang)}. ${pick(trip.summary, lang)}`;
  const routeLine = `Rute: ${waypoints}.`;
  const highlightsLine = `Højdepunkter: ${highlights}.`;

  // One primary chunk with the summary + metadata, and a second chunk with
  // the longer story so both shorter "what is the trip" queries and deeper
  // "tell me about the ride" queries can retrieve relevant context.
  const meta = {
    source: 'trips.ts',
    category: 'motorcycle_trip',
    slug: trip.slug,
    dateSort: trip.dateSort,
    distanceKm: trip.distanceKm,
    bike: trip.bike ?? null,
  };

  return [
    {
      content: [header, body, routeLine, highlightsLine].join(' '),
      metadata: { ...meta, part: 'summary' },
    },
    {
      content: `${title} (${trip.dateSort}): ${story}`,
      metadata: { ...meta, part: 'story' },
    },
  ];
}

function projectsChunks(): Chunk[] {
  return projects
    .filter((p) => !p.hidden)
    .map((p) => ({
      content: `Projekt: ${p.title} — ${p.subtitle}. ${p.desc} Teknologier: ${p.tags.join(', ')}. Kildekode: ${p.link}.`,
      metadata: {
        source: 'data.ts',
        category: 'project',
        title: p.title,
        tags: p.tags,
      },
    }));
}

function classesChunks(): Chunk[] {
  return classes
    .filter((c) => !c.hidden)
    .map((c) => ({
      content: `LLM-kursus: ${c.title} — ${c.subtitle}. ${c.desc} Emner: ${c.tags.join(', ')}.`,
      metadata: {
        source: 'data.ts',
        category: 'course',
        title: c.title,
      },
    }));
}

function skillsChunks(): Chunk[] {
  return skillGroups.map((g) => ({
    content: `Færdigheder — ${g.category}: ${g.items.join(', ')}.`,
    metadata: {
      source: 'data.ts',
      category: 'skill_group',
      group: g.category,
    },
  }));
}

function personalChunks(): Chunk[] {
  return [
    {
      content: `Marcus Forsberg. Roller: ${personalDetails.roles.join(', ')}. Status: ${personalDetails.status}. Statistik: ${personalDetails.stats
        .map((s) => `${s.value} ${s.label}`)
        .join(', ')}.`,
      metadata: { source: 'data.ts', category: 'personal_details' },
    },
  ];
}

async function main() {
  const chunks: Chunk[] = [
    ...loadMarcusMd(),
    ...personalChunks(),
    ...skillsChunks(),
    ...projectsChunks(),
    ...classesChunks(),
    ...trips.flatMap(tripToChunks),
  ];

  console.log(`\nTotal chunks to embed: ${chunks.length}`);
  console.log(`  marcus.md:          ${loadMarcusMd().length}`);
  console.log(`  personal:           ${personalChunks().length}`);
  console.log(`  skill groups:       ${skillsChunks().length}`);
  console.log(`  projects:           ${projectsChunks().length}`);
  console.log(`  courses:            ${classesChunks().length}`);
  console.log(`  trips:              ${trips.flatMap(tripToChunks).length}`);

  console.log('\nGenerating embeddings...');
  const { embeddings } = await embedMany({
    model: google.textEmbeddingModel('gemini-embedding-001'),
    values: chunks.map((c) => c.content),
  });

  console.log('Clearing existing rows in document_chunks...');
  const { error: deleteError } = await supabase
    .from('document_chunks')
    .delete()
    .neq('id', 0);
  if (deleteError) {
    console.error('Error deleting old chunks:', deleteError);
    return;
  }

  console.log('Inserting new rows...');
  for (let i = 0; i < chunks.length; i++) {
    const { error } = await supabase.from('document_chunks').insert({
      content: chunks[i].content,
      metadata: chunks[i].metadata,
      embedding: embeddings[i],
    });
    if (error) {
      console.error(`  × chunk ${i + 1}:`, error.message);
    } else {
      console.log(`  ✓ chunk ${i + 1}/${chunks.length}`);
    }
  }

  console.log('\n✅ Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
