import { component$, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { DateTime } from "luxon";
import { one_blog } from "~/utils/blog";
import { get_marked_engine, Marked } from "~/utils/marked_down";

export const use_preview_blog = routeLoader$(async (event) => {
    const post = await one_blog(event.env, event.params.blog_id);
    if (post.found === "none") {
        event.status(404);
    }
    return post;
});

export default component$(() => {
    const post = use_preview_blog();
    const tokens = useComputed$(() => {
        const content = post.value.found === "some" ? post.value.value.content : "";
        return get_marked_engine().lexer(content.replace(/\\n/g, "\n"));
    });

    if (post.value.found === "none") {
        return (
            <div style={{ width: "min(720px, 92vw)", margin: "0 auto", padding: "1.75rem 0 4rem" }}>
                <h1 style={{ fontSize: "2.25rem", fontWeight: 400, margin: 0 }}>Post not found</h1>
            </div>
        );
    }

    const value = post.value.value;
    return (
        <div style={{ width: "min(720px, 92vw)", margin: "0 auto", padding: "1.75rem 0 4rem" }}>
            <h1 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, margin: "0 0 0.5rem" }}>{value.title}</h1>
            <p style={{ margin: "0 0 1.5rem", opacity: 0.7 }}>
                <time>{DateTime.fromISO(value.created_at).toFormat("LLL dd yyyy")}</time>
            </p>
            <p style={{ margin: "0 0 1.5rem", fontSize: "1.125rem" }}>{value.summary}</p>
            <div>
                <Marked content={tokens.value} nesting_level={0} />
            </div>
        </div>
    );
});

export const head: DocumentHead = ({ resolveValue }) => {
    const post = resolveValue(use_preview_blog);
    const title = post.found === "some" ? post.value.title : "Post not found";
    return { title };
};
