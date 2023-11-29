import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const { DB_URL, DB_TOKEN } = process.env;
if (!DB_URL) {
  throw new Error('env variable DB_URL is not defined');
}
if (!DB_TOKEN) {
  throw new Error('env variable DB_TOKEN is not defined');
}

const client = createClient({
  url: DB_URL,
  authToken: DB_TOKEN,
});

const db = drizzle(client);

export default db;
