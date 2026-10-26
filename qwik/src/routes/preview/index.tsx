import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { InlineLink } from "~/components/ui/inline_link";

export default component$(() => {
    return (
        <div style={{ width: "min(720px, 92vw)", margin: "0 auto", padding: "1.75rem 0 4rem" }}>
            <h1 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, margin: "0 0 0.5rem" }}>Preview</h1>
            <p style={{ margin: "0 0 1.5rem", opacity: 0.75 }}>
                Blog posts and projects, loaded from the database for this request.
            </p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
                <InlineLink href="/preview/blog" fontSize="1.5rem">Blog</InlineLink>
                <InlineLink href="/preview/project" fontSize="1.5rem">Projects</InlineLink>
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Preview",
};
