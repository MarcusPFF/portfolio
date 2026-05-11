import { getSupabase } from '../supabase';
import type { Bryllup, Opgave } from '../types';
import {
  createCard,
  createList,
  fetchBoardListsWithCards,
  updateCard,
  updateList,
  type TrelloCard,
  type TrelloListWithCards,
} from './client';

const METADATA_TITLE_RE = /^[📋\s]*(bryllup\s*detaljer|metadata|detaljer)\b/i;
const METADATA_TITLE = '📋 Bryllup detaljer';

export type UploadResult = {
  weddings_created: number;
  weddings_updated: number;
  tasks_created: number;
  tasks_updated: number;
  duration_ms: number;
  warnings: string[];
};

function formatMetadataDesc(b: Bryllup): string {
  const lines: string[] = [];
  lines.push(`Bryllupsdato: ${b.bryllupsdato}`);
  if (b.antal_kuverter != null)
    lines.push(`Antal kuverter: ${b.antal_kuverter}`);
  if (b.pakke) lines.push(`Pakke: ${b.pakke}`);
  if (b.lokation) lines.push(`Lokation: ${b.lokation}`);
  if (b.vielsestype) lines.push(`Vielsestype: ${b.vielsestype}`);
  if (b.koordinator) lines.push(`Koordinator: ${b.koordinator}`);
  lines.push(`Status: ${b.status}`);
  if (b.kontakt_email) lines.push(`Email: ${b.kontakt_email}`);
  if (b.kontakt_tlf) lines.push(`Tlf: ${b.kontakt_tlf}`);
  if (b.noter) lines.push(`Noter: ${b.noter}`);
  return lines.join('\n');
}

export async function uploadToTrello(): Promise<UploadResult> {
  const startedAt = Date.now();
  const supabase = getSupabase();
  const warnings: string[] = [];
  const counts = {
    weddings_created: 0,
    weddings_updated: 0,
    tasks_created: 0,
    tasks_updated: 0,
  };

  // Hent alle bryllupper og deres opgaver
  const { data: bryllupperData, error: bryllupperError } = await supabase
    .from('bryllupper')
    .select('*')
    .order('bryllupsdato', { ascending: true });
  if (bryllupperError) {
    throw new Error(`Kunne ikke hente bryllupper: ${bryllupperError.message}`);
  }
  const bryllupper = (bryllupperData ?? []) as Bryllup[];

  // Pre-fetch board state én gang — så slipper vi for at slå op gang på gang
  const existingLists = await fetchBoardListsWithCards();
  const listById = new Map<string, TrelloListWithCards>(
    existingLists.map((l) => [l.id, l]),
  );

  for (const bryllup of bryllupper) {
    try {
      let listId = bryllup.trello_list_id;
      let existingList = listId ? listById.get(listId) : undefined;

      if (existingList) {
        if (existingList.name !== bryllup.brudepar) {
          await updateList(existingList.id, { name: bryllup.brudepar });
        }
        counts.weddings_updated += 1;
      } else {
        const newList = await createList({
          name: bryllup.brudepar,
          pos: 'bottom',
        });
        listId = newList.id;
        existingList = { ...newList, cards: [] };
        const { error: idUpdateError } = await supabase
          .from('bryllupper')
          .update({ trello_list_id: listId })
          .eq('id', bryllup.id);
        if (idUpdateError) {
          warnings.push(
            `Bryllup "${bryllup.brudepar}": kunne ikke gemme trello_list_id: ${idUpdateError.message}`,
          );
        }
        counts.weddings_created += 1;
      }

      // Sync metadata-kort
      const desc = formatMetadataDesc(bryllup);
      const existingMetaCard = existingList.cards.find((c) =>
        METADATA_TITLE_RE.test(c.name),
      );
      if (existingMetaCard) {
        if (existingMetaCard.desc !== desc) {
          await updateCard(existingMetaCard.id, { desc });
        }
      } else {
        await createCard({
          idList: existingList.id,
          name: METADATA_TITLE,
          desc,
          pos: 'top',
        });
      }

      // Sync opgaver
      const { data: opgaverData } = await supabase
        .from('opgaver')
        .select('*')
        .eq('bryllup_id', bryllup.id)
        .order('raekkefoelge', { ascending: true });
      const opgaver = (opgaverData ?? []) as Opgave[];

      for (let i = 0; i < opgaver.length; i++) {
        const opgave = opgaver[i];
        // Trello pos: 1000+ for at lade metadata-kortet stå øverst
        const pos = 1000 + (opgave.raekkefoelge || i + 1) * 1000;
        const due = opgave.deadline
          ? new Date(opgave.deadline + 'T12:00:00Z').toISOString()
          : null;
        const dueComplete = opgave.status === 'done';
        const cardDesc = opgave.beskrivelse ?? '';

        let existingCard: TrelloCard | undefined;
        if (opgave.trello_card_id) {
          existingCard = existingList.cards.find(
            (c) => c.id === opgave.trello_card_id,
          );
        }

        if (existingCard) {
          await updateCard(existingCard.id, {
            name: opgave.titel,
            desc: cardDesc,
            due,
            dueComplete,
            pos,
          });
          counts.tasks_updated += 1;
        } else {
          const newCard = await createCard({
            idList: existingList.id,
            name: opgave.titel,
            desc: cardDesc,
            due,
            dueComplete,
            pos,
          });
          const { error: idUpdateError } = await supabase
            .from('opgaver')
            .update({ trello_card_id: newCard.id })
            .eq('id', opgave.id);
          if (idUpdateError) {
            warnings.push(
              `Opgave "${opgave.titel}": kunne ikke gemme trello_card_id: ${idUpdateError.message}`,
            );
          }
          counts.tasks_created += 1;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ukendt';
      warnings.push(`Bryllup "${bryllup.brudepar}" — fejlede: ${message}`);
    }
  }

  return {
    ...counts,
    duration_ms: Date.now() - startedAt,
    warnings,
  };
}
