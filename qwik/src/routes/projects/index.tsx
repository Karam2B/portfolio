import { component$ } from "@builder.io/qwik";
import { MoArrowLeft } from "@qwikest/icons/monoicons";
import { routeLoader$ } from "@builder.io/qwik-city";
import { MainGrid } from "~/components/layout/main_grid";
import { ProjectSummary } from "~/components/project/project_card";
import { InlineLink } from "~/components/ui/inline_link";
import { list_projects } from "~/server/db/projects";

export const use_projects = routeLoader$(async (event) => {
    return await list_projects(event.env);
});

export default component$(() => {
    const projects = use_projects();
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "min(800px, 90vw)", margin: "0 auto", padding: "1.75rem 0", fontSize: "1.875rem", lineHeight: "2.25rem" }}>
                <InlineLink href="/">
                    <MoArrowLeft />
                </InlineLink>
                <InlineLink href="/">
                    <span>Go Home</span>
                </InlineLink>
            </div>
            <MainGrid>
                {projects.value.map((p) => {
                    return <ProjectSummary key={p.id} data={p} />;
                })}
            </MainGrid>
        </div>
    );
});
