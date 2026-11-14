// Lista de gravação: todos os textos falados do conteúdo, com o nome do arquivo e se ele já existe.
// Uso: npm run audios  →  escreve web/src/assets/audio/LISTA.csv e mostra o resumo.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { audioSlug, audioTexts, validateContent } from '../shared/content.ts';

const root = new URL('../', import.meta.url);
const dir = new URL('web/src/assets/audio/', root);
const content = validateContent(JSON.parse(readFileSync(new URL('web/public/content/missions.json', root), 'utf8')));

// Instruções em português: mesma voz, mas o resto da lista é inglês.
const portuguese = new Set(content.missions.flatMap((m) => (m.instruction ? [m.instruction.pt] : [])));
const kind = (t: string) => (/^\/[a-z]+\/$/.test(t) ? 'som da letra' : /^[A-Z]$/.test(t) ? 'nome da letra' : portuguese.has(t) ? 'português' : t.includes(' ') ? 'frase' : 'palavra');
const csv = (v: string) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

const rows = [...audioTexts(content)].map(([text, uses]) => {
  const file = `${audioSlug(text)}.mp3`;
  return { file, text, kind: kind(text), uses: uses.join(' '), ok: existsSync(new URL(file, dir)) };
});
rows.sort((a, b) => a.kind.localeCompare(b.kind) || a.file.localeCompare(b.file));

writeFileSync(
  new URL('LISTA.csv', dir),
  ['arquivo,texto,tipo,missoes,situacao', ...rows.map((r) => [r.file, r.text, r.kind, r.uses, r.ok ? 'ok' : 'falta'].map(csv).join(','))].join('\n') + '\n',
);
const missing = rows.filter((r) => !r.ok);
console.log(`${rows.length} áudios, ${missing.length} faltando. Lista em web/src/assets/audio/LISTA.csv`);
for (const k of ['som da letra', 'nome da letra', 'palavra', 'frase', 'português']) {
  const list = missing.filter((r) => r.kind === k);
  if (list.length) console.log(`\n${k} (${list.length}): ${list.map((r) => r.text).join(' · ')}`);
}
