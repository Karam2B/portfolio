/**
 * Admin-only live preview of every project and post, including unpublished ones.
 *
 * `onRequest` is the security check: child loaders must not run for a visitor
 * without a valid jwt, or unpublished rows would serialize to the browser.
 * This tree is excluded from static generation (see the adapters' `/admin/preview/*`).
 * The parent `/admin` layout skips its nav here so the pages match `/blog` and `/projects`.
 */

import { Slot, component$ } from "@builder.io/qwik";
import { type DocumentHead, type RequestHandler } from "@builder.io/qwik-city";
import { is_admin } from "~/server/auth";

export const onRequest: RequestHandler = (event) => {
    event.cacheControl({
        noStore: true,
        noCache: true,
        maxAge: 0,
        sMaxAge: 0,
    });
    event.headers.set("X-Robots-Tag", "noindex, nofollow");
    if (!is_admin(event)) {
        throw event.redirect(302, "/auth");
    }
};

export const head: DocumentHead = {
    meta: [{ name: "robots", content: "noindex, nofollow" }],
};

export default component$(() => {
    return <Slot />;
});
