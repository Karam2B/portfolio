import { useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const SANS =
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

export const BLUE = "#3b82f6";
export const BLUE_HOVER = "#2563eb";
export const BLUE_DARK = "#60a5fa";

export function linkColor(dark: boolean, hover: boolean) {
    if (dark) return hover ? BLUE : BLUE_DARK;
    return hover ? BLUE_HOVER : BLUE;
}

export function usePrefersDark() {
    const dark = useSignal(false);
    useVisibleTask$(({ cleanup }) => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const apply = () => {
            dark.value = media.matches;
        };
        apply();
        media.addEventListener("change", apply);
        cleanup(() => media.removeEventListener("change", apply));
    });
    return dark;
}

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
