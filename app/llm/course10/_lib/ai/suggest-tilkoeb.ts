import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import type { Bryllup, Tilkoeb, TilkoebType } from '../types';
import {
  EG_TILKOEB_SYSTEM_PROMPT,
  buildTilkoebUserPrompt,
} from './tilkoeb-prompt';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const TILKOEB_TYPES: TilkoebType[] = [
  'bryllupskage',
  'sejlads_anemonen',
  'fotografering',
  'brudebuket',
  'blomsterdekorationer',
  'musik',
  'shuttlebus',
  'fyrvaerkeri',
  'andet',
];

export type SuggestedTilkoeb = {
  type: TilkoebType;
  beskrivelse: string;
  pris: number;
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

function isTilkoebType(v: unknown): v is TilkoebType {
  return typeof v === 'string' && (TILKOEB_TYPES as string[]).includes(v);
}

function parseSuggestions(
  raw: string,
  alreadySelected: Set<TilkoebType>,
): SuggestedTilkoeb[] {
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
    !('tilkoeb' in parsed) ||
    !Array.isArray((parsed as { tilkoeb: unknown }).tilkoeb)
  ) {
    throw new Error('Modellen returnerede ikke en "tilkoeb"-liste.');
  }
  const rawList = (parsed as { tilkoeb: unknown[] }).tilkoeb;
  const valid: SuggestedTilkoeb[] = [];
  const seen = new Set<TilkoebType>();
  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const type = isTilkoebType(o.type) ? o.type : null;
    if (!type) continue;
    if (alreadySelected.has(type)) continue;
    if (seen.has(type) && type !== 'andet') continue; // tillad kun én af hver standardtype
    const beskrivelse =
      typeof o.beskrivelse === 'string' ? o.beskrivelse.trim() : '';
    if (!beskrivelse) continue;
    const prisRaw =
      typeof o.pris === 'number'
        ? o.pris
        : typeof o.pris === 'string'
          ? Number(o.pris)
          : NaN;
    if (!Number.isFinite(prisRaw) || prisRaw < 0 || prisRaw > 500_000) continue;
    const pris = Math.round(prisRaw);
    const begrundelse =
      typeof o.begrundelse === 'string' ? o.begrundelse.trim() : '';
    valid.push({
      type,
      beskrivelse: beskrivelse.slice(0, 200),
      pris,
      begrundelse: begrundelse.slice(0, 300),
    });
    seen.add(type);
  }
  if (valid.length === 0) {
    throw new Error('Modellen returnerede ingen brugbare tilkøbsforslag.');
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
    system: EG_TILKOEB_SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature,
  });
  return result.text;
}

export async function suggestTilkoeb(
  bryllup: Bryllup,
  eksisterendeTilkoeb: Tilkoeb[],
): Promise<SuggestedTilkoeb[]> {
  const apiKey = process.env.ENGESTOFTE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ENGESTOFTE_GROQ_API_KEY mangler i .env.local. AI-forslag er ikke konfigureret.',
    );
  }

  const already = new Set<TilkoebType>(
    eksisterendeTilkoeb.map((t) => t.type),
  );
  const userPrompt = buildTilkoebUserPrompt(bryllup, eksisterendeTilkoeb);

  try {
    const raw = await callGroq(apiKey, userPrompt, 0.5);
    return parseSuggestions(raw, already);
  } catch (firstErr) {
    const retryPrompt = `${userPrompt}\n\nRemember: respond with valid JSON only, starting with { and ending with }. No prose, no markdown fences.`;
    try {
      const raw = await callGroq(apiKey, retryPrompt, 0.3);
      return parseSuggestions(raw, already);
    } catch (secondErr) {
      const firstMessage =
        firstErr instanceof Error ? firstErr.message : 'ukendt';
      const secondMessage =
        secondErr instanceof Error ? secondErr.message : 'ukendt';
      throw new Error(
        `Modellen kunne ikke producere gyldige tilkøbsforslag. Første forsøg: ${firstMessage}. Retry: ${secondMessage}`,
      );
    }
  }
}
