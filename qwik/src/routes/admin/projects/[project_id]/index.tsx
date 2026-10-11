import { component$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import * as v from "valibot";
import { InlineA } from "~/utils/components";
import { is_admin } from "~/utils/blog";
import { one_project_2, project_edit_schema, update_project } from "~/utils/endpoint_2";
import { usePrefersDark } from "~/utils/inline";
import { CheckField, ContentDraft, fieldStyle, form_bool, form_field, primaryButtonStyle, save_error } from "~/utils/markdown_editor";

export const use_admin_project = routeLoader$(async (event) => {
    const project = await one_project_2(event, Number(event.params.project_id), true);
    if (project.found === "none") event.status(404);
    return project;
});

export const use_update_project = routeAction$(async (data, event) => {
    if (!is_admin(event)) return { ok: false as const, message: "Sign in to save.", published: false };
    const skills = [...new Set(form_field(data.skills).split(",").map((skill) => skill.trim()).filter(Boolean))];
    const parsed = v.safeParse(project_edit_schema, {
        title: form_field(data.title),
        summary: form_field(data.summary),
        content: form_field(data.content),
        github_link: form_field(data.github_link),
        live_link: form_field(data.live_link),
        display_picture: form_field(data.display_picture),
        created_at: form_field(data.created_at),
        display_on_home: form_bool(data.display_on_home),
        published: form_bool(data.published),
        skills,
    });
    if (!parsed.success) return { ok: false as const, message: "Add a title and a summary.", published: false };
    try {
        await update_project(event.env, Number(event.params.project_id), parsed.output);
        return {
            ok: true as const,
            message: parsed.output.published ? "Saved." : "Saved. This project is hidden from the site.",
            published: parsed.output.published,
        };
    } catch (error) {
        return { ok: false as const, message: save_error(error), published: false };
    }
});

export default component$(() => {
    const loaded = use_admin_project();
    const action = use_update_project();
    const dark = usePrefersDark();
    const project = loaded.value.found === "some" ? loaded.value.value : null;
    const title = useSignal(project?.title ?? "");
    const summary = useSignal(project?.summary ?? "");
    const github = useSignal(project?.github_link ?? "");
    const live = useSignal(project?.live_link ?? "");
    const picture = useSignal(project?.display_picture ?? "");
    const createdAt = useSignal(project?.created_at ?? "");
    const skills = useSignal(project?.skills.map((skill) => skill.title).join(", ") ?? "");

    if (!project) {
        return <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Project not found</h1>;
    }

    return (
        <Form action={action} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Edit project</h1>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Title
                <input name="title" type="text" required bind:value={title} style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Summary
                <input name="summary" type="text" required bind:value={summary} style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                GitHub link
                <input name="github_link" type="text" bind:value={github} style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Live link
                <input name="live_link" type="text" bind:value={live} style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Display picture
                <input name="display_picture" type="text" bind:value={picture} style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Created at
                <input name="created_at" type="text" required bind:value={createdAt} style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Skills
                <input name="skills" type="text" bind:value={skills} style={fieldStyle} />
            </label>
            <CheckField name="display_on_home" label="Show on the home page" checked={project.display_on_home} />
            <CheckField name="published" label="Published" checked={project.published} />
            <ContentDraft initial={project.content} />
            <button type="submit" disabled={action.isRunning} style={primaryButtonStyle(dark.value)}>
                {action.isRunning ? "Saving…" : "Save"}
            </button>
            {action.value && (
                <p style={{ margin: 0 }}>
                    {action.value.message}{" "}
                    {action.value.ok && action.value.published && <InlineA href={"/projects/" + project.id}>View project</InlineA>}
                </p>
            )}
        </Form>
    );
});

export const head: DocumentHead = { title: "Edit project" };
