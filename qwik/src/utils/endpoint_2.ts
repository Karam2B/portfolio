// Project reads and writes against Turso.
// A project has many skills, and a skill can belong to many projects.
// That link is the ProjectSkill table (project_id, skill_id).
// SELECTs LEFT JOIN through it, so one project comes back as one row per skill.
// The loops below fold those rows into one object with a skills array.
// `published` is the only visibility flag. Public queries require published = 1.

import { useSignal, useTask$ } from "@builder.io/qwik"
import { routeLoader$, server$ } from "@builder.io/qwik-city"
import { EnvGetter, RequestEventLoader } from "@builder.io/qwik-city/middleware/request-handler";
import { createClient } from "@libsql/client"
import { marked } from "marked"
import * as v from "valibot"
import sanitizeHtml from "sanitize-html"

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

// Shape returned to pages. id is a string because route params are strings.
export const project_schema = v.object({
    id: v.pipe(v.any(), v.transform((e) => String(e)), v.string(), v.nonEmpty()),
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    github_link: v.nullable(v.string()),
    display_on_home: v.pipe(v.any(), v.transform((e) => Boolean(e)), v.boolean()),
    live_link: v.nullable(v.string()),
    created_at: v.string(),
    display_picture: v.nullable(v.string()),
    published: v.boolean(),
    skills: v.array(v.object({ id: v.number(), title: v.string() }))
});

const optional_text = v.pipe(v.string(), v.trim(), v.transform((value) => value === "" ? null : value));

// Fields the admin form sends. Skills arrive as titles; update_project
// turns each title into a Skill row and a ProjectSkill link.
export const project_edit_schema = v.object({
    title: v.pipe(v.string(), v.trim(), v.minLength(1)),
    summary: v.pipe(v.string(), v.trim(), v.minLength(1)),
    content: v.string(),
    github_link: optional_text,
    live_link: optional_text,
    display_picture: optional_text,
    created_at: v.pipe(v.string(), v.trim(), v.minLength(1)),
    display_on_home: v.boolean(),
    published: v.boolean(),
    skills: v.array(v.pipe(v.string(), v.trim(), v.minLength(1))),
});

// Published project ids, used to pre-render /projects/:id.
// If the published column has not been added yet, every id is returned.
export const all_projects_ids = async function (env: EnvGetter) {
    const authToken = env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched;
    try {
        fetched = await client.execute({
            sql: `SELECT id FROM Project WHERE published = 1;`
        })
    } catch (error) {
        if (!(error instanceof Error) || !/no such column/i.test(error.message) || !/published/i.test(error.message)) throw error;
        fetched = await client.execute({
            sql: `SELECT id FROM Project;`
        })
    }

    let retu = v.parse(v.array(v.object({ id: v.number() })), fetched.rows);

    return retu
}

