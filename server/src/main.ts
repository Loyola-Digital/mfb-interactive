import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { serve } from '@hono/node-server';
import { createApp } from './app.ts';
import { openDb } from './db.ts';

// --dev: banco local e cookie sem Secure, para testar no celular via http na rede local.
const dev = process.argv.includes('--dev');
const dbPath = process.env.DB_PATH ?? (dev ? 'server/dev.db' : '/var/lib/mfb/app.db');
const port = Number(process.env.PORT ?? 8787);

mkdirSync(dirname(dbPath), { recursive: true });
const app = createApp({ db: openDb(dbPath), secureCookie: !dev });

serve({ fetch: app.fetch, port, hostname: dev ? '0.0.0.0' : '127.0.0.1' }, () => {
  console.log(`API em http://localhost:${port}/api (banco: ${dbPath}${dev ? ', modo dev' : ''})`);
});
