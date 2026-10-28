import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { BlogPost } from "~/components/blog/blog_post";
import { one_blog } from "~/server/db/blogs";

export const use_preview_blog = routeLoader$(async (event) => {
    const post = await one_blog(event.env, event.params.blog_id, true);
    if (post.found === "none") {
        event.status(404);
    }
    return post;
});

export default component$(() => {
    const post = use_preview_blog();
    return <BlogPost post={post.value} home_href="/admin/preview" blog_href="/admin/preview/blog" />;
});

export const head: DocumentHead = ({ resolveValue }) => {
    const post = resolveValue(use_preview_blog);
    const title = post.found === "some" ? post.value.title : "Post not found";
    return { title };
};
