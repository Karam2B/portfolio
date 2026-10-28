import { component$ } from "@builder.io/qwik";
import { routeLoader$, StaticGenerateHandler } from "@builder.io/qwik-city";
import { ProjectDetail } from "~/components/project/project_detail";
import { list_projects, one_project } from "~/server/db/projects";

export const use_project = routeLoader$(async (event) => {
    const s = await one_project(event.env, event.params.project_id);
    if (s.found === "none") {
        event.status(404);
    }
    return s;
});

export default component$(() => {
    const project = use_project();
    return <ProjectDetail project={project.value} home_href="/" list_href="/projects" />;
});

export const onStaticGenerate: StaticGenerateHandler = async function ({ env }) {
    const projects = await list_projects(env);
    return { params: projects.map((project) => ({ project_id: project.snake_case_id })) };
};
