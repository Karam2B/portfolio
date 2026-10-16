import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { DateTime } from "luxon";
import { list_blogs } from "~/utils/blog";
import { InlineLink } from "~/utils/components";

export const use_preview_blogs = routeLoader$(async (event) => {
    return await list_blogs(event.env);
});

export default component$(() => {
    const blogs = use_preview_blogs();
    return (
        <div style={{ width: "min(720px, 92vw)", margin: "0 auto", padding: "1.75rem 0 4rem" }}>
            <h1 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, margin: "0 0 0.5rem" }}>Blog</h1>
            {blogs.value.length === 0 ? (
                <p style={{ margin: 0 }}>No published posts.</p>
            ) : (
                <div>
                    {blogs.value.map((post) => (
                        <article key={post.id} style={{ padding: "1rem 0", borderTop: "1px solid currentColor" }}>
                            <InlineLink href={"/preview/blog/" + post.id} fontSize="1.5rem">
                                {post.title}
                            </InlineLink>
                            <p style={{ margin: "0.35rem 0 0", opacity: 0.7 }}>
                                <time>{DateTime.fromISO(post.created_at).toFormat("LLL dd yyyy")}</time>
                            </p>
                            <p style={{ margin: "0.5rem 0 0" }}>{post.summary}</p>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
});

export const head: DocumentHead = {
    title: "Preview blog",
};
