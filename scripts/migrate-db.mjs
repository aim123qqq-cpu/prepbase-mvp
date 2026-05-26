import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createPgConfig } from './db-url.mjs';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const migrationsDir = path.join(root, 'database', 'migrations');

const client = new Client(createPgConfig());

try {
  await client.connect();
  await client.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rowCount } = await client.query(
      'select 1 from schema_migrations where id = $1',
      [file],
    );

    if (rowCount) {
      console.log(`skip ${file}`);
      continue;
    }

    console.log(`apply ${file}`);
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    await client.query('begin');
    try {
      await client.query(sql);
      await client.query('insert into schema_migrations (id) values ($1)', [file]);
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
  }

  console.log('migrations complete');
} finally {
  await client.end();
}
