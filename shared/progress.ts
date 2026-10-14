// Progresso como log de eventos. Front e back usam a mesma agregação.
import { isBookId, type BookId } from './content.ts';

export const EVENT_TYPES = ['started', 'help', 'completed', 'skipped', 'demoSeen', 'welcomeSeen', 'placement', 'bookChosen'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface ProgressEvent {
  id: string;
  type: EventType;
  /** null em welcomeSeen, placement e bookChosen. */
  missionId: string | null;
  /** Identifica a tentativa (de started até completed) para saber se houve ajuda nela. */
  attemptId: string | null;
  /** Epoch em ms, no relógio do aparelho. */
  at: number;
  /** Acertos da prova (completed) ou apostila (placement, bookChosen). */
  data?: EventData;
}

export type EventData = { right: number; total: number } | { book: BookId };

export interface MissionProgress {
  plays: number;
  completed: boolean;
  completedWithHelp: boolean;
  skips: number;
  helpCount: number;
  demoSeen: boolean;
  /** Provas: resultado da última vez e quantas vezes foi feita até o fim. */
  lastScore: { right: number; total: number } | null;
  scored: number;
}

export interface Progress {
  welcomeSeen: boolean;
  missions: Record<string, MissionProgress>;
  /** Apostila atual (último bookChosen). */
  book: BookId | null;
  /** Sugestão do último teste de alinhamento. */
  placement: BookId | null;
}

export const emptyMission = (): MissionProgress => ({
  plays: 0,
  completed: false,
  completedWithHelp: false,
  skips: 0,
  helpCount: 0,
  demoSeen: false,
  lastScore: null,
  scored: 0,
});

export function aggregate(events: Iterable<ProgressEvent>): Progress {
  const byId = new Map<string, ProgressEvent>();
  for (const e of events) byId.set(e.id, e);

  const progress: Progress = { welcomeSeen: false, missions: {}, book: null, placement: null };
  const attemptsWithHelp = new Set<string>();
  for (const e of byId.values()) if (e.type === 'help' && e.attemptId) attemptsWithHelp.add(e.attemptId);
  // "Último" é pelo relógio do evento, não pela ordem de chegada.
  const sorted = [...byId.values()].sort((a, b) => a.at - b.at);
  const scoreAt: Record<string, number> = {};

  for (const e of sorted) {
    if (e.type === 'welcomeSeen') {
      progress.welcomeSeen = true;
      continue;
    }
    if (e.type === 'placement' || e.type === 'bookChosen') {
      if (e.data && 'book' in e.data) progress[e.type === 'placement' ? 'placement' : 'book'] = e.data.book;
      continue;
    }
    if (!e.missionId) continue;
    const m = (progress.missions[e.missionId] ??= emptyMission());
    switch (e.type) {
      case 'started': m.plays++; break;
      case 'help': m.helpCount++; break;
      case 'skipped': m.skips++; break;
      case 'demoSeen': m.demoSeen = true; break;
      case 'completed':
        m.completed = true;
        if (e.attemptId && attemptsWithHelp.has(e.attemptId)) m.completedWithHelp = true;
        if (e.data && 'right' in e.data) {
          m.scored++;
          if (e.at >= (scoreAt[e.missionId] ?? -Infinity)) {
            m.lastScore = { right: e.data.right, total: e.data.total };
            scoreAt[e.missionId] = e.at;
          }
        }
        break;
    }
  }
  return progress;
}

const ID = /^[A-Za-z0-9-]{8,64}$/;
const MISSION = /^(CO1|CO2|EX1)-(\d{2}|P\d)$/;
const NO_MISSION: EventType[] = ['welcomeSeen', 'placement', 'bookChosen'];

function isValidData(type: EventType, d: unknown): boolean {
  if (type === 'placement' || type === 'bookChosen') return typeof d === 'object' && d !== null && Object.keys(d).length === 1 && isBookId((d as { book?: unknown }).book);
  if (d === undefined) return true;
  if (type !== 'completed' || typeof d !== 'object' || d === null) return false;
  const { right, total, ...rest } = d as Record<string, unknown>;
  const int = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 50;
  return Object.keys(rest).length === 0 && int(right) && int(total) && (right as number) <= (total as number) && (total as number) > 0;
}

export function isValidEvent(v: unknown): v is ProgressEvent {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  if (typeof e.id !== 'string' || !ID.test(e.id)) return false;
  if (!EVENT_TYPES.includes(e.type as EventType)) return false;
  const type = e.type as EventType;
  if (NO_MISSION.includes(type) ? e.missionId !== null : typeof e.missionId !== 'string' || !MISSION.test(e.missionId)) return false;
  if (!isValidData(type, e.data)) return false;
  if (e.attemptId !== null && (typeof e.attemptId !== 'string' || !ID.test(e.attemptId))) return false;
  return typeof e.at === 'number' && Number.isFinite(e.at);
}

/** UUID v4 com getRandomValues: funciona também fora de contexto seguro (celular via IP da rede local). */
export function uuid(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
