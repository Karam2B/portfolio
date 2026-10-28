import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { BlogList } from "~/components/blog/blog_list";
import { list_blogs } from "~/server/db/blogs";

export const use_blogs = routeLoader$(async (event) => {
    return await list_blogs(event.env);
});

export default component$(() => {
    const blogs = use_blogs();
    return <BlogList posts={blogs.value} home_href="/" blog_href="/blog" item_base="/blog" />;
});

export const head: DocumentHead = {
    title: "Blog",
    meta: [{ name: "description", content: "Karam's blog" }],
};
