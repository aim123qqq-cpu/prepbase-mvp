export function createPgConfig(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const url = new URL(databaseUrl);
  const sslRequired = url.searchParams.get('sslmode') === 'require';
  url.searchParams.delete('sslmode');

  return {
    connectionString: url.toString(),
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
  };
}
