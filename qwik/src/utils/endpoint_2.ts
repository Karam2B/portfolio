// Project reads and writes against Turso.
// Skills live on Project.skills as a comma-separated string.
// Public URLs use Project.snake_case_id (unique). Numeric id stays the PK for admin.
// `published` is the only visibility flag. Public queries require published = 1.

import { EnvGetter, RequestEventLoader } from "@builder.io/qwik-city/middleware/request-handler";
import { createClient } from "@libsql/client"
import * as v from "valibot"
import { snake_case_id_field } from "./snake_case_id"

// libsql returns SQLite integers as number or bigint, not as a JS boolean.
function sqlite_bool(value: unknown) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "bigint") return value !== BigInt(0);
    if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
    return false;
}

function v_parse<S extends v.GenericSchema>(schema: S, obj: unknown): v.InferOutput<S> {
    let result_ = v.safeParse(schema, obj);

    if (!result_.success) {
        let message = "invalid schema: " + result_.issues[0].message + ", path: " + JSON.stringify(result_.issues[0].path?.map((e) => e.key))
        throw new Error("valibot error: " + message)
    }

    return result_.output;
}

/** Trim, drop empties, dedupe — store as `"a, b, c"`. */
export function normalize_skills(raw: string): string {
    return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].join(", ");
}

// Shape returned to pages. id is a string because route params are strings.
export const project_schema = v.object({
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

// Fields the admin create form sends. created_at is set server-side.
export const project_create_schema = v.object(project_fields);

// Fields the admin edit form sends. skills is the raw comma-separated field.
export const project_edit_schema = v.object({
    ...project_fields,
    created_at: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

function write_client(env: EnvGetter) {
    const url = env.get("TURSO_DATABASE_URL");
    const authToken = env.get("TURSO_AUTH_TOKEN_FULL_ACCESS");
    if (!url || !authToken) throw new Error("database is not configured");
    return createClient({ url, authToken });
}

async function ensure_project_columns(env: EnvGetter) {
    const client = write_client(env);
    for (const sql of [
        `ALTER TABLE Project ADD COLUMN published INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE Project ADD COLUMN skills TEXT NOT NULL DEFAULT ''`,
        `ALTER TABLE Project ADD COLUMN snake_case_id TEXT`,
        `ALTER TABLE Project ADD COLUMN updated_at TEXT`,
    ]) {
        try {
            await client.execute(sql);
        } catch (error) {
            if (!(error instanceof Error) || !/duplicate column/i.test(error.message)) throw error;
        }
    }
    return client;
}

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

// Published project slugs, used to pre-render /projects/:project_id.
export const all_projects_ids = async function (env: EnvGetter) {
    const authToken = env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched;
    try {
        fetched = await client.execute({
            sql: `SELECT snake_case_id FROM Project WHERE published = 1;`
        })
    } catch (error) {
        if (!(error instanceof Error) || !/no such column/i.test(error.message) || !/published/i.test(error.message)) throw error;
        fetched = await client.execute({
            sql: `SELECT snake_case_id FROM Project;`
        })
    }

    return v.parse(v.array(v.object({ snake_case_id: v.string() })), fetched.rows);
}

// One project, including its markdown body.
// Public routes pass snake_case_id; admin may pass the numeric id as a string.
export const one_project_2 = async function (event: RequestEventLoader, key: string, admin = false) {
    const authToken = event.env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = event.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }
    if (!key) return { found: "none" as const }

    let client = createClient({ url, authToken })
    const by_id = admin && /^\d+$/.test(key);
    const key_column = by_id ? "p.id" : "p.snake_case_id";
    const key_arg = by_id ? Number(key) : key;

    const columns = `${project_columns},
            p.content AS p_content
    `;
    let fetched;
    try {
        fetched = await client.execute({
            sql: `
        SELECT ${columns},
            p.published AS p_published
        FROM Project p
        ${admin ? `WHERE ${key_column} = ?` : `WHERE p.published = 1 AND ${key_column} = ?`};
`, args: [key_arg]
        })
    } catch (error) {
        // A read that runs before the first admin save may not have published yet.
        // Treat every matching project as published in that case.
        if (!(error instanceof Error) || !/no such column/i.test(error.message) || !/published/i.test(error.message)) throw error;
        fetched = await client.execute({
            sql: `
        SELECT ${columns}
        FROM Project p
        WHERE ${key_column} = ?;
`, args: [key_arg]
        })
    }

    let result = v_parse(v.array(project_row_schema), fetched.rows);

    if (result.length === 0) {
        return { found: "none" as const }
    }
    if (result.length > 1) {
        throw new Error("bug: id didn't work as unique, len" + result.length)
    }

    return { found: "some" as const, value: v_parse(project_schema, map_project_row(result[0], true)) }
}

// Every project for the home page and /projects, without the markdown body.
// admin includes unpublished rows.
export const use_server_projects_2 = async function (event: RequestEventLoader, admin = false) {
    const authToken = event.env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = event.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched;
    try {
        fetched = await client.execute({
            sql: `
        SELECT ${project_columns},
            p.published AS p_published
        FROM Project p
        ${admin ? "" : "WHERE p.published = 1"};
`
        })
    } catch (error) {
        // Same missing-column fallback as one_project_2.
        if (!(error instanceof Error) || !/no such column/i.test(error.message) || !/published/i.test(error.message)) throw error;
        fetched = await client.execute({
            sql: `
        SELECT ${project_columns}
        FROM Project p
`
        })
    }

    let result = v_parse(v.array(project_row_schema), fetched.rows);

    console.log("fetched project with count: ", fetched.rows.length);

    return v_parse(v.array(v.object({
        id: v.pipe(v.any(), v.transform((e) => String(e)), v.string()),
        snake_case_id: project_schema.entries.snake_case_id,
        title: project_schema.entries.title,
        summary: project_schema.entries.summary,
        github_link: project_schema.entries.github_link,
        display_on_home: project_schema.entries.display_on_home,
        live_link: project_schema.entries.live_link,
        created_at: project_schema.entries.created_at,
        updated_at: project_schema.entries.updated_at,
        display_picture: project_schema.entries.display_picture,
        published: project_schema.entries.published,
        skills: project_schema.entries.skills,
    })), result.map((row) => map_project_row(row, false)))
}

export async function create_project(env: EnvGetter, input: v.InferOutput<typeof project_create_schema>) {
    const client = await ensure_project_columns(env);
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

// Writes a project including its skills string.
export async function update_project(env: EnvGetter, id: number, input: v.InferOutput<typeof project_edit_schema>) {
    const client = await ensure_project_columns(env);
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
    if (Number(written.rowsAffected) === 0) throw new Error("not found");
}

export async function delete_project(env: EnvGetter, id: number) {
    const client = write_client(env);
    const written = await client.execute({
        sql: `DELETE FROM Project WHERE id = ?`,
        args: [id],
    });
    if (Number(written.rowsAffected) === 0) throw new Error("not found");
}
