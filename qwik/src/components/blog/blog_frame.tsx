/**
 * Shared chrome for public blog pages: home/blog links, and a "New post"
 * link that only appears after the browser finds a local admin token.
 */

import { Slot, component$ } from "@builder.io/qwik";
import { use_local_admin_token } from "~/hooks/use_local_admin_token";
import { InlineLink } from "~/components/ui/inline_link";

export const BlogFrame = component$(() => {
    const can_mutate = use_local_admin_token();
    return (
        <div style={{ width: "min(720px, 92vw)", margin: "0 auto", padding: "1.75rem 0 4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <InlineLink href="/">Home</InlineLink>
                    <InlineLink href="/blog">Blog</InlineLink>
                </div>
                {can_mutate.value && <InlineLink href="/admin/blog/new">New post</InlineLink>}
            </div>
            <Slot />
        </div>
    );
});
