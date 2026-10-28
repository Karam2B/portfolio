/**
 * Project page layout shared by `/projects/:id` and `/admin/preview/projects/:id`.
 */

import { component$, useComputed$ } from "@builder.io/qwik";
import { MoChevronRight } from "@qwikest/icons/monoicons";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { lex_markdown } from "~/components/markdown/engine";
import { Marked } from "~/components/markdown/marked";
import { DisplayImage } from "~/components/ui/display_image";
import { InlineA } from "~/components/ui/inline_link";
import { format_date } from "~/lib/format_date";
import type { Project } from "~/server/db/projects";

export type LoadedProject =
    | { found: "none" }
    | { found: "some"; value: Project };

export const ProjectDetail = component$((props: {
    project: LoadedProject;
    home_href: string;
    list_href: string;
}) => {
    const tokens = useComputed$(() => {
        const content = props.project.found === "some" ? props.project.value.content : "";
        return lex_markdown(content);
    });

    if (props.project.found === "none") {
        return (
            <div style={{ width: "min(800px, 95vw)", margin: "0 auto" }}>
                <div style={{ height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "4.5rem", lineHeight: 1 }}>
                        Project Not Found
                    </span>
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                        <InlineA href={props.home_href}>go home</InlineA>
                        <span>|</span>
                        <InlineA href={props.list_href}>go to all project</InlineA>
                    </div>
                </div>
            </div>
        );
    }

    const value = props.project.value;
    return (
        <div style={{ width: "min(500px, 95vw)", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1.75rem 0", fontSize: "1.875rem", lineHeight: "2.25rem" }}>
                <InlineA href={props.home_href}>Home</InlineA>
                <MoChevronRight />
                <InlineA href={props.list_href}>Project</InlineA>
            </div>

            <div style={{ borderRadius: 12, paddingBottom: "1.25rem" }}>
                <DisplayImage src={value.display_picture} />
            </div>
            <h1 style={{ fontSize: "1.875rem", lineHeight: "2.25rem", fontWeight: 400, margin: 0 }}>{value.title}</h1>
            <p style={{ margin: 0, opacity: 0.7 }}>
                created at{" "}
                <time>
                    {format_date(value.created_at)}
                </time>
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
