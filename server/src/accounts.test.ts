import { describe, expect, it } from 'vitest';
import { createAccount, findUser, hashPassword, setPassword, verifyPassword } from './accounts.ts';
import { openDb } from './db.ts';

describe('senhas', () => {
  it('hash não contém a senha e verifica certa/errada', () => {
    const h = hashPassword('minha-senha');
    expect(h).not.toContain('minha-senha');
    expect(verifyPassword('minha-senha', h)).toBe(true);
    expect(verifyPassword('outra-senha', h)).toBe(false);
    expect(hashPassword('minha-senha')).not.toBe(h);
  });
});

describe('contas', () => {
  it('normaliza e-mail e recusa duplicado sem alterar a conta existente', () => {
    const db = openDb(':memory:');
    createAccount(db, ' Ana@Exemplo.com', 'senha-original');
    const antes = findUser(db, 'ana@exemplo.com')!;
    expect(() => createAccount(db, 'ana@exemplo.com', 'outra-senha')).toThrow('já existe');
    expect(findUser(db, 'ana@exemplo.com')!.password_hash).toBe(antes.password_hash);
  });

  it('exige senha de 8 caracteres e e-mail válido', () => {
    const db = openDb(':memory:');
    expect(() => createAccount(db, 'ana@exemplo.com', 'curta')).toThrow('8');
    expect(() => createAccount(db, 'sem-arroba', 'senha-longa')).toThrow('e-mail');
    createAccount(db, 'ana@exemplo.com', 'senha-longa');
    expect(() => setPassword(db, 'ana@exemplo.com', 'curta')).toThrow('8');
    expect(() => setPassword(db, 'nao@existe.com', 'senha-longa')).toThrow('não encontrada');
  });

  it('senha nunca fica em texto puro no banco', () => {
    const db = openDb(':memory:');
    createAccount(db, 'ana@exemplo.com', 'senha-secreta');
    const dump = JSON.stringify(db.prepare('SELECT * FROM users').all());
    expect(dump).not.toContain('senha-secreta');
  });
});
