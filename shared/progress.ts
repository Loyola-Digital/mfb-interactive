// Progresso como log de eventos. Front e back usam a mesma agregação.

export const EVENT_TYPES = ['started', 'help', 'completed', 'skipped', 'demoSeen', 'welcomeSeen'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface ProgressEvent {
  id: string;
  type: EventType;
  /** null só em welcomeSeen. */
  missionId: string | null;
  /** Identifica a tentativa (de started até completed) para saber se houve ajuda nela. */
  attemptId: string | null;
  /** Epoch em ms, no relógio do aparelho. */
  at: number;
}

export interface MissionProgress {
  plays: number;
  completed: boolean;
  completedWithHelp: boolean;
  skips: number;
  helpCount: number;
  demoSeen: boolean;
}

export interface Progress {
  welcomeSeen: boolean;
  missions: Record<string, MissionProgress>;
}

export const emptyMission = (): MissionProgress => ({
  plays: 0,
  completed: false,
  completedWithHelp: false,
  skips: 0,
  helpCount: 0,
  demoSeen: false,
});

export function aggregate(events: Iterable<ProgressEvent>): Progress {
  const byId = new Map<string, ProgressEvent>();
  for (const e of events) byId.set(e.id, e);

  const progress: Progress = { welcomeSeen: false, missions: {} };
  const attemptsWithHelp = new Set<string>();
  for (const e of byId.values()) if (e.type === 'help' && e.attemptId) attemptsWithHelp.add(e.attemptId);

  for (const e of byId.values()) {
    if (e.type === 'welcomeSeen') {
      progress.welcomeSeen = true;
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
        break;
    }
  }
  return progress;
}

const ID = /^[A-Za-z0-9-]{8,64}$/;
const MISSION = /^M\d{2}$/;

export function isValidEvent(v: unknown): v is ProgressEvent {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  if (typeof e.id !== 'string' || !ID.test(e.id)) return false;
  if (!EVENT_TYPES.includes(e.type as EventType)) return false;
  if (e.type === 'welcomeSeen' ? e.missionId !== null : typeof e.missionId !== 'string' || !MISSION.test(e.missionId)) return false;
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
