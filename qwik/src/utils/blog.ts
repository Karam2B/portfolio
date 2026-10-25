import { createClient } from "@libsql/client";
import { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import jwt from "jsonwebtoken";
import * as v from "valibot";
import { snake_case_id_field } from "./snake_case_id";

const published_flag = v.pipe(v.any(), v.transform((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "bigint") return value !== BigInt(0);
    if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
    return false;
}), v.boolean());

const summary_schema = v.object({
    id: v.pipe(v.any(), v.transform((value) => String(value)), v.string(), v.nonEmpty()),
    snake_case_id: v.string(),
    title: v.string(),
    summary: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
    published: published_flag,
});

const post_schema = v.object({
    ...summary_schema.entries,
    content: v.string(),
});

const blog_text = {
    snake_case_id: snake_case_id_field,
    title: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(200)),
    summary: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(500)),
    content: v.pipe(v.string(), v.trim(), v.minLength(1)),
    published: v.boolean(),
};

export const create_blog_schema = v.object(blog_text);

export const edit_blog_schema = v.object({
    ...blog_text,
    created_at: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export type BlogSummary = v.InferOutput<typeof summary_schema>;

function missing_table(error: unknown) {
    return error instanceof Error && /no such table/i.test(error.message);
}

function read_client(env: EnvGetter) {
    const url = env.get("TURSO_DATABASE_URL");
    const authToken = env.get("TURSO_AUTH_TOKEN_READ_ONLY") || env.get("TURSO_AUTH_TOKEN_FULL_ACCESS");
    if (!url || !authToken) return null;
    return createClient({ url, authToken });
}

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
        return v.parse(v.array(summary_schema), fetched.rows);
    } catch (error) {
        if (missing_table(error)) return [];
        throw error;
    }
}

/** Public pages look up by snake_case_id; admin may pass the numeric id as a string. */
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
        const rows = v.parse(v.array(post_schema), fetched.rows);
        if (rows.length === 0) return { found: "none" as const };
        return { found: "some" as const, value: rows[0] };
    } catch (error) {
        if (missing_table(error)) return { found: "none" as const };
        throw error;
    }
}

export function is_admin(event: { cookie: { get(name: string): { value: string } | null }; env: EnvGetter }) {
    const token = event.cookie.get("jwt")?.value;
    const secret = event.env.get("JWT_SECRET");
    if (!token || !secret) return false;
    try {
        jwt.verify(token, secret);
        return true;
    } catch {
        return false;
    }
}

function write_client(env: EnvGetter) {
    const url = env.get("TURSO_DATABASE_URL");
    const authToken = env.get("TURSO_AUTH_TOKEN_FULL_ACCESS");
    if (!url || !authToken) {
        throw new Error("database is not configured");
    }
    return createClient({ url, authToken });
}

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
    for (const sql of [
        `ALTER TABLE Blog ADD COLUMN snake_case_id TEXT`,
        `ALTER TABLE Blog ADD COLUMN updated_at TEXT`,
    ]) {
        try {
            await client.execute(sql);
        } catch (error) {
            if (!(error instanceof Error) || !/duplicate column/i.test(error.message)) throw error;
        }
    }
    return client;
}

export async function create_blog(env: EnvGetter, input: v.InferOutput<typeof create_blog_schema>) {
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

export async function update_blog(env: EnvGetter, id: number, input: v.InferOutput<typeof edit_blog_schema>) {
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
    if (Number(written.rowsAffected) === 0) {
        throw new Error("not found");
    }
}

export async function delete_blog(env: EnvGetter, id: number) {
    const client = write_client(env);
    const written = await client.execute({
        sql: `DELETE FROM Blog WHERE id = ?`,
        args: [id],
    });
    if (Number(written.rowsAffected) === 0) {
        throw new Error("not found");
    }
}
