/**
 * Blog post layout shared by `/blog/:id` and `/admin/preview/blog/:id`.
 */

import { component$, useComputed$ } from "@builder.io/qwik";
import { BlogFrame } from "~/components/blog/blog_frame";
import { lex_markdown } from "~/components/markdown/engine";
import { Marked } from "~/components/markdown/marked";
import { format_date } from "~/lib/format_date";
import type { BlogPost as BlogPostData } from "~/server/db/blogs";

export type LoadedBlog =
    | { found: "none" }
    | { found: "some"; value: BlogPostData };

export const BlogPost = component$((props: {
    post: LoadedBlog;
    home_href: string;
    blog_href: string;
}) => {
    const tokens = useComputed$(() => {
        const content = props.post.found === "some" ? props.post.value.content : "";
        return lex_markdown(content);
    });

    if (props.post.found === "none") {
        return (
            <BlogFrame home_href={props.home_href} blog_href={props.blog_href}>
                <h1 style={{ fontSize: "2.25rem", fontWeight: 400, margin: 0 }}>Post not found</h1>
            </BlogFrame>
        );
    }

    const value = props.post.value;
    return (
        <BlogFrame home_href={props.home_href} blog_href={props.blog_href}>
            <h1 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, margin: "0 0 0.5rem" }}>{value.title}</h1>
            <p style={{ margin: "0 0 1.5rem", opacity: 0.7 }}>
                <time>{format_date(value.created_at)}</time>
            </p>
            <p style={{ margin: "0 0 1.5rem", fontSize: "1.125rem" }}>{value.summary}</p>
            <div>
                <Marked content={tokens.value} nesting_level={0} />
            </div>
        </BlogFrame>
    );
});
