import { component$, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, StaticGenerateHandler } from "@builder.io/qwik-city";
import { MoChevronRight } from "@qwikest/icons/monoicons";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { lex_markdown } from "~/components/markdown/engine";
import { Marked } from "~/components/markdown/marked";
import { DisplayImage } from "~/components/ui/display_image";
import { InlineA } from "~/components/ui/inline_link";
import { format_date } from "~/lib/format_date";
import { list_projects, one_project } from "~/server/db/projects";

export const use_project = routeLoader$(async (event) => {
    const s = await one_project(event.env, event.params.project_id);
    if (s.found === "none") {
        event.status(404);
    }
    return s;
});

export default component$(() => {
    let project = use_project();
    const parse_content = useComputed$(() => {
        const og = project.value.value ? project.value.value.content : "";
        return lex_markdown(og);
    });

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
                {format_date(project.value.value.created_at)}
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
    const projects = await list_projects(env);
    return { params: projects.map((project) => ({ project_id: project.snake_case_id })) };
};

