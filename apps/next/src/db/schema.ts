import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const Codes = sqliteTable('codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timesUsed: integer('times_used').notNull().default(0),
  value: text('value').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
