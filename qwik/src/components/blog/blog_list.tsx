/**
 * Blog index layout shared by `/blog` and `/admin/preview/blog`.
 */

import { component$ } from "@builder.io/qwik";
import { BlogFrame } from "~/components/blog/blog_frame";
import { InlineLink } from "~/components/ui/inline_link";
import { use_local_admin_token } from "~/hooks/use_local_admin_token";
import { format_date } from "~/lib/format_date";
import type { BlogSummary } from "~/server/db/blogs";

export const BlogList = component$((props: {
    posts: BlogSummary[];
    home_href: string;
    blog_href: string;
    item_base: string;
}) => {
    const can_mutate = use_local_admin_token();
    return (
        <BlogFrame home_href={props.home_href} blog_href={props.blog_href}>
            <h1 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, margin: "0 0 0.5rem" }}>Blog</h1>
            <p style={{ margin: "0 0 1.5rem", opacity: 0.75 }}>Notes and writeups.</p>
            {props.posts.length === 0 ? (
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
                    {props.posts.map((post) => (
                        <article key={post.id} style={{ padding: "1rem 0", borderTop: "1px solid currentColor" }}>
                            <InlineLink href={props.item_base + "/" + post.snake_case_id} fontSize="1.5rem">
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
