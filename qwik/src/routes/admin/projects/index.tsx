import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { InlineLink } from "~/utils/components";
import { use_server_projects_2 } from "~/utils/endpoint_2";

export const use_admin_projects = routeLoader$(async (event) => {
    return await use_server_projects_2(event, true);
});

export default component$(() => {
    const projects = use_admin_projects();
    return (
        <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: "0 0 1rem" }}>Projects</h1>
            {projects.value.length === 0 ? (
                <p style={{ margin: 0 }}>No projects yet.</p>
            ) : (
                projects.value.map((project) => (
                    <div key={project.id} style={{ padding: "0.75rem 0", borderTop: "1px solid currentColor" }}>
                        <InlineLink href={"/admin/projects/" + project.id}>{project.title}{project.published ? "" : " (hidden)"}</InlineLink>
                    </div>
                ))
            )}
        </div>
    );
});

export const head: DocumentHead = { title: "Projects" };
