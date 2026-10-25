import { component$, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { MoChevronRight } from "@qwikest/icons/monoicons";
import { DateTime } from "luxon";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { DisplayImage, InlineA } from "~/utils/components";
import { one_project_2 } from "~/utils/endpoint_2";
import { get_marked_engine, Marked } from "~/utils/marked_down";

export const use_preview_project = routeLoader$(async (event) => {
    const project = await one_project_2(event, event.params.project_id);
    if (project.found === "none") {
        event.status(404);
    }
    return project;
});

export default component$(() => {
    const project = use_preview_project();
    const tokens = useComputed$(() => {
        const content = project.value.found === "some" ? project.value.value.content : "";
        return get_marked_engine().lexer(content.replace(/\\n/g, "\n"));
    });

    if (project.value.found === "none") {
        return (
            <div style={{ width: "min(800px, 95vw)", margin: "0 auto" }}>
                <div style={{ height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "4.5rem", lineHeight: 1 }}>Project Not Found</span>
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                        <InlineA href="/preview">go home</InlineA>
                        <span>|</span>
                        <InlineA href="/preview/project">go to all project</InlineA>
                    </div>
                </div>
            </div>
        );
    }

    const value = project.value.value;
    return (
        <div style={{ width: "min(500px, 95vw)", margin: "0 auto", paddingBottom: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.75rem 0", fontSize: "1.875rem", lineHeight: "2.25rem" }}>
                <InlineA href="/preview">Preview</InlineA>
                <MoChevronRight />
                <InlineA href="/preview/project">Project</InlineA>
            </div>
            <div style={{ borderRadius: 12, paddingBottom: "1.25rem" }}>
                <DisplayImage src={value.display_picture} />
            </div>
            <h1 style={{ fontSize: "1.875rem", lineHeight: "2.25rem", fontWeight: 400, margin: 0 }}>{value.title}</h1>
            <p style={{ margin: 0, opacity: 0.7 }}>
                created at{" "}
                <time>{DateTime.fromISO(value.created_at).toFormat("LLL dd yyyy")}</time>
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
                {value.github_link && (
                    <InlineA href={value.github_link} target="_blank">
                        <Github
                            //@ts-ignore
                            height="16"
                            width="16"
                            style={{ display: "inline", fill: "currentColor", width: 16, height: 16 }}
                        />{" "}
                        View Source Code
                    </InlineA>
                )}
                {value.live_link && (
                    <InlineA href={value.live_link} target="_blank">
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
                <Marked content={tokens.value} nesting_level={0} />
            </div>
        </div>
    );
});

export const head: DocumentHead = ({ resolveValue }) => {
    const project = resolveValue(use_preview_project);
    const title = project.found === "some" ? project.value.title : "Project not found";
    return { title };
};
