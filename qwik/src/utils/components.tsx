import { Slot, component$, useStylesScoped$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { BLUE, BLUE_DARK, BLUE_HOVER, useViewport } from "./inline";

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
        .force_scheme_to_light.sep { background: rgba(0, 0, 0, 0.8); }
        .force_scheme_to_dark.sep { background: rgba(255, 255, 255, 0.8); }
    `);
    return <div class="sep" />;
});

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
                background: #1e293b;
                color: #ffffff;
            }
        }
        .force_scheme_to_light.base {
            background: #ffffff;
            color: #000000;
        }
        .force_scheme_to_dark.base {
            background: #1e293b;
            color: #ffffff;
        }
    `);
    return (
        <div class="base">
            <Slot />
        </div>
    );
});

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

export const InlineA = component$((props: {
    href: string;
    target?: string;
    ariaLabel?: string;
    fontSize?: string | number;
}) => {
    // Flashing Colors When Opening Page:
    // Link blue used to flip after matchMedia; hover stays in CSS too.
    useStylesScoped$(`
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
        .force_scheme_to_light.link { color: ${BLUE}; }
        .force_scheme_to_light.link:hover { color: ${BLUE_HOVER}; }
        .force_scheme_to_dark.link { color: ${BLUE_DARK}; }
        .force_scheme_to_dark.link:hover { color: ${BLUE}; }
    `);
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

export const InlineLink = component$((props: { href: string; fontSize?: string | number }) => {
    // Flashing Colors When Opening Page:
    // Same as InlineA — scheme and hover from CSS, not usePrefersDark.
    useStylesScoped$(`
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
        .force_scheme_to_light.link { color: ${BLUE}; }
        .force_scheme_to_light.link:hover { color: ${BLUE_HOVER}; }
        .force_scheme_to_dark.link { color: ${BLUE_DARK}; }
        .force_scheme_to_dark.link:hover { color: ${BLUE}; }
    `);
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

export const DisplayImage = component$((props: { src?: string | null; ratio?: number }) => {
    const ratio = props.ratio || 66;
    return (
        <div style={{ borderRadius: 12 }}>
            <div style={{ position: "relative", width: "100%", height: 0, paddingBottom: `${ratio}%` }}>
                <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
                    {!props.src ? (
                        <img
                            src="/noPreview.svg"
                            alt="Display Image"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                background: "#ffffff",
                                borderRadius: 12,
                                padding: "1.25rem",
                                boxSizing: "border-box",
                            }}
                        />
                    ) : (
                        <img
                            src={import.meta.env.PUBLIC_MEDIA_BUCKET_DOMAIN + "/raw" + props.src}
                            alt="Display Image"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 12,
                                display: "block",
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});
