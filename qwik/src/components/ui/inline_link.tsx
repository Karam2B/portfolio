/**
 * Site-wide text links. `InlineLink` is client-side navigation between pages
 * of this site; `InlineA` is a real `<a>` for external URLs and new tabs.
 */

import { Slot, component$, useStylesScoped$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { BLUE, BLUE_DARK, BLUE_HOVER } from "~/lib/theme";

// Flashing Colors When Opening Page:
// Link blue used to flip after matchMedia; scheme and hover stay in CSS.
const link_styles = `
    .link {
        cursor: pointer;
        text-decoration: none;
    }
    .link:active {
        transform: translateY(1px);
    }
    @media (prefers-color-scheme: light) {
        .link { color: ${BLUE}; }
        .link:hover { color: ${BLUE_HOVER}; }
    }
    @media (prefers-color-scheme: dark) {
        .link { color: ${BLUE_DARK}; }
        .link:hover { color: ${BLUE}; }
    }
    .force_scheme_to_light .link { color: ${BLUE}; }
    .force_scheme_to_light .link:hover { color: ${BLUE_HOVER}; }
    .force_scheme_to_dark .link { color: ${BLUE_DARK}; }
    .force_scheme_to_dark .link:hover { color: ${BLUE}; }
`;

/**
 * Blue text link rendered as a plain `<a>`, which triggers a full page load.
 * Use it for external URLs and for links that open in a new tab.
 */
export const InlineA = component$((props: {
    href: string;
    target?: string;
    ariaLabel?: string;
    fontSize?: string | number;
}) => {
    useStylesScoped$(link_styles);
    return (
        <a
            class="link"
            href={props.href}
            target={props.target}
            aria-label={props.ariaLabel}
            style={props.fontSize !== undefined ? { fontSize: props.fontSize } : undefined}
        >
            <Slot />
        </a>
    );
});

/** Same look as `InlineA`, but uses Qwik City's `<Link>` for client-side navigation between pages of this site. */
export const InlineLink = component$((props: { href: string; fontSize?: string | number }) => {
    useStylesScoped$(link_styles);
    return (
        <Link
            class="link"
            href={props.href}
            style={props.fontSize !== undefined ? { fontSize: props.fontSize } : undefined}
        >
            <Slot />
        </Link>
    );
});
