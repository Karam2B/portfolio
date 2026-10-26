/**
 * Design tokens shared by components.
 *
 * Flashing Colors When Opening Page:
 * Theme colors belong in useStylesScoped$ under `prefers-color-scheme`, plus the
 * `.force_scheme_to_light` / `.force_scheme_to_dark` overrides. CSS applies them
 * on first paint, while JS (matchMedia / usePrefersDark) only runs after
 * hydration and makes the page flash the wrong colors. Do not reintroduce JS
 * checks for paint-time colors.
 */

export const SANS =
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Link color on light backgrounds. */
export const BLUE = "#3b82f6";
export const BLUE_HOVER = "#2563eb";
/** Link color on dark backgrounds. */
export const BLUE_DARK = "#60a5fa";
