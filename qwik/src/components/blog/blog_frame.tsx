/**
 * Shared chrome for blog pages: home/blog links, and a "New post"
 * link that only appears after the browser finds a local admin token.
 * Preview passes `/admin/preview` hrefs so drafts stay inside that tree.
 */

import { Slot, component$ } from "@builder.io/qwik";
import { use_local_admin_token } from "~/hooks/use_local_admin_token";
import { InlineLink } from "~/components/ui/inline_link";

export const BlogFrame = component$((props: {
    home_href?: string;
    blog_href?: string;
}) => {
    const can_mutate = use_local_admin_token();
    const home_href = props.home_href ?? "/";
    const blog_href = props.blog_href ?? "/blog";
    return (
        <div style={{ width: "min(720px, 92vw)", margin: "0 auto", padding: "1.75rem 0 4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <InlineLink href={home_href}>Home</InlineLink>
                    <InlineLink href={blog_href}>Blog</InlineLink>
                </div>
                {can_mutate.value && <InlineLink href="/admin/blog/new">New post</InlineLink>}
            </div>
            <Slot />
        </div>
    );
});
