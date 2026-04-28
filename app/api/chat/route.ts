import { createGroq } from '@ai-sdk/groq';
import { streamText, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { personalDetails } from '@/lib/data';
import { isRateLimited } from '@/lib/rate-limit';

const MAX_MESSAGE_LENGTH = 500; // max chars per message
const MAX_MESSAGES = 20; // max conversation length

// --- Groq client ---
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// --- Supabase & Google setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const google = googleKey ? createGoogleGenerativeAI({ apiKey: googleKey }) : null;

// --- Knowledge base (Fallback) ---
const marcusContextFallback = "Marcus is a developer from Copenhagen, Denmark. His database is currently unavailable.";

export async function POST(req: Request) {
  // Get client IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  // Rate limit check
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a minute.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse and validate input
  let messages;
  try {
    const body = await req.json();
    messages = body.messages;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Messages array is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Cap conversation length
  if (messages.length > MAX_MESSAGES) {
    messages = messages.slice(-MAX_MESSAGES);
  }

  // Validate last message length
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.content && lastMessage.content.length > MAX_MESSAGE_LENGTH) {
    return new Response(
      JSON.stringify({ error: 'Message too long. Keep it under 500 characters.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let retrievedContext = '';

    // 1. Perform RAG Retrieval if services are configured
    if (supabase && google && lastMessage?.content) {
      try {
        console.log('[Chat API] Generating embedding for user query...');
        const { embedding } = await embed({
          model: google.textEmbeddingModel('gemini-embedding-001'),
          value: lastMessage.content
        });

        console.log('[Chat API] Querying Supabase for matches...');
        const { data, error } = await supabase.rpc('match_document_chunks', {
          query_embedding: embedding,
          match_threshold: 0.2,
          match_count: 15, // Broad retrieval — trips, projects, courses and skills all live here now
        });

        if (error) {
          console.error('[Chat API] Supabase RPC error:', error);
        } else if (data && data.length > 0) {
          const chunks = data as Array<{ content: string }>;
          retrievedContext = chunks.map((c) => c.content).join('\n\n');
          console.log(`[Chat API] RAG retrieved ${data.length} relevant chunks`);
        }
      } catch (e) {
        console.error('[Chat API] Embedding/Retrieval error:', e);
      }
    }

    // 2. Fallback to full document if retrieval failed or missed
    if (!retrievedContext) {
      console.log('[Chat API] RAG unavailable or yielded no results. Using fallback context.');
      retrievedContext = marcusContextFallback;
    }

    const currentDate = new Date().toLocaleString('da-DK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Copenhagen'
    });

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are a friendly, concise AI assistant on Marcus Forsberg's portfolio website.
Technically you are a RAG (Retrieval-Augmented Generation) chatbot: the "Relevant information" below is fetched live from a Supabase vector database populated with content about Marcus — his background, skills, projects, LLM course, and motorcycle trips. If asked, proudly confirm that you use a vector database and RAG architecture.

Current date and time in Denmark: ${currentDate}.

Core profile (always authoritative): Marcus Forsberg. Roles: ${personalDetails.roles.join(
        ', ',
      )}. Status: ${personalDetails.status}.

Answer questions about Marcus based on the "Relevant information" below. Rules:
- If birth year/month is mentioned, calculate his current age using today's date (${currentDate}). If the exact day is missing, say "omkring X år" or just "X år".
- Be specific about technologies he uses when they appear in the retrieved information.
- For questions about motorcycle trips, cite the trip name, year, distance and bike when available.
- If the answer isn't in the context, say you don't know rather than guessing.
- Keep answers short (2-3 sentences). Warm, professional tone.

Relevant information (from the vector database):
${retrievedContext}`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error('[Chat API] Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';

    if (errMsg.includes('quota') || errMsg.includes('429')) {
      return new Response(
        JSON.stringify({ error: 'Rate limit hit. Please wait a minute and try again.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'AI service temporarily unavailable. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
