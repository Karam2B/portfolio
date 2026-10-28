import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { BlogList } from "~/components/blog/blog_list";
import { list_blogs } from "~/server/db/blogs";

export const use_preview_blogs = routeLoader$(async (event) => {
    return await list_blogs(event.env, true);
});

export default component$(() => {
    const blogs = use_preview_blogs();
    return (
        <BlogList
            posts={blogs.value}
            home_href="/admin/preview"
            blog_href="/admin/preview/blog"
            item_base="/admin/preview/blog"
        />
    );
});

export const head: DocumentHead = {
    title: "Preview blog",
};
