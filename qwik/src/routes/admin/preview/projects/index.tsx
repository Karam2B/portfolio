import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { ProjectList } from "~/components/project/project_list";
import { list_projects } from "~/server/db/projects";

export const use_preview_projects = routeLoader$(async (event) => {
    return await list_projects(event.env, true);
});

export default component$(() => {
    const projects = use_preview_projects();
    return <ProjectList projects={projects.value} home_href="/admin/preview" item_base="/admin/preview/projects" />;
});

export const head: DocumentHead = {
    title: "Preview projects",
};
