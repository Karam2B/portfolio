/**
 * Wraps every `/admin/*` page. The signed `jwt` cookie is the security check
 * (`is_admin`); without it the layout shows Unauthorized instead of the nav.
 * `/admin/preview/blog` and `/admin/preview/projects` skip the nav so they
 * match the public `/blog` and `/projects` layouts.
 */

import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { InlineA, InlineLink } from "~/components/ui/inline_link";
import { is_admin } from "~/server/auth";

export const admin_auth = routeLoader$((event) => {
    return { pass: is_admin(event) };
});

const is_site_preview = (pathname: string) => {
    return pathname === "/admin/preview" || pathname === "/admin/preview/"
        || pathname.startsWith("/admin/preview/blog")
        || pathname.startsWith("/admin/preview/projects");
};

export default component$(() => {
    const auth = admin_auth();
    const loc = useLocation();
    if (!auth.value.pass) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <div>Unauthorized</div>
                <InlineA href="/auth">auth</InlineA>
            </div>
        );
    }
    if (is_site_preview(loc.url.pathname)) {
        return <Slot />;
    }
    return (
        <div style={{ width: "min(1100px, 94vw)", margin: "0 auto", padding: "1.5rem 0 3rem" }}>
            <nav style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <InlineLink href="/admin">Admin</InlineLink>
                <InlineLink href="/admin/blog">Blogs</InlineLink>
                <InlineLink href="/admin/projects">Projects</InlineLink>
                <InlineLink href="/admin/photos">Photos</InlineLink>
                <InlineLink href="/admin/preview">Preview</InlineLink>
            </nav>
            <Slot />
        </div>
    );
});
