import { useSignal, useTask$ } from "@builder.io/qwik"
import { server$, useLocation, useNavigate } from "@builder.io/qwik-city"
import { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
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
    id: v.number(),
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    github_link: v.nullable(v.string()),
    live_link: v.nullable(v.string()),
    created_at: v.string(),
    display_picture: v.nullable(v.string()),
    skills: v.array(v.object({ id: v.number(), title: v.string() }))
});

export const server_one_project = server$(async function(id: number) {
    const authToken = this.env.get("TURSO_AUTH_TOKEN")
    const url = this.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched = await client.execute({
        sql: `
        SELECT 
            p.id as p_id,
            p.title as p_title,
            p.content as p_content,
            p.summary as p_summary,
            p.github_link as p_github_link,
            p.live_link as p_live_link,
            p.created_at as p_created_at,
            p.display_picture as p_display_picture
        FROM Project p
        LEFT JOIN ProjectSkill ps ON ps.project_id = p.id
        LEFT JOIN Skill s ON ps.skill_id = s.id
        WHERE p_id = ?;
        `,
        args: [id]
    })

    let result = v_parse(v.array(
        v.object({
            p_id: v.number(),
            p_title: v.string(),
            p_content: v.string(),
            p_summary: v.string(),
            p_github_link: v.nullable(v.string()),
            p_live_link: v.nullable(v.string()),
            p_created_at: v.string(),
            p_display_picture: v.nullable(v.string()),

            s_id: v.optional(v.number()),
            s_title: v.optional(v.string()),// optional just like id
        })
    ), fetched.rows);

    if (fetched.rows.length === 0) {
        return { found: "none" as const }
    }

    let base = {
        id: result[0].p_id,
        title: result[0].p_title,
        content: result[0].p_content,
        summary: result[0].p_summary,
        github_link: result[0].p_github_link,
        live_link: result[0].p_live_link,
        created_at: result[0].p_created_at,
        display_picture: result[0].p_display_picture,
        skills: [] as any
    }

    for (const each of result) {
        if (each.s_id && (!each.s_title)) throw new Error("bug in schema")
        if (each.s_id) {
            base.skills.push({ id: each.s_id, title: each.s_title })
        }
    }
    console.log("fetched project of id: ", base.id);

    base.content = sanitizeHtml(await marked.use({ gfm: true, breaks: true }).parse(base.content), {
        allowedTags: ['img', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'li', 'ol', 'p', 'pre', 'ul', 'br', 'em', 'i', 'kbd', 'caption', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'],
        allowedAttributes: {
            a: ['href', 'name', 'target'],
            img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading']
        },
    })

    return {
        found: "some" as const, value: v_parse(project_schema, base)
    }
})

export const use_one_project = (id: number) => {
    const signal = useSignal<Awaited<ReturnType<typeof server_one_project>>>()
    useTask$(async () => {
        const from_server = await server_one_project(id);
        signal.value = from_server
    })

    return signal
}

const server_projects = server$(async function() {
    const authToken = this.env.get("TURSO_AUTH_TOKEN")
    const url = this.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched = await client.execute({
        sql: `
        SELECT 
            p.id as p_id,
            p.title as p_title,
            p.content as p_content,
            p.summary as p_summary,
            p.github_link as p_github_link,
            p.live_link as p_live_link,
            p.created_at as p_created_at,
            p.display_picture as p_display_picture
        FROM Project p
        LEFT JOIN ProjectSkill ps ON ps.project_id = p.id
        LEFT JOIN Skill s ON ps.skill_id = s.id;
` })

    let result = v_parse(v.array(
        v.object({
            p_id: v.number(),
            p_title: v.string(),
            p_content: v.string(),
            p_summary: v.string(),
            p_github_link: v.nullable(v.string()),
            p_live_link: v.nullable(v.string()),
            p_created_at: v.string(),
            p_display_picture: v.nullable(v.string()),

            s_id: v.optional(v.number()),
            s_title: v.optional(v.string()),// optional just like id
        })
    ), fetched.rows);

    let result2 = new Map<number, v.InferOutput<typeof project_schema>>()

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
                content: value.content,
                summary: value.summary,
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
                content: each.p_content,
                summary: each.p_summary,
                github_link: each.p_github_link,
                live_link: each.p_live_link,
                created_at: each.p_created_at,
                display_picture: each.p_display_picture,
                skills
            })
        }

    }
    console.log("fetched project with count (may duplicate): ", fetched.rows.length);

    return v_parse(v.array(project_schema), Array.from(result2.values()))
})

export const use_projects = () => {
    const signal = useSignal<Awaited<ReturnType<typeof server_projects>>>()
    useTask$(async () => {
        const from_server = await server_projects();

        signal.value = from_server
    })

    return signal
}

export const all_projects_ids = async (env: EnvGetter) => {
    const authToken = env.get("TURSO_AUTH_TOKEN")
    const url = env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    let client = createClient({ url, authToken })

    let fetched = await client.execute({
        sql: `SELECT id as project_id FROM Project`,
    });

    let schema = v.array(v.object({ project_id: v.pipe(v.number(), v.transform((old) => String(old))) }))

    return v.parse(schema, fetched.rows)
}
