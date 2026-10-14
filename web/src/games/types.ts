import type { PlayableMission } from '../../../shared/content.ts';

export interface GameHooks {
  /** Mostrar a demonstração ao entrar (primeira vez na conta). */
  demoFirst: boolean;
  onDemoSeen(): void;
  /** Ajuda acionada: pelo botão ou pela ajuda progressiva. */
  onHelp(): void;
  /** Na prova, leva os acertos. */
  onComplete(score?: Score): void;
  /** Modo prova: sem demonstração nem ajuda; a primeira escolha é a resposta. */
  test?: boolean;
}

export interface Score {
  right: number;
  total: number;
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
