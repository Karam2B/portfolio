import { component$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import * as v from "valibot";
import { edit_blog_schema, is_admin, one_blog, update_blog } from "~/utils/blog";
import { InlineA } from "~/utils/components";
import { usePrefersDark } from "~/utils/inline";
import { CheckField, ContentDraft, fieldStyle, form_bool, form_field, primaryButtonStyle, save_error } from "~/utils/markdown_editor";

export const use_admin_blog = routeLoader$(async (event) => {
    const post = await one_blog(event.env, Number(event.params.blog_id), true);
    if (post.found === "none") event.status(404);
    return post;
});

export const use_update_blog = routeAction$(async (data, event) => {
    if (!is_admin(event)) return { ok: false as const, message: "Sign in to save." };
    const parsed = v.safeParse(edit_blog_schema, {
        title: form_field(data.title),
        summary: form_field(data.summary),
        content: form_field(data.content),
        created_at: form_field(data.created_at),
        published: form_bool(data.published),
    });
    if (!parsed.success) return { ok: false as const, message: "Add a title, a short summary, and the post." };
    try {
        await update_blog(event.env, Number(event.params.blog_id), parsed.output);
        return { ok: true as const, message: parsed.output.published ? "Saved." : "Saved. This post is hidden from the site.", published: parsed.output.published };
    } catch (error) {
        return { ok: false as const, message: save_error(error), published: false };
    }
});

export default component$(() => {
    const loaded = use_admin_blog();
    const action = use_update_blog();
    const dark = usePrefersDark();
    const post = loaded.value.found === "some" ? loaded.value.value : null;
    const title = useSignal(post?.title ?? "");
    const summary = useSignal(post?.summary ?? "");
    const createdAt = useSignal(post?.created_at ?? "");

    if (!post) {
        return <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Post not found</h1>;
    }

    return (
        <Form action={action} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Edit post</h1>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Title
                <input name="title" type="text" required bind:value={title} style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Summary
                <input name="summary" type="text" required bind:value={summary} style={fieldStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Created at
                <input name="created_at" type="text" required bind:value={createdAt} style={fieldStyle} />
            </label>
            <CheckField name="published" label="Published" checked={post.published} />
            <ContentDraft initial={post.content} />
            <button type="submit" disabled={action.isRunning} style={primaryButtonStyle(dark.value)}>
                {action.isRunning ? "Saving…" : "Save"}
            </button>
            {action.value && (
                <p style={{ margin: 0 }}>
                    {action.value.message}{" "}
                    {action.value.ok && action.value.published && <InlineA href={"/blog/" + post.id}>View post</InlineA>}
                </p>
            )}
        </Form>
    );
});

export const head: DocumentHead = { title: "Edit post" };
