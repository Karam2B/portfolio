/**
 * Wraps every `/admin/*` page. The signed `jwt` cookie is the security check
 * (`is_admin`); without it the layout shows Unauthorized instead of the nav.
 */

import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { InlineA, InlineLink } from "~/components/ui/inline_link";
import { is_admin } from "~/server/auth";

export const admin_auth = routeLoader$((event) => {
    return { pass: is_admin(event) };
});

export default component$(() => {
    let auth = admin_auth();
    return <>
        {auth.value.pass ?
            <div style={{ width: "min(1100px, 94vw)", margin: "0 auto", padding: "1.5rem 0 3rem" }}>
                <nav style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <InlineLink href="/admin">Admin</InlineLink>
                    <InlineLink href="/admin/blog">Blogs</InlineLink>
                    <InlineLink href="/admin/projects">Projects</InlineLink>
                    <InlineLink href="/admin/photos">Photos</InlineLink>
                </nav>
                <Slot />
            </div>
            : <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}><div>Unauthorized</div><InlineA href="/auth">auth</InlineA></div>
        }
    </>
})