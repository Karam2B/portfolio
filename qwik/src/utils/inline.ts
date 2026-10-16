import { useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const SANS =
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

export const BLUE = "#3b82f6";
export const BLUE_HOVER = "#2563eb";
export const BLUE_DARK = "#60a5fa";

// Flashing Colors When Opening Page:
// Theme colors belong in useStylesScoped$ under prefers-color-scheme.
// Do not reintroduce matchMedia / usePrefersDark for paint-time colors.

export function useViewport() {
    const size = useSignal({ width: 1440, height: 900 });
    useVisibleTask$(({ cleanup }) => {
        const apply = () => {
            size.value = { width: window.innerWidth, height: window.innerHeight };
        };
        apply();
        window.addEventListener("resize", apply);
        cleanup(() => window.removeEventListener("resize", apply));
    });
    return size;
}
