/**
 * Turso (libSQL) connections and the SQLite quirks shared by every table module.
 *
 * Every SQL statement in the app lives under `src/server/db/`, one file per table
 * (`projects.ts`, `blogs.ts`). Those files build on the helpers here so connection
 * handling, row parsing, and schema upgrades behave the same for each table.
 *
 * Server-only: these helpers read secrets from the request env, so only call them
 * from `routeLoader$`, `routeAction$`, `onStaticGenerate`, or other server code.
 */

import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import { createClient, type Client, type InStatement, type ResultSet } from "@libsql/client";
import * as v from "valibot";

/** Thrown when the env vars for a write connection are missing. `save_error` turns it into a user message. */
export const DB_NOT_CONFIGURED = "database is not configured";

/** Thrown by update/delete when no row matched the given id. */
export const NOT_FOUND = "not found";

/**
 * Connection for SELECT queries.
 * Prefers the read-only token and falls back to the full-access one.
 * Returns null when the database env vars are missing so each caller decides
 * whether that is an error or just "no content yet".
 */
export function read_client(env: EnvGetter): Client | null {
    const url = env.get("TURSO_DATABASE_URL");
    const authToken = env.get("TURSO_AUTH_TOKEN_READ_ONLY") || env.get("TURSO_AUTH_TOKEN_FULL_ACCESS");
    if (!url || !authToken) return null;
    return createClient({ url, authToken });
}

/** Connection for INSERT/UPDATE/DELETE and schema changes. Throws DB_NOT_CONFIGURED without the full-access token. */
export function write_client(env: EnvGetter): Client {
    const url = env.get("TURSO_DATABASE_URL");
    const authToken = env.get("TURSO_AUTH_TOKEN_FULL_ACCESS");
    if (!url || !authToken) throw new Error(DB_NOT_CONFIGURED);
    return createClient({ url, authToken });
}

/**
 * libSQL returns SQLite integers as number or bigint, never as a JS boolean.
 * Use this for 0/1 flag columns such as `published` and `display_on_home`.
 */
export function sqlite_bool(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "bigint") return value !== BigInt(0);
    if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
    return false;
}

/** Valibot schema version of `sqlite_bool`, for row schemas. */
export const sqlite_bool_schema = v.pipe(v.any(), v.transform(sqlite_bool), v.boolean());

/** Like `v.parse`, but the thrown message names the failing field path, which makes bad rows easy to find in logs. */
export function parse_rows<S extends v.GenericSchema>(schema: S, rows: unknown): v.InferOutput<S> {
    const result = v.safeParse(schema, rows);
    if (!result.success) {
        const issue = result.issues[0];
        const path = JSON.stringify(issue.path?.map((e) => e.key));
        throw new Error("valibot error: invalid schema: " + issue.message + ", path: " + path);
    }
    return result.output;
}

export function is_missing_table(error: unknown) {
    return error instanceof Error && /no such table/i.test(error.message);
}

/** True when a query referenced a column the live table does not have yet. */
export function is_missing_column(error: unknown, column: string) {
    return error instanceof Error && /no such column/i.test(error.message) && new RegExp(column, "i").test(error.message);
}

export function is_unique_constraint_error(error: unknown) {
    return error instanceof Error && /unique constraint failed/i.test(error.message);
}

/**
 * Runs each `ALTER TABLE ... ADD COLUMN` and ignores "duplicate column" errors.
 * This is how the tables pick up new columns: there is no migration runner,
 * so the write paths call this before saving.
 */
export async function add_columns_if_missing(client: Client, statements: string[]) {
    for (const sql of statements) {
        try {
            await client.execute(sql);
        } catch (error) {
            if (!(error instanceof Error) || !/duplicate column/i.test(error.message)) throw error;
        }
    }
}

/**
 * Runs `query`, and reruns `fallback` if the table has no `published` column yet.
 * Columns are only added on the first admin save (see `add_columns_if_missing`),
 * so public reads can run against an older table. The fallback should skip the
 * `published` filter, which treats every row as published.
 */
export async function execute_with_published_fallback(
    client: Client,
    query: InStatement,
    fallback: InStatement,
): Promise<ResultSet> {
    try {
        return await client.execute(query);
    } catch (error) {
        if (!is_missing_column(error, "published")) throw error;
        return await client.execute(fallback);
    }
}
