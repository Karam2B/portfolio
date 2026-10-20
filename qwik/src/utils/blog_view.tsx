import { Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { decode } from "js-base64";
import { InlineLink } from "./components";

// Auth stores exp as a millisecond timestamp in the JWT payload (see /auth).
function local_token_unexpired() {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
        const payload = token.split(".")[1];
        if (!payload) return false;
        const decoded = JSON.parse(decode(payload));
        if (!decoded || typeof decoded !== "object" || !("exp" in decoded)) return false;
        const exp = decoded.exp;
        const expiry_ms = typeof exp === "number" ? exp : typeof exp === "string" ? Number(exp) : NaN;
        if (!Number.isFinite(expiry_ms)) return false;
        return expiry_ms > Date.now();
    } catch {
        return false;
    }
}

// Public visitors must not see admin/mutate affordances. The token lives in
// localStorage after /auth; SSR always starts hidden so the HTML has no hint.
export function use_local_admin_token() {
    const has = useSignal(false);
    useVisibleTask$(() => {
        has.value = local_token_unexpired();
    });
    return has;
}

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
