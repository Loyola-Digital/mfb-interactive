import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Db } from './db.ts';

export const MIN_PASSWORD = 8;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [, salt, key] = stored.split('$');
  const expected = Buffer.from(key, 'base64');
  const actual = scryptSync(password, Buffer.from(salt, 'base64'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Hash de uma senha qualquer, usado quando o e-mail não existe para o login levar o mesmo tempo.
export const DUMMY_HASH = hashPassword(randomBytes(12).toString('hex'));

export const ROLES = ['family', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export interface User {
  id: number;
  email: string;
  password_hash: string;
  status: 'active' | 'disabled';
  role: Role;
}

export function findUser(db: Db, email: string): User | undefined {
  return db.prepare('SELECT id, email, password_hash, status, role FROM users WHERE email = ?').get(normalizeEmail(email)) as User | undefined;
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));

function checkInputs(email: string, password: string) {
  if (!isValidEmail(email)) throw new Error('e-mail inválido');
  if (password.length < MIN_PASSWORD) throw new Error(`a senha precisa de pelo menos ${MIN_PASSWORD} caracteres`);
}

/** Conta nova sempre nasce como família; admin só pelo comando `admin` (setRole). */
export function createAccount(db: Db, email: string, password: string): number {
  checkInputs(email, password);
  if (findUser(db, email)) throw new Error('já existe uma conta com esse e-mail');
  const r = db.prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)').run(normalizeEmail(email), hashPassword(password), Date.now());
  return Number(r.lastInsertRowid);
}

function mustFind(db: Db, email: string): User {
  const user = findUser(db, email);
  if (!user) throw new Error('conta não encontrada');
  return user;
}

/** Redefine a senha, reativa a conta e encerra as sessões abertas. */
export function setPassword(db: Db, email: string, password: string): void {
  checkInputs(email, password);
  const user = mustFind(db, email);
  db.prepare("UPDATE users SET password_hash = ?, status = 'active' WHERE id = ?").run(hashPassword(password), user.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
}

/** Só pelo comando na VPS: nenhuma rota da API muda papel. */
export function setRole(db: Db, email: string, role: Role): void {
  if (!ROLES.includes(role)) throw new Error(`papel inválido: ${role}`);
  const user = mustFind(db, email);
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, user.id);
}

export function disableAccount(db: Db, email: string): void {
  const user = mustFind(db, email);
  db.prepare("UPDATE users SET status = 'disabled' WHERE id = ?").run(user.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
}
