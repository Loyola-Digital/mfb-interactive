import type { PlayableMission } from '../../../shared/content.ts';

export interface GameHooks {
  /** Mostrar a demonstração ao entrar (primeira vez na conta). */
  demoFirst: boolean;
  onDemoSeen(): void;
  /** Ajuda acionada: pelo botão ou pela ajuda progressiva. */
  onHelp(): void;
  onComplete(): void;
}

export interface GameHandle {
  help(): void;
  destroy(): void;
}

export type MissionOf<T extends PlayableMission['type']> = Extract<PlayableMission, { type: T }>;

export interface GameModule<T extends PlayableMission['type'] = PlayableMission['type']> {
  play(root: HTMLElement, mission: MissionOf<T>, hooks: GameHooks): GameHandle;
  /** Cena da tela de resultado: a transformação que a criança causou. */
  result(mission: MissionOf<T>): string;
}
