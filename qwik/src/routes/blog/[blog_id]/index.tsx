import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead, type StaticGenerateHandler } from "@builder.io/qwik-city";
import { BlogPost } from "~/components/blog/blog_post";
import { list_blogs, one_blog } from "~/server/db/blogs";

export const use_blog = routeLoader$(async (event) => {
    const post = await one_blog(event.env, event.params.blog_id);
    if (post.found === "none") {
        event.status(404);
    }
    return post;
});

export default component$(() => {
    const post = use_blog();
    return <BlogPost post={post.value} home_href="/" blog_href="/blog" />;
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
