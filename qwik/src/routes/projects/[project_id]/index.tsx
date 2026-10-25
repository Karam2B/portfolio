import { component$, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, StaticGenerateHandler } from "@builder.io/qwik-city";
import { DisplayImage, InlineA } from "~/utils/components";
import { MoChevronRight } from "@qwikest/icons/monoicons";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { DateTime } from "luxon";
import { one_project_2, all_projects_ids } from "~/utils/endpoint_2";
import { get_marked_engine, Marked } from "~/utils/marked_down";

export const use_project = routeLoader$(async (event) => {
    let s = await one_project_2(event, event.params.project_id);
    if (s.found === "none") {
        event.status(404);
    }
    return s
})

export default component$(() => {
    let project = use_project();
    let parse_content = useComputed$(() => {
        let m = get_marked_engine();
        let og = "";
        if (project.value.value) og = project.value.value.content;

        return m.lexer(og.replace(/\\n/g, "\n"));
    })

    if (project.value.found === "none") {
        return <div style={{ width: "min(800px, 95vw)", margin: "0 auto" }}>
            <div style={{ height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "4.5rem", lineHeight: 1 }}>
                    Project Not Found
                </span>
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                    <InlineA href="/">go home</InlineA>
                    <span>|</span>
                    <InlineA href="/projects">go to all project</InlineA>
                </div>
            </div>
        </div>
    }


    return <div style={{ width: "min(500px, 95vw)", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.75rem 0", fontSize: "1.875rem", lineHeight: "2.25rem" }}>
            <InlineA href="/">Home</InlineA>
            <MoChevronRight />
            <InlineA href="/projects">Project</InlineA>
        </div>

        <div style={{ borderRadius: 12, paddingBottom: "1.25rem" }}>
            <DisplayImage src={project.value.value.display_picture} />
        </div>
        <h1 style={{ fontSize: "1.875rem", lineHeight: "2.25rem", fontWeight: 400, margin: 0 }}>{project.value.value.title}</h1>
        <p style={{ margin: 0, opacity: 0.7 }}>
            created at{" "}
            <time>
                {DateTime.fromISO(project.value.value.created_at).toFormat("LLL dd yyyy")}
            </time>
        </p>

        <div style={{ display: "flex", gap: "0.75rem" }}>
            {project.value.value.github_link && (
                <InlineA href={project.value.value.github_link} target="_blank">
                    <Github
                        //@ts-ignore
                        height="16"
                        width="16"
                        style={{ display: "inline", fill: "currentColor", width: 16, height: 16 }}
                    />{" "}
                    View Source Code
                </InlineA>
            )}
            {project.value.value.live_link && (
                <InlineA href={project.value.value.live_link} target="_blank">
                    <Live
                        //@ts-ignore
                        height="16"
                        width="16"
                        style={{ display: "inline", fill: "currentColor", width: 16, height: 16 }}
                    />{" "}
                    View Live Code
                </InlineA>
            )}
        </div>
        <div style={{ marginTop: "1rem" }}>
            <Marked content={parse_content.value} nesting_level={0} />
        </div>
    </div>
})



export const onStaticGenerate: StaticGenerateHandler = async function ({ env }) {
    let params = await all_projects_ids(env)
    return { params: params.map((e) => ({ project_id: e.snake_case_id })) }
}
function sanitizeHtml(arg0: any, arg1: { allowedTags: string[]; allowedAttributes: { a: string[]; img: string[]; }; }): string {
    throw new Error("Function not implemented.");
}