// One project, including its markdown body.
// admin skips the published filter so a hidden project can still be edited.
export const one_project_2 = async function (event: RequestEventLoader, id: number, admin = false) {
    const authToken = event.env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = event.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    const columns = `
            p.id AS p_id,
            p.title AS p_title,
            p.summary AS p_summary,
            p.github_link AS p_github_link,
            p.display_on_home AS p_display_on_home,
            p.live_link AS p_live_link,
            p.created_at AS p_created_at,
            p.content AS p_content,
            p.display_picture AS p_display_picture,
            s.id AS s_id,
            s.title AS s_title
    `;
    let fetched;
    // ProjectSkill is the many-to-many table. LEFT JOIN keeps a project that
    // has no skills (skill columns come back null). Three skills means three
    // rows that repeat the same p_* columns.
    try {
        fetched = await client.execute({
            sql: `
        SELECT ${columns},
            p.published AS p_published
        FROM Project p
        LEFT JOIN ProjectSkill ps ON ps.project_id = p.id
        LEFT JOIN Skill s ON ps.skill_id = s.id
        ${admin ? "WHERE p.id = ?" : "WHERE p.published = 1 AND p.id = ?"};
`, args: [id]
        })
    } catch (error) {
        // A read that runs before the first admin save may not have published yet.
        // Treat every matching project as published in that case.
        if (!(error instanceof Error) || !/no such column/i.test(error.message) || !/published/i.test(error.message)) throw error;
        fetched = await client.execute({
            sql: `
        SELECT ${columns}
        FROM Project p
        LEFT JOIN ProjectSkill ps ON ps.project_id = p.id
        LEFT JOIN Skill s ON ps.skill_id = s.id
        WHERE p.id = ?;
`, args: [id]
        })
    }

    let result = v_parse(v.array(
        v.object({
            p_id: v.number(),
            p_title: v.string(),
            p_summary: v.string(),
            p_github_link: v.nullable(v.string()),
            p_live_link: v.nullable(v.string()),
            p_display_on_home: v.pipe(v.any(), v.transform((e) => Boolean(e)), v.boolean()),
            p_created_at: v.string(),
            p_content: v.string(),
            p_display_picture: v.nullable(v.string()),
            p_published: v.nullish(v.any()),
            s_id: v.nullable(v.number()),
            s_title: v.nullable(v.string()), // null when the LEFT JOIN finds no skill
        })
    ), fetched.rows);

    let result2 = new Map<number, { id: number } & Omit<v.InferOutput<typeof project_schema>, "id">>()
    // Missing published (fallback query above) means the column is not there yet.
    const published_of = (row: { p_published?: unknown }) => row.p_published == null ? true : sqlite_bool(row.p_published);


    // Resolve the many-to-many: the first row for a p_id creates the project,
    // and each later row for that same id only appends another skill.
    for (const each of result) {
        let value = result2.get(each.p_id);
        if (value) {
            let skills = value.skills;
            if (each.s_id) {
                if (!each.s_title) throw new Error("bug in schema")
                skills.push({ id: each.s_id, title: each.s_title })
            }
            result2.set(each.p_id, {
                id: value.id,
                title: value.title,
                summary: value.summary,
                display_on_home: value.display_on_home,
                github_link: value.github_link,
                live_link: value.live_link,
                content: value.content,
                created_at: value.created_at,
                display_picture: value.display_picture,
                published: value.published,
                skills
            })
        } else {
            let skills = [];
            if (each.s_id) {
                if (!each.s_title) throw new Error("bug in schema")
                skills.push({ id: each.s_id, title: each.s_title })
            }
            result2.set(each.p_id, {
                id: each.p_id,
                title: each.p_title,
                summary: each.p_summary,
                github_link: each.p_github_link,
                display_on_home: each.p_display_on_home,
                live_link: each.p_live_link,
                created_at: each.p_created_at,
                content: each.p_content,
                display_picture: each.p_display_picture,
                published: published_of(each),
                skills
            })
        }
    }

    if (result2.size === 0) {
        return { found: "none" as const }
    }
    // The WHERE is on the primary key, so the map should hold one project.
    if (result2.size > 1) {
        throw new Error("bug: id didn't work as unique, len" + result.length)
    }

    let project = Array.from(result2.values())[0];

    return { found: "some" as const, value: v_parse(project_schema, project) }
}

