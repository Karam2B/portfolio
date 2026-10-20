import { component$ } from "@builder.io/qwik";
import { InlineLink, MainGrid } from "~/utils/components";
import { ProjectSummary } from "~/utils/endpoint_view";
import { MoArrowLeft } from "@qwikest/icons/monoicons";
import { routeLoader$ } from "@builder.io/qwik-city";
import { use_server_projects_2 } from "~/utils/endpoint_2";

export const use_projects = routeLoader$(async (event) => {
    return await use_server_projects_2(event);
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
