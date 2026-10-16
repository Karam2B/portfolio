import { Slot, component$ } from "@builder.io/qwik";
import { type DocumentHead, type RequestHandler } from "@builder.io/qwik-city";
import { InlineLink } from "~/utils/components";

// This tree is excluded from static generation. There is no onStaticGenerate
// here, and the server adapter skips /preview/*, so each request renders now.
export const onRequest: RequestHandler = ({ cacheControl, headers }) => {
    cacheControl({
        noStore: true,
        noCache: true,
        maxAge: 0,
        sMaxAge: 0,
    });
    headers.set("X-Robots-Tag", "noindex, nofollow");
};

export const head: DocumentHead = {
    meta: [{ name: "robots", content: "noindex, nofollow" }],
};

export default component$(() => {
    return (
        <div style={{ minHeight: "100vh" }}>
            <nav style={{ display: "flex", gap: "1rem", width: "min(800px, 92vw)", margin: "0 auto", padding: "1.75rem 0 0" }}>
                <InlineLink href="/preview">Preview</InlineLink>
                <InlineLink href="/preview/blog">Blog</InlineLink>
                <InlineLink href="/preview/project">Projects</InlineLink>
            </nav>
            <Slot />
        </div>
    );
});
