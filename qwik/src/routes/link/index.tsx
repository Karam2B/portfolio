/**
 * Contact page. Unknown short URLs (`/link/whatever`) redirect here.
 * Known slugs (`/link/github`) still jump straight to the profile URL.
 */

import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { ContactMe } from "~/components/home/contact_me";

export default component$(() => {
    return (
        <ContactMe
            title="That link isn't here"
            message="You can still reach me any time — I'm currently looking for jobs"
        />
    );
});

export const head: DocumentHead = {
    title: "That link isn't here",
};
