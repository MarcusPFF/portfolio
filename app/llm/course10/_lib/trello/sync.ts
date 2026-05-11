import { getSupabase } from '../supabase';
import { fetchBoardListsWithCards } from './client';
import {
  filterOpgaveCards,
  parseCardAsOpgave,
  parseListAsWedding,
} from './mapping';

export type SyncCounts = {
  weddings_created: number;
  weddings_updated: number;
  tasks_created: number;
  tasks_updated: number;
};

export type SyncResult = SyncCounts & {
  duration_ms: number;
  warnings: string[];
};

/**
 * Idempotent sync fra Trello-board til Supabase.
 *
 * - Læser alle åbne lister + deres åbne kort fra Trello-API'et
 * - For hver liste: upsert bryllup på trello_list_id
 * - For hvert opgave-kort: upsert opgave på trello_card_id med korrekt bryllup_id
 * - Additiv: kort/lister slettet i Trello forbliver i Supabase
 *
 * Smider exception hvis Trello-API eller Supabase fejler. Caller (Server Action)
 * fanger og skriver resultat til sync_log.
 */
export async function syncFromTrello(): Promise<SyncResult> {
  const startedAt = Date.now();
  const supabase = getSupabase();
  const warnings: string[] = [];
  const counts: SyncCounts = {
    weddings_created: 0,
    weddings_updated: 0,
    tasks_created: 0,
    tasks_updated: 0,
  };

  const lists = await fetchBoardListsWithCards();

  for (const list of lists) {
    if (list.closed) continue;
    const parseResult = parseListAsWedding(list);
    warnings.push(...parseResult.warnings);
    if (!parseResult.wedding) continue;

    // Find eksisterende bryllup via trello_list_id
    const { data: existing } = await supabase
      .from('bryllupper')
      .select('id, trello_list_id')
      .eq('trello_list_id', parseResult.wedding.trello_list_id)
      .maybeSingle();

    let bryllup_id: string;

    if (existing) {
      const { error: updateError } = await supabase
        .from('bryllupper')
        .update(parseResult.wedding)
        .eq('id', existing.id);
      if (updateError) {
        warnings.push(
          `Liste "${list.name}" — opdatering fejlede: ${updateError.message}`,
        );
        continue;
      }
      bryllup_id = existing.id;
      counts.weddings_updated += 1;
    } else {
      // bryllupsdato er NOT NULL i skemaet, så vi skipper hvis vi ikke kan udlede den
      if (!parseResult.wedding.bryllupsdato) {
        warnings.push(
          `Liste "${list.name}" skippet — mangler "📋 Bryllup detaljer"-kort med gyldig Bryllupsdato (YYYY-MM-DD).`,
        );
        continue;
      }
      const { data: inserted, error: insertError } = await supabase
        .from('bryllupper')
        .insert({
          ...parseResult.wedding,
          // TypeScript-tricket: vi har lige checked at den ikke er null
          bryllupsdato: parseResult.wedding.bryllupsdato,
        })
        .select('id')
        .single();
      if (insertError || !inserted) {
        warnings.push(
          `Liste "${list.name}" — opret fejlede: ${insertError?.message ?? 'ukendt'}`,
        );
        continue;
      }
      bryllup_id = inserted.id;
      counts.weddings_created += 1;
    }

    // Opgaver under den her liste
    const opgaveCards = filterOpgaveCards(list, parseResult.metadataCardId);
    for (let i = 0; i < opgaveCards.length; i++) {
      const opgavePayload = parseCardAsOpgave(opgaveCards[i], bryllup_id, i + 1);

      const { data: existingOpgave } = await supabase
        .from('opgaver')
        .select('id')
        .eq('trello_card_id', opgavePayload.trello_card_id)
        .maybeSingle();

      if (existingOpgave) {
        const { error: updateError } = await supabase
          .from('opgaver')
          .update(opgavePayload)
          .eq('id', existingOpgave.id);
        if (updateError) {
          warnings.push(
            `Kort "${opgaveCards[i].name}" — opdatering fejlede: ${updateError.message}`,
          );
          continue;
        }
        counts.tasks_updated += 1;
      } else {
        const { error: insertError } = await supabase
          .from('opgaver')
          .insert({ ...opgavePayload, ai_genereret: false });
        if (insertError) {
          warnings.push(
            `Kort "${opgaveCards[i].name}" — opret fejlede: ${insertError.message}`,
          );
          continue;
        }
        counts.tasks_created += 1;
      }
    }
  }

  return {
    ...counts,
    duration_ms: Date.now() - startedAt,
    warnings,
  };
}
