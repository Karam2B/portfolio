import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, type DocumentHead } from "@builder.io/qwik-city";
import * as v from "valibot";
import { is_admin } from "~/utils/blog";
import { InlineA } from "~/utils/components";
import { create_project, project_create_schema } from "~/utils/endpoint_2";
import { CheckField, ContentDraft, fieldStyle, form_bool, form_field, PrimaryButton, save_error } from "~/utils/markdown_editor";

export const use_create_project = routeAction$(async (data, event) => {
    if (!is_admin(event)) {
        return { ok: false as const, message: "Sign in to create.", id: "", snake_case_id: "", published: false };
    }
    const parsed = v.safeParse(project_create_schema, {
        snake_case_id: form_field(data.snake_case_id),
        title: form_field(data.title),
        summary: form_field(data.summary),
        content: form_field(data.content),
        github_link: form_field(data.github_link),
        live_link: form_field(data.live_link),
        display_picture: form_field(data.display_picture),
        display_on_home: form_bool(data.display_on_home),
        published: form_bool(data.published),
        skills: form_field(data.skills),
    });
    if (!parsed.success) {
        return { ok: false as const, message: "Add a snake_case_id, title, and summary.", id: "", snake_case_id: "", published: false };
    }
    try {
        const created = await create_project(event.env, parsed.output);
        return {
            ok: true as const,
            message: parsed.output.published ? "Created." : "Created. This project is hidden from the site.",
            id: created.id,
            snake_case_id: created.snake_case_id,
            published: parsed.output.published,
        };
    } catch (error) {
        return { ok: false as const, message: save_error(error, "create"), id: "", snake_case_id: "", published: false };
    }
});

export default component$(() => {
    const action = use_create_project();

    return (
        <Form action={action} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>New project</h1>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                snake_case_id
                <input name="snake_case_id" type="text" required placeholder="my_cool_project" style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Title
                <input name="title" type="text" required style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Summary
                <input name="summary" type="text" required style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                GitHub link
                <input name="github_link" type="text" style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Live link
                <input name="live_link" type="text" style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Display picture
                <input name="display_picture" type="text" style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Skills
                <input name="skills" type="text" placeholder="React, Qwik, Rust" style={fieldStyle} />
            </label>
            <CheckField name="display_on_home" label="Show on the home page" checked={false} />
            <CheckField name="published" label="Published" checked={true} />
            <ContentDraft initial="" />
            <PrimaryButton type="submit" disabled={action.isRunning}>
                {action.isRunning ? "Creating…" : "Create"}
            </PrimaryButton>
            {action.value && (
                <p style={{ margin: 0 }}>
                    {action.value.message}{" "}
                    {action.value.ok && (
                        <>
                            <InlineA href={"/admin/projects/" + action.value.id}>Edit</InlineA>
                            {action.value.published && (
                                <>
                                    {" · "}
                                    <InlineA href={"/projects/" + action.value.snake_case_id}>View</InlineA>
                                </>
                            )}
                        </>
                    )}
                </p>
            )}
        </Form>
    );
});

export const head: DocumentHead = { title: "New project" };
