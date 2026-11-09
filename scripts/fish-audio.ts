// Gera as falas no Fish Audio (https://fish.audio). A chave fica em .fish-audio-key (fora do git) ou em FISH_API_KEY.
//   node scripts/fish-audio.ts vozes [busca]        vozes em inglês, com link de amostra
//   node scripts/fish-audio.ts amostra <voz>         audio-amostras/<voz>.mp3 com três falas, para escolher a voz
//   node scripts/fish-audio.ts gerar <voz> [--refazer]  grava em web/src/assets/audio/ o que falta (menos os sons das letras)
// FISH_MODEL troca o modelo: o padrão s2.1-pro-free funciona sem crédito; com saldo de API, s2.1-pro ou drama-3.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { audioSlug, audioTexts, validateContent } from '../shared/content.ts';

const root = new URL('../', import.meta.url);
const keyFile = new URL('.fish-audio-key', root);
const key = process.env.FISH_API_KEY ?? (existsSync(keyFile) ? readFileSync(keyFile, 'utf8').trim() : '');
if (!key) throw new Error('Falta a chave: crie o arquivo .fish-audio-key na pasta do projeto com a chave da API do Fish Audio.');
const auth = { Authorization: `Bearer ${key}` };

async function tts(text: string, voice: string): Promise<Buffer> {
  const res = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json', model: process.env.FISH_MODEL ?? 's2.1-pro-free' },
    // Ponto final: a palavra solta sai com entonação de afirmação, e "A." é o nome da letra, não o artigo.
    body: JSON.stringify({ text: /[.!?]$/.test(text) ? text : `${text}.`, reference_id: voice, format: 'mp3', mp3_bitrate: 128, prosody: { speed: 0.9 } }),
  });
  if (!res.ok) throw new Error(`Fish Audio ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

const [command, arg, flag] = process.argv.slice(2);

if (command === 'vozes') {
  const q = new URLSearchParams({ page_size: '15', language: 'en', sort_by: 'score', ...(arg ? { title: arg } : {}) });
  const res = await fetch(`https://api.fish.audio/model?${q}`, { headers: auth });
  if (!res.ok) throw new Error(`Fish Audio ${res.status}: ${await res.text()}`);
  const { items } = (await res.json()) as { items: { _id: string; title: string; samples?: { audio: string }[] }[] };
  for (const v of items) console.log(`${v._id}  ${v.title}${v.samples?.[0] ? `  ${v.samples[0].audio}` : ''}`);
} else if (command === 'amostra' && arg) {
  const dir = new URL('audio-amostras/', root);
  mkdirSync(dir, { recursive: true });
  const parts = await Promise.all(['red', 'B', 'Nate ate cake'].map((t) => tts(t, arg)));
  writeFileSync(new URL(`${arg}.mp3`, dir), Buffer.concat(parts));
  console.log(`audio-amostras/${arg}.mp3`);
} else if (command === 'gerar' && arg) {
  const content = validateContent(JSON.parse(readFileSync(new URL('web/public/content/missions.json', root), 'utf8')));
  const dir = new URL('web/src/assets/audio/', root);
  // Sons de letra ("/t/") ficam de fora: precisam de gravação humana.
  const texts = [...audioTexts(content).keys()].filter((t) => !/^\/[a-z]+\/$/.test(t));
  let made = 0;
  for (const text of texts) {
    const file = new URL(`${audioSlug(text)}.mp3`, dir);
    if (existsSync(file) && flag !== '--refazer') continue;
    writeFileSync(file, await tts(text, arg));
    console.log(`${audioSlug(text)}.mp3  ${text}`);
    made++;
  }
  console.log(`${made} arquivos gerados. Rode npm run audios para conferir a lista.`);
} else {
  console.log('Uso: node scripts/fish-audio.ts vozes [busca] | amostra <voz> | gerar <voz> [--refazer]');
}
