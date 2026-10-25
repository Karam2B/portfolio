import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, type DocumentHead } from "@builder.io/qwik-city";
import * as v from "valibot";
import { create_blog, create_blog_schema, is_admin } from "~/utils/blog";
import { InlineA } from "~/utils/components";
import { CheckField, ContentDraft, fieldStyle, form_bool, form_field, PrimaryButton, save_error } from "~/utils/markdown_editor";

export const use_create_blog = routeAction$(async (data, event) => {
    if (!is_admin(event)) {
        return { ok: false as const, message: "Sign in to publish.", id: "", snake_case_id: "", published: false };
    }
    const parsed = v.safeParse(create_blog_schema, {
        snake_case_id: form_field(data.snake_case_id),
        title: form_field(data.title),
        summary: form_field(data.summary),
        content: form_field(data.content),
        published: form_bool(data.published),
    });
    if (!parsed.success) {
        return { ok: false as const, message: "Add a snake_case_id, title, summary, and the post.", id: "", snake_case_id: "", published: false };
    }
    try {
        const created = await create_blog(event.env, parsed.output);
        return {
            ok: true as const,
            message: parsed.output.published ? "Saved." : "Saved. This post is hidden from the site.",
            id: created.id,
            snake_case_id: created.snake_case_id,
            published: parsed.output.published,
        };
    } catch (error) {
        return { ok: false as const, message: save_error(error), id: "", snake_case_id: "", published: false };
    }
});

export default component$(() => {
    const action = use_create_blog();

    return (
        <Form action={action} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>New post</h1>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                snake_case_id
                <input name="snake_case_id" type="text" required placeholder="my_first_post" style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Title
                <input name="title" type="text" required style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Summary
                <input name="summary" type="text" required style={fieldStyle} />
            </label>
            <CheckField name="published" label="Published" checked={true} />
            <ContentDraft initial="" />
            <PrimaryButton type="submit" disabled={action.isRunning}>
                {action.isRunning ? "Publishing…" : "Publish"}
            </PrimaryButton>
            {action.value && (
                <p style={{ margin: 0 }}>
                    {action.value.message}{" "}
                    {action.value.ok && action.value.published && (
                        <InlineA href={"/blog/" + action.value.snake_case_id}>View post</InlineA>
                    )}
                </p>
            )}
        </Form>
    );
});

export const head: DocumentHead = { title: "New post" };
