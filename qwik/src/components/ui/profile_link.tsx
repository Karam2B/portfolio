import { Slot, component$ } from "@builder.io/qwik";
import { links } from "~/lib/profile_links";
import { InlineA } from "./inline_link";

type LinkName = (typeof links)[number]["text"];

/**
 * Inline link to one of the entries in `~/lib/profile_links`, looked up by name,
 * so URLs like the resume live in one place. `name` is type-checked against that list.
 */
export const ProfileLink = component$((props: { name: LinkName }) => {
    const found = links.find((search) => search.text === props.name);
    if (!found) throw new Error("link is not found");
    return (
        <InlineA href={found.href}>
            <Slot />
        </InlineA>
    );
});
