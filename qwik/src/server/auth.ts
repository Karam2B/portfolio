/**
 * Admin authentication (server side).
 *
 * Flow: /auth runs Google OAuth, signs a JWT with JWT_SECRET, and the browser
 * stores it in localStorage and in a `jwt` cookie that expires after one hour.
 *
 * - Server code (loaders, actions) must call `is_admin` before touching admin data.
 * - The browser-side check in `~/hooks/use_local_admin_token` only decides whether
 *   to show admin links; it is not a security boundary.
 */

import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import jwt from "jsonwebtoken";

/** Minimal slice of a Qwik City request event, so loaders and actions can both pass `event`. */
type AuthEvent = {
    cookie: { get(name: string): { value: string } | null };
    env: EnvGetter;
};

/** True when the `jwt` cookie carries a token signed with JWT_SECRET. */
export function is_admin(event: AuthEvent) {
    const token = event.cookie.get("jwt")?.value;
    const secret = event.env.get("JWT_SECRET");
    if (!token || !secret) return false;
    try {
        jwt.verify(token, secret);
        return true;
    } catch {
        return false;
    }
}
