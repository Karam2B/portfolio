import { component$, useStylesScoped$ } from "@builder.io/qwik";

/** Full-width 1px horizontal rule that follows the color scheme. */
export const Separator = component$(() => {
    // Flashing Colors When Opening Page:
    // Matching the theme in JS after paint flashes the wrong separator color.
    useStylesScoped$(`
        .sep {
            width: 100%;
            height: 1px;
        }
        @media (prefers-color-scheme: light) {
            .sep { background: rgba(0, 0, 0, 0.8); }
        }
        @media (prefers-color-scheme: dark) {
            .sep { background: rgba(255, 255, 255, 0.8); }
        }
        .force_scheme_to_light .sep { background: rgba(0, 0, 0, 0.8); }
        .force_scheme_to_dark .sep { background: rgba(255, 255, 255, 0.8); }
    `);
    return <div class="sep" />;
});
