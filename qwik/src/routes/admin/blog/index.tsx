import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { InlineLink } from "~/components/ui/inline_link";
import { list_blogs } from "~/server/db/blogs";

export const use_admin_blogs = routeLoader$(async (event) => {
    return await list_blogs(event.env, true);
});

export default component$(() => {
    const blogs = use_admin_blogs();
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Blogs</h1>
                <InlineLink href="/admin/blog/new">New post</InlineLink>
            </div>
            {blogs.value.length === 0 ? (
                <p style={{ margin: 0 }}>No posts yet.</p>
            ) : (
                blogs.value.map((post) => (
                    <div key={post.id} style={{ padding: "0.75rem 0", borderTop: "1px solid currentColor" }}>
                        <InlineLink href={"/admin/blog/" + post.id}>{post.title}{post.published ? "" : " (hidden)"}</InlineLink>
                    </div>
                ))
            )}
        </div>
    );
});

export const head: DocumentHead = { title: "Blogs" };
