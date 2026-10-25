import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { use_server_projects_2 } from "~/utils/endpoint_2";
import { ProjectSummary } from "~/utils/endpoint_view";
import { MainGrid } from "~/utils/components";

export const use_preview_projects = routeLoader$(async (event) => {
    return await use_server_projects_2(event);
});

export default component$(() => {
    const projects = use_preview_projects();
    return (
        <div style={{ paddingBottom: "4rem" }}>
            <h1 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, textAlign: "center", margin: "1.75rem 0" }}>Projects</h1>
            <MainGrid>
                {projects.value.map((project) => (
                    <ProjectSummary key={project.id} data={project} href={"/preview/project/" + project.snake_case_id} />
                ))}
            </MainGrid>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Preview projects",
};
