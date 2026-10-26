import { useSignal, useVisibleTask$ } from "@builder.io/qwik";

/**
 * Window size as a signal, updated on resize.
 * SSR has no window, so the first render uses a 1440×900 desktop guess and the
 * real size arrives after the component becomes visible. Use it for layout
 * decisions only, never for colors (see `~/lib/theme`).
 */
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
