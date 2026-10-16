import { component$ } from "@builder.io/qwik";
import { InlineA, InlineLink } from "~/utils/components";

export default component$(() => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Admin</h1>
            <InlineLink href="/admin/blog/new">New blog post</InlineLink>
            <InlineLink href="/admin/blog">Edit blog posts</InlineLink>
            <InlineLink href="/admin/projects">Edit project bodies</InlineLink>
            <InlineLink href="/admin/photos">Photos</InlineLink>
            <InlineA href="https://vercel.com/karam-barakats-projects/portfolio" target="_blank">Vercel Deploy</InlineA>
        </div>
    );
});
