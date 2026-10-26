import { Slot, component$ } from "@builder.io/qwik";
import { useViewport } from "~/hooks/use_viewport";

/** Centered card grid (max 800px): two columns from 768px wide, one column below. */
export const MainGrid = component$(() => {
    const viewport = useViewport();
    const twoColumns = viewport.value.width >= 768;
    return (
        <div style={{ width: "min(800px, 90vw)", margin: "0 auto" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: twoColumns ? "1fr 1fr" : "1fr",
                    gap: "1rem",
                }}
            >
                <Slot />
            </div>
        </div>
    );
});
