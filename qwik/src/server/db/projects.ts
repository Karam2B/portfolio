/**
 * Project table: every SQL statement that touches `Project` lives here.
 *
 * - Public pages look a project up by `snake_case_id`; admin pages use the numeric `id`.
 * - `published` is the only visibility flag. Public queries filter on `published = 1`;
 *   passing `admin = true` also returns hidden rows.
 * - `skills` is one comma-separated string, normalized by `normalize_skills` on write.
 * - Columns added after the table was first created are back-filled on every write
 *   (`add_project_columns`), and reads tolerate a table without `published` yet.
 * - A missing database config is an error for project reads; blogs.ts returns
 *   empty results instead.
 */

import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import * as v from "valibot";
import { snake_case_id_field } from "~/lib/snake_case_id";
import {
    DB_NOT_CONFIGURED,
    NOT_FOUND,
    add_columns_if_missing,
    execute_with_published_fallback,
    parse_rows,
    read_client,
    sqlite_bool,
    write_client,
} from "./client";

// ---------------------------------------------------------------------------
// Schemas and types
// ---------------------------------------------------------------------------

/** A project as pages receive it. `id` is a string because route params are strings. */
const project_schema = v.object({
    id: v.pipe(v.any(), v.transform((e) => String(e)), v.string(), v.nonEmpty()),
    snake_case_id: v.string(),
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    github_link: v.nullable(v.string()),
    display_on_home: v.pipe(v.any(), v.transform((e) => Boolean(e)), v.boolean()),
    live_link: v.nullable(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
    display_picture: v.nullable(v.string()),
    published: v.boolean(),
    skills: v.string(),
});

/** List views skip the markdown body. */
const project_summary_schema = v.omit(project_schema, ["content"]);

export type Project = v.InferOutput<typeof project_schema>;
export type ProjectSummary = v.InferOutput<typeof project_summary_schema>;

/** Empty form fields are stored as NULL. */
const optional_text = v.pipe(v.string(), v.trim(), v.transform((value) => value === "" ? null : value));

const project_fields = {
    snake_case_id: snake_case_id_field,
    title: v.pipe(v.string(), v.trim(), v.minLength(1)),
    summary: v.pipe(v.string(), v.trim(), v.minLength(1)),
    content: v.string(),
    github_link: optional_text,
    live_link: optional_text,
    display_picture: optional_text,
    display_on_home: v.boolean(),
    published: v.boolean(),
    skills: v.string(),
};

/** Fields the admin "new project" form sends. `created_at` and `updated_at` are set server-side. */
export const project_create_schema = v.object(project_fields);

/** Fields the admin edit form sends. The edit form also lets the admin change `created_at`. */
export const project_edit_schema = v.object({
    ...project_fields,
    created_at: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

/** Trim, drop empties, dedupe — store as `"a, b, c"`. */
function normalize_skills(raw: string): string {
    return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].join(", ");
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Every column except `content` and `published`, which each query adds as needed. */
const project_columns = `
            p.id AS p_id,
            p.snake_case_id AS p_snake_case_id,
            p.title AS p_title,
            p.summary AS p_summary,
            p.github_link AS p_github_link,
            p.display_on_home AS p_display_on_home,
            p.live_link AS p_live_link,
            p.created_at AS p_created_at,
            COALESCE(p.updated_at, p.created_at) AS p_updated_at,
            p.display_picture AS p_display_picture,
            p.skills AS p_skills
`;

/** Raw row shape produced by `project_columns`. */
const project_row_schema = v.object({
    p_id: v.number(),
    p_snake_case_id: v.string(),
    p_title: v.string(),
    p_summary: v.string(),
    p_github_link: v.nullable(v.string()),
    p_live_link: v.nullable(v.string()),
    p_display_on_home: v.pipe(v.any(), v.transform((e) => Boolean(e)), v.boolean()),
    p_created_at: v.string(),
    p_updated_at: v.string(),
    p_content: v.nullish(v.string()),
    p_display_picture: v.nullable(v.string()),
    p_published: v.nullish(v.any()),
    p_skills: v.nullish(v.string()),
});

/** A row without `p_published` came from the fallback query and counts as published. */
function map_project_row(row: v.InferOutput<typeof project_row_schema>, with_content: boolean) {
    const published = row.p_published == null ? true : sqlite_bool(row.p_published);
    const base = {
        id: row.p_id,
        snake_case_id: row.p_snake_case_id,
        title: row.p_title,
        summary: row.p_summary,
        github_link: row.p_github_link,
        display_on_home: row.p_display_on_home,
        live_link: row.p_live_link,
        created_at: row.p_created_at,
        updated_at: row.p_updated_at,
        display_picture: row.p_display_picture,
        published,
        skills: row.p_skills ?? "",
    };
    if (with_content) {
        return { ...base, content: row.p_content ?? "" };
    }
    return base;
}

function project_read_client(env: EnvGetter) {
    const client = read_client(env);
    if (!client) throw new Error(DB_NOT_CONFIGURED);
    return client;
}

/**
 * Every project without the markdown body. Used by the home page, /projects,
 * and `onStaticGenerate`. Pass `admin = true` to include unpublished rows.
 */
export async function list_projects(env: EnvGetter, admin = false): Promise<ProjectSummary[]> {
    const client = project_read_client(env);
    const fetched = await execute_with_published_fallback(
        client,
        `
        SELECT ${project_columns},
            p.published AS p_published
        FROM Project p
        ${admin ? "" : "WHERE p.published = 1"};
        `,
        `
        SELECT ${project_columns}
        FROM Project p;
        `,
    );

    const rows = parse_rows(v.array(project_row_schema), fetched.rows);
    console.log("fetched project with count: ", fetched.rows.length);
    return parse_rows(v.array(project_summary_schema), rows.map((row) => map_project_row(row, false)));
}

/**
 * One project, including its markdown body.
 * Public routes pass `snake_case_id`; admin routes may pass the numeric id as a string.
 */
export async function one_project(env: EnvGetter, key: string, admin = false) {
    const client = project_read_client(env);
    if (!key) return { found: "none" as const };

    const by_id = admin && /^\d+$/.test(key);
    const key_column = by_id ? "p.id" : "p.snake_case_id";
    const args = [by_id ? Number(key) : key];
    const columns = `${project_columns},
            p.content AS p_content
    `;

    const fetched = await execute_with_published_fallback(
        client,
        {
            sql: `
        SELECT ${columns},
            p.published AS p_published
        FROM Project p
        ${admin ? `WHERE ${key_column} = ?` : `WHERE p.published = 1 AND ${key_column} = ?`};
        `,
            args,
        },
        {
            sql: `
        SELECT ${columns}
        FROM Project p
        WHERE ${key_column} = ?;
        `,
            args,
        },
    );

    const rows = parse_rows(v.array(project_row_schema), fetched.rows);
    if (rows.length === 0) {
        return { found: "none" as const };
    }
    if (rows.length > 1) {
        throw new Error("bug: id didn't work as unique, len" + rows.length);
    }
    return { found: "some" as const, value: parse_rows(project_schema, map_project_row(rows[0], true)) };
}

// ---------------------------------------------------------------------------
// Writes (admin only — callers must check `is_admin` first)
// ---------------------------------------------------------------------------

/** Adds columns introduced after the table was created, then returns a write connection. */
async function add_project_columns(env: EnvGetter) {
    const client = write_client(env);
    await add_columns_if_missing(client, [
        `ALTER TABLE Project ADD COLUMN published INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE Project ADD COLUMN skills TEXT NOT NULL DEFAULT ''`,
        `ALTER TABLE Project ADD COLUMN snake_case_id TEXT`,
        `ALTER TABLE Project ADD COLUMN updated_at TEXT`,
    ]);
    return client;
}

/** Inserts a project and returns its new id and slug. */
export async function create_project(env: EnvGetter, input: v.InferOutput<typeof project_create_schema>) {
    const client = await add_project_columns(env);
    const now = new Date().toISOString();
    const written = await client.execute({
        sql: `
            INSERT INTO Project (
                snake_case_id, title, summary, content, github_link, live_link, display_picture,
                display_on_home, created_at, updated_at, published, skills
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            input.snake_case_id,
            input.title,
            input.summary,
            input.content,
            input.github_link,
            input.live_link,
            input.display_picture,
            input.display_on_home ? 1 : 0,
            now,
            now,
            input.published ? 1 : 0,
            normalize_skills(input.skills),
        ],
    });
    return { id: String(written.lastInsertRowid), snake_case_id: input.snake_case_id };
}

/** Overwrites every editable field and bumps `updated_at`. Throws NOT_FOUND for an unknown id. */
export async function update_project(env: EnvGetter, id: number, input: v.InferOutput<typeof project_edit_schema>) {
    const client = await add_project_columns(env);
    const updated_at = new Date().toISOString();
    const written = await client.execute({
        sql: `
            UPDATE Project SET
                snake_case_id = ?,
                title = ?,
                summary = ?,
                content = ?,
                github_link = ?,
                live_link = ?,
                display_picture = ?,
                display_on_home = ?,
                created_at = ?,
                updated_at = ?,
                published = ?,
                skills = ?
            WHERE id = ?
        `,
        args: [
            input.snake_case_id,
            input.title,
            input.summary,
            input.content,
            input.github_link,
            input.live_link,
            input.display_picture,
            input.display_on_home ? 1 : 0,
            input.created_at,
            updated_at,
            input.published ? 1 : 0,
            normalize_skills(input.skills),
            id,
        ],
    });
    if (Number(written.rowsAffected) === 0) throw new Error(NOT_FOUND);
}

/** Throws NOT_FOUND for an unknown id. */
export async function delete_project(env: EnvGetter, id: number) {
    const client = write_client(env);
    const written = await client.execute({
        sql: `DELETE FROM Project WHERE id = ?`,
        args: [id],
    });
    if (Number(written.rowsAffected) === 0) throw new Error(NOT_FOUND);
}
