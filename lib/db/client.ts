import 'server-only';

import type { QueryResultRow } from 'pg';

import { getPool } from './pool';

/**
 * Thin query layer over the shared pool.
 *
 * Every call site passes values as parameters. There is no string
 * concatenation of user input anywhere in lib/db, which is what keeps SQL
 * injection off the table without an ORM in the dependency tree.
 */
export async function query<T extends QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query<T>(text, values as unknown[]);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, values);
  return rows[0] ?? null;
}

/** Runs a callback inside a transaction, releasing the client either way. */
export async function transaction<T>(
  fn: (client: {
    query: <R extends QueryResultRow>(text: string, values?: readonly unknown[]) => Promise<R[]>;
  }) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    const result = await fn({
      query: async <R extends QueryResultRow>(text: string, values: readonly unknown[] = []) => {
        const res = await client.query<R>(text, values as unknown[]);
        return res.rows;
      },
    });
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
