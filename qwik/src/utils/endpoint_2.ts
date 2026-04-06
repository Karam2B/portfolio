import { useSignal, useTask$ } from "@builder.io/qwik"
import { routeLoader$, server$ } from "@builder.io/qwik-city"
import { EnvGetter, RequestEventLoader } from "@builder.io/qwik-city/middleware/request-handler";
import { createClient } from "@libsql/client"
import { marked } from "marked"
import * as v from "valibot"
import sanitizeHtml from "sanitize-html"

function v_parse<S extends v.GenericSchema>(schema: S, obj: unknown): v.InferOutput<S> {
    let result_ = v.safeParse(schema, obj);

    if (!result_.success) {
        let message = "invalid schema: " + result_.issues[0].message + ", path: " + JSON.stringify(result_.issues[0].path?.map((e) => e.key))
        throw new Error("valibot error: " + message)
    }

    return result_.output;
}

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
    skills: v.array(v.object({ id: v.number(), title: v.string() }))
});

export const all_projects_ids = async function (env: EnvGetter) {
    const authToken = env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched = await client.execute({
        sql: `
        SELECT id FROM Project;
        `
    })

    let retu = v.parse(v.array(v.object({ id: v.number() })), fetched.rows);

    return retu


    // throw new Error("todo: implement" + JSON.stringify({ retu, f, fetched_rows: fetched.rows }))

    // return v.parse(v.array(v.object({ id: v.string() })), fetched.rows)

}

export const one_project_2 = async function (event: RequestEventLoader, id: number, preview: boolean = false) {
    const authToken = event.env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = event.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched = await client.execute({
        sql: `
        SELECT 
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
        FROM Project p
        LEFT JOIN ProjectSkill ps ON ps.project_id = p.id
        LEFT JOIN Skill s ON ps.skill_id = s.id
        WHERE p.preview = ? AND p.id = ?;
`, args: [preview, id]
    })

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
            s_id: v.nullable(v.number()),
            s_title: v.nullable(v.string()), // optional just like id
        })
    ), fetched.rows);

    let result2 = new Map<number, { id: number } & Omit<v.InferOutput<typeof project_schema>, "id">>()


    for (const each of result) {
        let value = result2.get(each.p_id);
        // duplicate skills
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
                skills
            })
        }
    }

    if (result2.size === 0) {
        return { found: "none" as const }
    }
    if (result2.size > 1) {
        throw new Error("bug: id didn't work as unique, len" + result.length)
    }

    let project = Array.from(result2.values())[0];

    return { found: "some" as const, value: v_parse(project_schema, project) }
}

export const use_server_projects_2 = async function (event: RequestEventLoader, preview: boolean = false) {
    const authToken = event.env.get("TURSO_AUTH_TOKEN_READ_ONLY")
    const url = event.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched = await client.execute({
        sql: `
        SELECT 
            p.id AS p_id,
            p.title AS p_title,
            p.summary AS p_summary,
            p.github_link AS p_github_link,
            p.display_on_home AS p_display_on_home,
            p.live_link AS p_live_link,
            p.created_at AS p_created_at,
            p.display_picture AS p_display_picture
        FROM Project p
        LEFT JOIN ProjectSkill ps ON ps.project_id = p.id
        LEFT JOIN Skill s ON ps.skill_id = s.id
        WHERE p.preview = ?;
`, args: [preview]
    })

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
            s_id: v.optional(v.number()),
            s_title: v.optional(v.string()), // optional just like id
        })
    ), fetched.rows);

    let result2 = new Map<number, { id: number } & Omit<v.InferOutput<typeof project_schema>, "id" | "content">>()

    for (const each of result) {
        let value = result2.get(each.p_id);
        // duplicate skills
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
                skills
            })
        }
    }

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
        skills: project_schema.entries.skills,
    })), Array.from(result2.values()))
}

