import { Slot, component$, useStylesScoped$ } from "@builder.io/qwik";

/** Page background and text color for the whole site. Rendered once in root.tsx. */
export const Base = component$(() => {
    // Flashing Colors When Opening Page:
    // SSR cannot know the visitor's scheme via JS; CSS media queries do.
    useStylesScoped$(`
        .base {
            min-height: 100vh;
        }
        @media (prefers-color-scheme: light) {
            .base {
                background: #ffffff;
                color: #000000;
            }
        }
        @media (prefers-color-scheme: dark) {
            .base {
                background: #05060a;
                color: #ffffff;
            }
        }
        .force_scheme_to_light .base {
            background: #ffffff;
            color: #000000;
        }
        .force_scheme_to_dark .base {
            background: #05060a;
            color: #ffffff;
        }
    `);
    return (
        <div class="base">
            <Slot />
        </div>
    );
});
