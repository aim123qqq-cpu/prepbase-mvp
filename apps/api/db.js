import pg from 'pg';
import { createPgConfig } from './db-config.js';

const { Pool } = pg;

let pool;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!hasDatabaseUrl()) {
    throw new Error('DATABASE_URL is required');
  }

  if (!pool) {
    pool = new Pool(createPgConfig());
  }

  return pool;
}

export async function query(sql, params = []) {
  const result = await getPool().query(sql, params);
  return result.rows;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
