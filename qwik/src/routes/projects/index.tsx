import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { ProjectList } from "~/components/project/project_list";
import { list_projects } from "~/server/db/projects";

export const use_projects = routeLoader$(async (event) => {
    return await list_projects(event.env);
});

export default component$(() => {
    const projects = use_projects();
    return <ProjectList projects={projects.value} home_href="/" item_base="/projects" />;
});
