import { component$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import * as v from "valibot";
import { delete_blog, edit_blog_schema, is_admin, one_blog, update_blog } from "~/utils/blog";
import { InlineA } from "~/utils/components";
import { CheckField, ContentDraft, fieldStyle, form_bool, form_field, PrimaryButton, save_error } from "~/utils/markdown_editor";

export const use_admin_blog = routeLoader$(async (event) => {
    const post = await one_blog(event.env, event.params.blog_id, true);
    if (post.found === "none") event.status(404);
    return post;
});

export const use_update_blog = routeAction$(async (data, event) => {
    if (!is_admin(event)) return { ok: false as const, message: "Sign in to save.", published: false };
    const parsed = v.safeParse(edit_blog_schema, {
        snake_case_id: form_field(data.snake_case_id),
        title: form_field(data.title),
        summary: form_field(data.summary),
        content: form_field(data.content),
        created_at: form_field(data.created_at),
        published: form_bool(data.published),
    });
    if (!parsed.success) return { ok: false as const, message: "Add a snake_case_id, title, summary, and the post.", published: false };
    try {
        await update_blog(event.env, Number(event.params.blog_id), parsed.output);
        return { ok: true as const, message: parsed.output.published ? "Saved." : "Saved. This post is hidden from the site.", published: parsed.output.published, snake_case_id: parsed.output.snake_case_id };
    } catch (error) {
        return { ok: false as const, message: save_error(error), published: false, snake_case_id: "" };
    }
});

export const use_delete_blog = routeAction$(async (_data, event) => {
    if (!is_admin(event)) return { ok: false as const, message: "Sign in to delete." };
    try {
        await delete_blog(event.env, Number(event.params.blog_id));
    } catch (error) {
        return { ok: false as const, message: save_error(error, "delete") };
    }
    throw event.redirect(302, "/admin/blog");
});

export default component$(() => {
    const loaded = use_admin_blog();
    const action = use_update_blog();
    const remove = use_delete_blog();
    const post = loaded.value.found === "some" ? loaded.value.value : null;
    const snakeCaseId = useSignal(post?.snake_case_id ?? "");
    const title = useSignal(post?.title ?? "");
    const summary = useSignal(post?.summary ?? "");
    const createdAt = useSignal(post?.created_at ?? "");

    if (!post) {
        return <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Post not found</h1>;
    }

    const viewSlug = action.value?.ok && action.value.snake_case_id ? action.value.snake_case_id : post.snake_case_id;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Form action={action} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Edit post</h1>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    snake_case_id
                    <input name="snake_case_id" type="text" required bind:value={snakeCaseId} style={fieldStyle} />
                </label>
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
                <p style={{ margin: 0, opacity: 0.7 }}>Updated at {post.updated_at}</p>
                <CheckField name="published" label="Published" checked={post.published} />
                <ContentDraft initial={post.content} />
                <PrimaryButton type="submit" disabled={action.isRunning}>
                    {action.isRunning ? "Saving…" : "Save"}
                </PrimaryButton>
                {action.value && (
                    <p style={{ margin: 0 }}>
                        {action.value.message}{" "}
                        {action.value.ok && action.value.published && <InlineA href={"/blog/" + viewSlug}>View post</InlineA>}
                    </p>
                )}
            </Form>

            <Form action={remove} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <PrimaryButton type="submit" danger disabled={remove.isRunning}>
                    {remove.isRunning ? "Deleting…" : "Delete post"}
                </PrimaryButton>
                {remove.value && !remove.value.ok && <p style={{ margin: 0 }}>{remove.value.message}</p>}
            </Form>
        </div>
    );
});

export const head: DocumentHead = { title: "Edit post" };
