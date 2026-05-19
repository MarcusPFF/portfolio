import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import type { Bryllup, OpgaveKategori, Tilkoeb } from '../types';
import { EG_SYSTEM_PROMPT, buildUserPrompt } from './system-prompt';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const KATEGORI_VALUES: OpgaveKategori[] = [
  'mad',
  'transport',
  'musik',
  'blomster',
  'praest',
  'betaling',
  'koordinering',
  'overnatning',
  'andet',
];

export type SuggestedTask = {
  titel: string;
  kategori: OpgaveKategori;
  dage_foer_bryllup: number;
  begrundelse: string;
};

function stripCodeFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function extractJsonObject(s: string): string {
  const cleaned = stripCodeFences(s);
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return cleaned;
  return cleaned.slice(first, last + 1);
}

function isKategori(v: unknown): v is OpgaveKategori {
  return typeof v === 'string' && (KATEGORI_VALUES as string[]).includes(v);
}

function parseSuggestions(raw: string): SuggestedTask[] {
  const json = extractJsonObject(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    throw new Error(
      `Modellen returnerede ikke gyldig JSON. ${err instanceof Error ? err.message : ''}`,
    );
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('opgaver' in parsed) ||
    !Array.isArray((parsed as { opgaver: unknown }).opgaver)
  ) {
    throw new Error('Modellen returnerede ikke en "opgaver"-liste.');
  }
  const rawList = (parsed as { opgaver: unknown[] }).opgaver;
  const valid: SuggestedTask[] = [];
  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const titel = typeof o.titel === 'string' ? o.titel.trim() : '';
    const kategori = isKategori(o.kategori) ? o.kategori : null;
    const dageRaw =
      typeof o.dage_foer_bryllup === 'number'
        ? o.dage_foer_bryllup
        : typeof o.dage_foer_bryllup === 'string'
          ? Number(o.dage_foer_bryllup)
          : NaN;
    const dage =
      Number.isFinite(dageRaw) && Number.isInteger(dageRaw)
        ? Math.max(1, Math.min(730, dageRaw))
        : null;
    const begrundelse =
      typeof o.begrundelse === 'string' ? o.begrundelse.trim() : '';
    if (!titel || !kategori || dage === null) continue;
    valid.push({
      titel: titel.slice(0, 120),
      kategori,
      dage_foer_bryllup: dage,
      begrundelse: begrundelse.slice(0, 200),
    });
  }
  if (valid.length === 0) {
    throw new Error('Modellen returnerede ingen gyldige opgaver.');
  }
  return valid;
}

async function callGroq(
  apiKey: string,
  userPrompt: string,
  temperature: number,
): Promise<string> {
  const groq = createGroq({ apiKey });
  const result = await generateText({
    model: groq(GROQ_MODEL),
    system: EG_SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature,
  });
  return result.text;
}

export async function suggestTasks(
  bryllup: Bryllup,
  tilkoeb: Tilkoeb[],
): Promise<SuggestedTask[]> {
  const apiKey = process.env.ENGESTOFTE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ENGESTOFTE_GROQ_API_KEY mangler i .env.local. AI-forslag er ikke konfigureret.',
    );
  }

  const userPrompt = buildUserPrompt(bryllup, tilkoeb);

  try {
    const raw = await callGroq(apiKey, userPrompt, 0.4);
    return parseSuggestions(raw);
  } catch (firstErr) {
    // Et enkelt retry med højere temperatur og en eksplicit reminder om format.
    const retryPrompt = `${userPrompt}\n\nRemember: respond with valid JSON only, starting with { and ending with }. No prose, no markdown fences.`;
    try {
      const raw = await callGroq(apiKey, retryPrompt, 0.2);
      return parseSuggestions(raw);
    } catch (secondErr) {
      const firstMessage =
        firstErr instanceof Error ? firstErr.message : 'ukendt';
      const secondMessage =
        secondErr instanceof Error ? secondErr.message : 'ukendt';
      throw new Error(
        `Modellen kunne ikke producere gyldige forslag. Første forsøg: ${firstMessage}. Retry: ${secondMessage}`,
      );
    }
  }
}
