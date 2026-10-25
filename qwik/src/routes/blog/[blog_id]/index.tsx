import { component$, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead, type StaticGenerateHandler } from "@builder.io/qwik-city";
import { DateTime } from "luxon";
import { list_blogs, one_blog } from "~/utils/blog";
import { BlogFrame } from "~/utils/blog_view";
import { get_marked_engine, Marked } from "~/utils/marked_down";

export const use_blog = routeLoader$(async (event) => {
    const post = await one_blog(event.env, event.params.blog_id);
    if (post.found === "none") {
        event.status(404);
    }
    return post;
});

export default component$(() => {
    const post = use_blog();
    const tokens = useComputed$(() => {
        const content = post.value.found === "some" ? post.value.value.content : "";
        return get_marked_engine().lexer(content.replace(/\\n/g, "\n"));
    });

    if (post.value.found === "none") {
        return (
            <BlogFrame>
                <h1 style={{ fontSize: "2.25rem", fontWeight: 400, margin: 0 }}>Post not found</h1>
            </BlogFrame>
        );
    }

    const value = post.value.value;
    return (
        <BlogFrame>
            <h1 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, margin: "0 0 0.5rem" }}>{value.title}</h1>
            <p style={{ margin: "0 0 1.5rem", opacity: 0.7 }}>
                <time>{DateTime.fromISO(value.created_at).toFormat("LLL dd yyyy")}</time>
            </p>
            <p style={{ margin: "0 0 1.5rem", fontSize: "1.125rem" }}>{value.summary}</p>
            <div>
                <Marked content={tokens.value} nesting_level={0} />
            </div>
        </BlogFrame>
    );
});

export const head: DocumentHead = ({ resolveValue }) => {
    const post = resolveValue(use_blog);
    const title = post.found === "some" ? post.value.title : "Post not found";
    return { title };
};

export const onStaticGenerate: StaticGenerateHandler = async ({ env }) => {
    const posts = await list_blogs(env);
    return { params: posts.map((post) => ({ blog_id: post.snake_case_id })) };
};
