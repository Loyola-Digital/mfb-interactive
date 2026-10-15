// Uso (na VPS): npm run conta:criar -- email@familia.com
//               npm run conta:senha -- email@familia.com
//               npm run conta:desativar -- email@familia.com
//               npm run conta:admin -- seu@email.com      (dá o papel admin: pode gerar links de acesso)
//               npm run conta:familia -- seu@email.com    (volta ao papel família)
// Papel só muda por aqui, com acesso à VPS; a API não tem rota para isso.
// Sem a variável SENHA, pergunta a senha sem mostrar; deixar vazio gera uma senha e mostra uma vez.
import { randomBytes } from 'node:crypto';
import { createAccount, disableAccount, setPassword, setRole } from './accounts.ts';
import { openDb } from './db.ts';

// --dev usa o banco local de desenvolvimento (server/dev.db).
const args = process.argv.slice(2);
const dev = args.includes('--dev');
const [command, email] = args.filter((a) => a !== '--dev');
const db = openDb(process.env.DB_PATH ?? (dev ? 'server/dev.db' : '/var/lib/mfb/app.db'));

async function askPassword(): Promise<string> {
  if (process.env.SENHA) return process.env.SENHA;
  if (!process.stdin.isTTY) return '';
  process.stdout.write('Senha (Enter para gerar uma): ');
  process.stdin.setRawMode(true);
  let typed = '';
  for await (const chunk of process.stdin) {
    for (const ch of chunk.toString('utf8')) {
      if (ch === '\r' || ch === '\n') {
        process.stdin.setRawMode(false);
        process.stdout.write('\n');
        process.stdin.pause();
        return typed;
      }
      if (ch === '\u0003') process.exit(130);
      typed = ch === '\u007f' || ch === '\b' ? typed.slice(0, -1) : typed + ch;
    }
  }
  return typed;
}

async function main() {
  if (!email || !['criar', 'senha', 'desativar', 'admin', 'familia'].includes(command)) {
    console.error('Uso: npm run conta:<criar|senha|desativar|admin|familia> -- <email>');
    process.exit(1);
  }
  if (command === 'admin' || command === 'familia') {
    setRole(db, email, command === 'admin' ? 'admin' : 'family');
    console.log(`Conta ${email} agora tem o papel ${command === 'admin' ? 'admin' : 'família'}.`);
    return;
  }
  if (command === 'desativar') {
    disableAccount(db, email);
    console.log(`Conta ${email} desativada e sessões encerradas.`);
    return;
  }
  let password = await askPassword();
  const generated = !password;
  if (generated) password = randomBytes(9).toString('base64url');
  if (command === 'criar') createAccount(db, email, password);
  else setPassword(db, email, password);
  console.log(command === 'criar' ? `Conta ${email} criada.` : `Senha de ${email} redefinida; sessões abertas encerradas.`);
  if (generated) console.log(`Senha gerada (envie à família, não aparece de novo): ${password}`);
}

main().catch((err) => {
  console.error(`Erro: ${err.message}`);
  process.exit(1);
});
