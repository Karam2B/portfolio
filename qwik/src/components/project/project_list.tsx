/**
 * Project index layout shared by `/projects` and `/admin/preview/projects`.
 * Preview passes a different `home_href` / `item_base` so drafts stay in /admin/preview.
 */

import { component$ } from "@builder.io/qwik";
import { MoArrowLeft } from "@qwikest/icons/monoicons";
import { MainGrid } from "~/components/layout/main_grid";
import { ProjectSummary } from "~/components/project/project_card";
import { InlineLink } from "~/components/ui/inline_link";
import type { ProjectSummary as ProjectSummaryData } from "~/server/db/projects";

export const ProjectList = component$((props: {
    projects: ProjectSummaryData[];
    home_href: string;
    item_base: string;
}) => {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "min(800px, 90vw)", margin: "0 auto", padding: "1.75rem 0", fontSize: "1.875rem", lineHeight: "2.25rem" }}>
                <InlineLink href={props.home_href}>
                    <MoArrowLeft />
                </InlineLink>
                <InlineLink href={props.home_href}>
                    <span>Go Home</span>
                </InlineLink>
            </div>
            <MainGrid>
                {props.projects.map((project) => (
                    <ProjectSummary
                        key={project.id}
                        data={project}
                        href={props.item_base + "/" + project.snake_case_id}
                    />
                ))}
            </MainGrid>
        </div>
    );
});
