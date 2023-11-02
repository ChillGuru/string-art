import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const Codes = sqliteTable('codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timesUsed: integer('times_used').default(0),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const Admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
