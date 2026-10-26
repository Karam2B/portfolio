import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { BlogFrame } from "~/components/blog/blog_frame";
import { InlineLink } from "~/components/ui/inline_link";
import { use_local_admin_token } from "~/hooks/use_local_admin_token";
import { format_date } from "~/lib/format_date";
import { list_blogs } from "~/server/db/blogs";

export const use_blogs = routeLoader$(async (event) => {
    return await list_blogs(event.env);
});

export default component$(() => {
    const blogs = use_blogs();
    const can_mutate = use_local_admin_token();
    return (
        <BlogFrame>
            <h1 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, margin: "0 0 0.5rem" }}>Blog</h1>
            <p style={{ margin: "0 0 1.5rem", opacity: 0.75 }}>Notes and writeups. Posts are markdown.</p>
            {blogs.value.length === 0 ? (
                <p style={{ margin: 0 }}>
                    No posts yet.
                    {can_mutate.value && (
                        <>
                            {" "}
                            <InlineLink href="/admin/blog/new">Write the first one</InlineLink>
                        </>
                    )}
                </p>
            ) : (
                <div>
                    {blogs.value.map((post) => (
                        <article key={post.id} style={{ padding: "1rem 0", borderTop: "1px solid currentColor" }}>
                            <InlineLink href={"/blog/" + post.snake_case_id} fontSize="1.5rem">
                                {post.title}
                            </InlineLink>
                            <p style={{ margin: "0.35rem 0 0", opacity: 0.7 }}>
                                <time>{format_date(post.created_at)}</time>
                            </p>
                            <p style={{ margin: "0.5rem 0 0" }}>{post.summary}</p>
                        </article>
                    ))}
                </div>
            )}
        </BlogFrame>
    );
});

export const head: DocumentHead = {
    title: "Blog",
    meta: [{ name: "description", content: "Karam's blog" }],
};
