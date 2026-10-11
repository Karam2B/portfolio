import { createClient } from "@libsql/client";
import { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import jwt from "jsonwebtoken";
import * as v from "valibot";

const published_flag = v.pipe(v.any(), v.transform((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "bigint") return value !== BigInt(0);
    if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
    return false;
}), v.boolean());

const summary_schema = v.object({
    id: v.pipe(v.any(), v.transform((value) => String(value)), v.string(), v.nonEmpty()),
    title: v.string(),
    summary: v.string(),
    created_at: v.string(),
    published: published_flag,
});

const post_schema = v.object({
    ...summary_schema.entries,
    content: v.string(),
});

const blog_text = {
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
            SELECT id, title, summary, created_at, published
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

export async function one_blog(env: EnvGetter, id: number, admin = false) {
    const client = read_client(env);
    if (!client || !Number.isFinite(id)) return { found: "none" as const };
    try {
        const fetched = await client.execute({
            sql: `
                SELECT id, title, summary, content, created_at, published
                FROM Blog
                WHERE ${admin ? "" : "published = 1 AND "}id = ?
            `,
            args: [id],
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
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            published INTEGER NOT NULL DEFAULT 1
        )
    `);
    return client;
}

export async function create_blog(env: EnvGetter, input: v.InferOutput<typeof create_blog_schema>) {
    const client = await ensure_blog_table(env);
    const created_at = new Date().toISOString();
    const written = await client.execute({
        sql: `
            INSERT INTO Blog (title, summary, content, created_at, published)
            VALUES (?, ?, ?, ?, ?)
        `,
        args: [input.title, input.summary, input.content, created_at, input.published ? 1 : 0],
    });
    return String(written.lastInsertRowid);
}

export async function update_blog(env: EnvGetter, id: number, input: v.InferOutput<typeof edit_blog_schema>) {
    const client = await ensure_blog_table(env);
    const written = await client.execute({
        sql: `
            UPDATE Blog
            SET title = ?, summary = ?, content = ?, created_at = ?, published = ?
            WHERE id = ?
        `,
        args: [input.title, input.summary, input.content, input.created_at, input.published ? 1 : 0, id],
    });
    if (Number(written.rowsAffected) === 0) {
        throw new Error("not found");
    }
}
