import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { ProjectDetail } from "~/components/project/project_detail";
import { one_project } from "~/server/db/projects";

export const use_preview_project = routeLoader$(async (event) => {
    const project = await one_project(event.env, event.params.project_id, true);
    if (project.found === "none") {
        event.status(404);
    }
    return project;
});

export default component$(() => {
    const project = use_preview_project();
    return <ProjectDetail project={project.value} home_href="/admin/preview" list_href="/admin/preview/projects" />;
});

export const head: DocumentHead = ({ resolveValue }) => {
    const project = resolveValue(use_preview_project);
    const title = project.found === "some" ? project.value.title : "Project not found";
    return { title };
};
