import { useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { decode } from "js-base64";

/** /auth stores `exp` as a millisecond timestamp in the JWT payload, not seconds. */
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

/**
 * True in the browser when an unexpired admin token sits in localStorage.
 * Only use it to show or hide admin links: the token is not verified here, so
 * server code must still call `is_admin` from `~/server/auth`.
 * SSR always renders `false`, so the public HTML never hints at admin pages.
 */
export function use_local_admin_token() {
    const has = useSignal(false);
    useVisibleTask$(() => {
        has.value = local_token_unexpired();
    });
    return has;
}
