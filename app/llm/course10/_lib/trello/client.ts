/**
 * Trello REST API klient. Thin fetch-wrapper.
 *
 * Auth: key + token som query-params (Trello's standard). Server-side only.
 * Trello-konventionerne er enkle nok til at en SDK er overkill.
 */

const TRELLO_BASE = 'https://api.trello.com/1';

export type TrelloList = {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
};

export type TrelloCard = {
  id: string;
  name: string;
  desc: string;
  due: string | null;
  dueComplete: boolean;
  closed: boolean;
  idList: string;
  idBoard: string;
  pos: number;
};

export type TrelloListWithCards = TrelloList & {
  cards: TrelloCard[];
};

export class TrelloClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'TrelloClientError';
    this.status = status;
  }
}

function requireEnv(): { apiKey: string; token: string; boardId: string } {
  const apiKey = process.env.ENGESTOFTE_TRELLO_API_KEY;
  const token = process.env.ENGESTOFTE_TRELLO_TOKEN;
  const boardId = process.env.ENGESTOFTE_TRELLO_BOARD_ID;
  if (!apiKey || !token || !boardId) {
    throw new Error(
      'Trello-konfiguration mangler. Tilføj ENGESTOFTE_TRELLO_API_KEY, ENGESTOFTE_TRELLO_TOKEN og ENGESTOFTE_TRELLO_BOARD_ID til .env.local.',
    );
  }
  return { apiKey, token, boardId };
}

async function trelloFetch<T>(
  path: string,
  init: RequestInit,
  apiKey: string,
  token: string,
): Promise<T> {
  const url = new URL(TRELLO_BASE + path);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('token', token);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json', ...(init.headers ?? {}) },
    cache: 'no-store',
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new TrelloClientError(
      `Trello API ${res.status} ${res.statusText}${body ? ' — ' + body.slice(0, 200) : ''}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

/**
 * Trello-API accepterer short links (8-char) for read-operationer, men kræver
 * det fulde 24-char hex board-ID for write-operationer som "create list".
 * Vi cacher det første kald i processens levetid; board-ID'er er stabile.
 */
let cachedFullBoardId: string | null = null;

export async function resolveFullBoardId(): Promise<string> {
  if (cachedFullBoardId) return cachedFullBoardId;
  const { apiKey, token, boardId } = requireEnv();
  if (/^[0-9a-f]{24}$/i.test(boardId)) {
    cachedFullBoardId = boardId;
    return boardId;
  }
  const board = await trelloFetch<{ id: string }>(
    `/boards/${encodeURIComponent(boardId)}?fields=id`,
    { method: 'GET' },
    apiKey,
    token,
  );
  cachedFullBoardId = board.id;
  return board.id;
}

export async function fetchBoardListsWithCards(): Promise<TrelloListWithCards[]> {
  const { apiKey, token, boardId } = requireEnv();
  // Trello-API: hent alle åbne lister + deres åbne kort i ét kald
  return trelloFetch<TrelloListWithCards[]>(
    `/boards/${encodeURIComponent(boardId)}/lists?cards=open&card_fields=id,name,desc,due,dueComplete,closed,idList,idBoard,pos&filter=open&fields=id,name,closed,idBoard,pos`,
    { method: 'GET' },
    apiKey,
    token,
  );
}

export type CreateListInput = {
  name: string;
  pos?: number | 'top' | 'bottom';
};

export async function createList(input: CreateListInput): Promise<TrelloList> {
  const { apiKey, token } = requireEnv();
  const fullBoardId = await resolveFullBoardId();
  const body = new URLSearchParams();
  body.set('name', input.name);
  body.set('idBoard', fullBoardId);
  if (input.pos !== undefined) body.set('pos', String(input.pos));
  return trelloFetch<TrelloList>(
    `/lists`,
    {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    apiKey,
    token,
  );
}

export type UpdateListInput = {
  name?: string;
  pos?: number | 'top' | 'bottom';
  closed?: boolean;
};

export async function updateList(
  listId: string,
  input: UpdateListInput,
): Promise<TrelloList> {
  const { apiKey, token } = requireEnv();
  const body = new URLSearchParams();
  if (input.name !== undefined) body.set('name', input.name);
  if (input.pos !== undefined) body.set('pos', String(input.pos));
  if (input.closed !== undefined) body.set('closed', String(input.closed));
  return trelloFetch<TrelloList>(
    `/lists/${encodeURIComponent(listId)}`,
    {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    apiKey,
    token,
  );
}

export type CreateCardInput = {
  idList: string;
  name: string;
  desc?: string;
  due?: string | null;
  dueComplete?: boolean;
  pos?: number | 'top' | 'bottom';
};

export async function createCard(input: CreateCardInput): Promise<TrelloCard> {
  const { apiKey, token } = requireEnv();
  const body = new URLSearchParams();
  body.set('idList', input.idList);
  body.set('name', input.name);
  if (input.desc !== undefined) body.set('desc', input.desc);
  if (input.due !== undefined && input.due !== null) body.set('due', input.due);
  if (input.dueComplete !== undefined)
    body.set('dueComplete', String(input.dueComplete));
  if (input.pos !== undefined) body.set('pos', String(input.pos));
  return trelloFetch<TrelloCard>(
    `/cards`,
    {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    apiKey,
    token,
  );
}

export type UpdateCardInput = {
  name?: string;
  desc?: string;
  due?: string | null;
  dueComplete?: boolean;
  pos?: number | 'top' | 'bottom';
};

export async function updateCard(
  cardId: string,
  input: UpdateCardInput,
): Promise<TrelloCard> {
  const { apiKey, token } = requireEnv();
  const body = new URLSearchParams();
  if (input.name !== undefined) body.set('name', input.name);
  if (input.desc !== undefined) body.set('desc', input.desc);
  if (input.due !== undefined)
    body.set('due', input.due === null ? '' : input.due);
  if (input.dueComplete !== undefined)
    body.set('dueComplete', String(input.dueComplete));
  if (input.pos !== undefined) body.set('pos', String(input.pos));
  return trelloFetch<TrelloCard>(
    `/cards/${encodeURIComponent(cardId)}`,
    {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    apiKey,
    token,
  );
}
