import { Slot, component$ } from "@builder.io/qwik";
import { InlineLink } from "./components";

export const BlogFrame = component$(() => {
    return (
        <div style={{ width: "min(720px, 92vw)", margin: "0 auto", padding: "1.75rem 0 4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <InlineLink href="/">Home</InlineLink>
                    <InlineLink href="/blog">Blog</InlineLink>
                </div>
                <InlineLink href="/admin/blog/new">New post</InlineLink>
            </div>
            <Slot />
        </div>
    );
});
