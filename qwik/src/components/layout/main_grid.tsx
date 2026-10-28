import { Slot, component$, useStylesScoped$ } from "@builder.io/qwik";

/**
 * Centered card grid (max 800px): two columns from 768px wide, one column below.
 * The breakpoint is CSS so the first paint matches the viewport. A JS width
 * guess during SSR would flash two columns on a narrow screen.
 */
export const MainGrid = component$(() => {
    useStylesScoped$(`
        .shell {
            width: min(800px, 90vw);
            margin: 0 auto;
        }
        .grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
            .grid {
                grid-template-columns: 1fr 1fr;
            }
        }
    `);
    return (
        <div class="shell">
            <div class="grid">
                <Slot />
            </div>
        </div>
    );
});
