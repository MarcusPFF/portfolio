import { createGroq } from '@ai-sdk/groq';
import { streamText, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { personalDetails, skillGroups, projects, classes } from '@/lib/data';
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
          match_threshold: 0.2, // Lowered threshold for broader matching
          match_count: 10 // Get top 10 relevant chunks to ensure we don't miss key info
        });

        if (error) {
          console.error('[Chat API] Supabase RPC error:', error);
        } else if (data && data.length > 0) {
          retrievedContext = data.map((chunk: any) => chunk.content).join('\n\n');
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
You are technically functioning as a sophisticated RAG (Retrieval-Augmented Generation) Chatbot connected to a Supabase Vector Database. The "Relevant information" injected below is dynamically fetched from this vector database in real-time. If asked, proudly confirm that you use a vector database and RAG architecture!
Current date and time in Denmark: ${currentDate}.

Here is the most up-to-date information directly from the website's source code:
Personal Details: ${JSON.stringify(personalDetails)}
Skills: ${JSON.stringify(skillGroups)}
Projects: ${JSON.stringify(projects)}
Course Timeline: ${JSON.stringify(classes)}

You answer questions about Marcus based ONLY on the above website data and the "Relevant information" below. 
IMPORTANT: Always check the "Relevant information" below for additional details on Marcus' background, technologies, and birth date. 
- If birth year/month is mentioned, you MUST calculate his current age using today's date (${currentDate}). 
- If the exact day is missing, say he is "omkring X år" or just "X år".
- Be specific about the technologies he uses (Java, Spring Boot, etc.) if they are listed below.

If the information is not in the context, say you don't know.
Keep answers short (2-3 sentences).
Use a warm, professional tone.

Relevant information about Marcus (from knowledge base):
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
