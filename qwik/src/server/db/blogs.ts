/**
 * Blog table: every SQL statement that touches `Blog` lives here.
 *
 * - Public pages look a post up by `snake_case_id`; admin pages use the numeric `id`.
 * - `published` is the only visibility flag. Public queries filter on `published = 1`;
 *   passing `admin = true` also returns hidden posts.
 * - The table is created on the first admin save (`ensure_blog_table`), so reads
 *   treat a missing table or a missing database config as "no posts yet".
 */

import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import * as v from "valibot";
import { snake_case_id_field } from "~/lib/snake_case_id";
import {
    NOT_FOUND,
    add_columns_if_missing,
    is_missing_table,
    parse_rows,
    read_client,
    sqlite_bool_schema,
    write_client,
} from "./client";

// ---------------------------------------------------------------------------
// Schemas and types
// ---------------------------------------------------------------------------

/** A post as list pages receive it, without the markdown body. */
const blog_summary_schema = v.object({
    id: v.pipe(v.any(), v.transform((value) => String(value)), v.string(), v.nonEmpty()),
    snake_case_id: v.string(),
    title: v.string(),
    summary: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
    published: sqlite_bool_schema,
});

const blog_post_schema = v.object({
    ...blog_summary_schema.entries,
    content: v.string(),
});

export type BlogSummary = v.InferOutput<typeof blog_summary_schema>;
export type BlogPost = v.InferOutput<typeof blog_post_schema>;

const blog_fields = {
    snake_case_id: snake_case_id_field,
    title: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(200)),
    summary: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(500)),
    content: v.pipe(v.string(), v.trim(), v.minLength(1)),
    published: v.boolean(),
};

/** Fields the admin "new post" form sends. `created_at` and `updated_at` are set server-side. */
export const blog_create_schema = v.object(blog_fields);

/** Fields the admin edit form sends. The edit form also lets the admin change `created_at`. */
export const blog_edit_schema = v.object({
    ...blog_fields,
    created_at: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Posts newest first, without the markdown body. Pass `admin = true` to include hidden posts. */
export async function list_blogs(env: EnvGetter, admin = false): Promise<BlogSummary[]> {
    const client = read_client(env);
    if (!client) return [];
    try {
        const fetched = await client.execute(`
            SELECT id, snake_case_id, title, summary, created_at,
                   COALESCE(updated_at, created_at) AS updated_at, published
            FROM Blog
            ${admin ? "" : "WHERE published = 1"}
            ORDER BY created_at DESC
        `);
        return parse_rows(v.array(blog_summary_schema), fetched.rows);
    } catch (error) {
        if (is_missing_table(error)) return [];
        throw error;
    }
}

/**
 * One post, including its markdown body.
 * Public routes pass `snake_case_id`; admin routes may pass the numeric id as a string.
 */
export async function one_blog(env: EnvGetter, key: string, admin = false) {
    const client = read_client(env);
    if (!client || !key) return { found: "none" as const };
    const by_id = admin && /^\d+$/.test(key);
    try {
        const fetched = await client.execute({
            sql: `
                SELECT id, snake_case_id, title, summary, content, created_at,
                       COALESCE(updated_at, created_at) AS updated_at, published
                FROM Blog
                WHERE ${admin ? "" : "published = 1 AND "}${by_id ? "id" : "snake_case_id"} = ?
            `,
            args: [by_id ? Number(key) : key],
        });
        const rows = parse_rows(v.array(blog_post_schema), fetched.rows);
        if (rows.length === 0) return { found: "none" as const };
        return { found: "some" as const, value: rows[0] };
    } catch (error) {
        if (is_missing_table(error)) return { found: "none" as const };
        throw error;
    }
}

// ---------------------------------------------------------------------------
// Writes (admin only — callers must check `is_admin` first)
// ---------------------------------------------------------------------------

/** Creates the table on first use and adds columns introduced later, then returns a write connection. */
async function ensure_blog_table(env: EnvGetter) {
    const client = write_client(env);
    await client.execute(`
        CREATE TABLE IF NOT EXISTS Blog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            snake_case_id TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            published INTEGER NOT NULL DEFAULT 1
        )
    `);
    await add_columns_if_missing(client, [
        `ALTER TABLE Blog ADD COLUMN snake_case_id TEXT`,
        `ALTER TABLE Blog ADD COLUMN updated_at TEXT`,
    ]);
    return client;
}

/** Inserts a post and returns its new id and slug. */
export async function create_blog(env: EnvGetter, input: v.InferOutput<typeof blog_create_schema>) {
    const client = await ensure_blog_table(env);
    const now = new Date().toISOString();
    const written = await client.execute({
        sql: `
            INSERT INTO Blog (snake_case_id, title, summary, content, created_at, updated_at, published)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [input.snake_case_id, input.title, input.summary, input.content, now, now, input.published ? 1 : 0],
    });
    return { id: String(written.lastInsertRowid), snake_case_id: input.snake_case_id };
}

/** Overwrites every editable field and bumps `updated_at`. Throws NOT_FOUND for an unknown id. */
export async function update_blog(env: EnvGetter, id: number, input: v.InferOutput<typeof blog_edit_schema>) {
    const client = await ensure_blog_table(env);
    const updated_at = new Date().toISOString();
    const written = await client.execute({
        sql: `
            UPDATE Blog
            SET snake_case_id = ?, title = ?, summary = ?, content = ?, created_at = ?, updated_at = ?, published = ?
            WHERE id = ?
        `,
        args: [input.snake_case_id, input.title, input.summary, input.content, input.created_at, updated_at, input.published ? 1 : 0, id],
    });
    if (Number(written.rowsAffected) === 0) throw new Error(NOT_FOUND);
}

/** Throws NOT_FOUND for an unknown id. */
export async function delete_blog(env: EnvGetter, id: number) {
    const client = write_client(env);
    const written = await client.execute({
        sql: `DELETE FROM Blog WHERE id = ?`,
        args: [id],
    });
    if (Number(written.rowsAffected) === 0) throw new Error(NOT_FOUND);
}