// Every project for the home page and /projects, without the markdown body.
// Same ProjectSkill join and fold as one_project_2. admin includes unpublished rows.
export const use_server_projects_2 = async function (event: RequestEventLoader, admin = false) {
    const authToken = event.env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = event.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    const columns = `
            p.id AS p_id,
            p.title AS p_title,
            p.summary AS p_summary,
            p.github_link AS p_github_link,
            p.display_on_home AS p_display_on_home,
            p.live_link AS p_live_link,
            p.created_at AS p_created_at,
            p.display_picture AS p_display_picture,
            s.id AS s_id,
            s.title AS s_title
    `;
    let fetched;
    try {
        fetched = await client.execute({
            sql: `
        SELECT ${columns},
            p.published AS p_published
        FROM Project p
        LEFT JOIN ProjectSkill ps ON ps.project_id = p.id
        LEFT JOIN Skill s ON ps.skill_id = s.id
        ${admin ? "" : "WHERE p.published = 1"};
`
        })
    } catch (error) {
        // Same missing-column fallback as one_project_2.
        if (!(error instanceof Error) || !/no such column/i.test(error.message) || !/published/i.test(error.message)) throw error;
        fetched = await client.execute({
            sql: `
        SELECT ${columns}
        FROM Project p
        LEFT JOIN ProjectSkill ps ON ps.project_id = p.id
        LEFT JOIN Skill s ON ps.skill_id = s.id
`
        })
    }

    let result = v_parse(v.array(
        v.object({
            p_id: v.number(),
            p_title: v.string(),
            p_summary: v.string(),
            p_github_link: v.nullable(v.string()),
            p_live_link: v.nullable(v.string()),
            p_display_on_home: v.pipe(v.any(), v.transform((e) => Boolean(e)), v.boolean()),
            p_created_at: v.string(),
            p_display_picture: v.nullable(v.string()),
            p_published: v.nullish(v.any()),
            s_id: v.nullable(v.number()),
            s_title: v.nullable(v.string()), // null when the LEFT JOIN finds no skill
        })
    ), fetched.rows);

    let result2 = new Map<number, { id: number } & Omit<v.InferOutput<typeof project_schema>, "id" | "content">>()
    const published_of = (row: { p_published?: unknown }) => row.p_published == null ? true : sqlite_bool(row.p_published);

    // Same fold as one_project_2: one map entry per project, skills collected from the extra join rows.
    for (const each of result) {
        let value = result2.get(each.p_id);
        if (value) {
            let skills = value.skills;
            if (each.s_id) {
                if (!each.s_title) throw new Error("bug in schema")
                skills.push({ id: each.s_id, title: each.s_title })
            }
            result2.set(each.p_id, {
                id: value.id,
                title: value.title,
                summary: value.summary,
                display_on_home: value.display_on_home,
                github_link: value.github_link,
                live_link: value.live_link,
                created_at: value.created_at,
                display_picture: value.display_picture,
                published: value.published,
                skills
            })
        } else {
            let skills = [];
            if (each.s_id) {
                if (!each.s_title) throw new Error("bug in schema")
                skills.push({ id: each.s_id, title: each.s_title })
            }
            result2.set(each.p_id, {
                id: each.p_id,
                title: each.p_title,
                summary: each.p_summary,
                github_link: each.p_github_link,
                display_on_home: each.p_display_on_home,
                live_link: each.p_live_link,
                created_at: each.p_created_at,
                display_picture: each.p_display_picture,
                published: published_of(each),
                skills
            })
        }
    }

    // Row count is higher than the project count whenever a project has more than one skill.
    console.log("fetched project with count (may duplicate): ", fetched.rows.length);

    return v_parse(v.array(v.object({
        id: v.pipe(v.any(), v.transform((e) => String(e)), v.string()),
        title: project_schema.entries.title,
        summary: project_schema.entries.summary,
        github_link: project_schema.entries.github_link,
        display_on_home: project_schema.entries.display_on_home,
        live_link: project_schema.entries.live_link,
        created_at: project_schema.entries.created_at,
        display_picture: project_schema.entries.display_picture,
        published: project_schema.entries.published,
        skills: project_schema.entries.skills,
    })), Array.from(result2.values()))
}

// Writes a project and replaces its skill links.
// SQLite has no ADD COLUMN IF NOT EXISTS here, so a duplicate-column error means published already exists.
export async function update_project(env: EnvGetter, id: number, input: v.InferOutput<typeof project_edit_schema>) {
    const url = env.get("TURSO_DATABASE_URL");
    const authToken = env.get("TURSO_AUTH_TOKEN_FULL_ACCESS");
    if (!url || !authToken) throw new Error("database is not configured");
    const client = createClient({ url, authToken });
    try {
        await client.execute(`ALTER TABLE Project ADD COLUMN published INTEGER NOT NULL DEFAULT 1`);
    } catch (error) {
        if (!(error instanceof Error) || !/duplicate column/i.test(error.message)) throw error;
    }
    const written = await client.execute({
        sql: `
            UPDATE Project SET
                title = ?,
                summary = ?,
                content = ?,
                github_link = ?,
                live_link = ?,
                display_picture = ?,
                display_on_home = ?,
                created_at = ?,
                published = ?
            WHERE id = ?
        `,
        args: [
            input.title,
            input.summary,
            input.content,
            input.github_link,
            input.live_link,
            input.display_picture,
            input.display_on_home ? 1 : 0,
            input.created_at,
            input.published ? 1 : 0,
            id,
        ],
    });
    if (Number(written.rowsAffected) === 0) throw new Error("not found");

    // Replace the many-to-many links for this project. Reuse a Skill row when the title already exists.
    await client.execute({ sql: `DELETE FROM ProjectSkill WHERE project_id = ?`, args: [id] });
    for (const title of input.skills) {
        const found = await client.execute({ sql: `SELECT id FROM Skill WHERE title = ?`, args: [title] });
        const existing = found.rows[0]?.id;
        const skillId = existing == null
            ? Number((await client.execute({ sql: `INSERT INTO Skill (title) VALUES (?)`, args: [title] })).lastInsertRowid)
            : Number(existing);
        await client.execute({
            sql: `INSERT INTO ProjectSkill (project_id, skill_id) VALUES (?, ?)`,
            args: [id, skillId],
        });
    }
}

