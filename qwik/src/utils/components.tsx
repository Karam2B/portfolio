import { Slot, component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { linkColor, usePrefersDark, useViewport } from "./inline";

export const Separator = component$(() => {
    const dark = usePrefersDark();
    return (
        <div
            style={{
                width: "100%",
                height: 1,
                background: dark.value ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
            }}
        />
    );
});

export const Base = component$(() => {
    const dark = usePrefersDark();
    return (
        <div
            style={{
                background: dark.value ? "#1e293b" : "#ffffff",
                color: dark.value ? "#ffffff" : "#000000",
                minHeight: "100vh",
            }}
        >
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
    const dark = usePrefersDark();
    const hover = useSignal(false);
    const pressed = useSignal(false);
    return (
        <a
            href={props.href}
            target={props.target}
            aria-label={props.ariaLabel}
            style={{
                cursor: "pointer",
                color: linkColor(dark.value, hover.value),
                textDecoration: "none",
                transform: pressed.value ? "translateY(1px)" : "none",
                ...(props.fontSize !== undefined ? { fontSize: props.fontSize } : {}),
            }}
            onMouseEnter$={() => {
                hover.value = true;
            }}
            onMouseLeave$={() => {
                hover.value = false;
                pressed.value = false;
            }}
            onMouseDown$={() => {
                pressed.value = true;
            }}
            onMouseUp$={() => {
                pressed.value = false;
            }}
        >
            <Slot />
        </a>
    );
});

export const InlineLink = component$((props: { href: string; fontSize?: string | number }) => {
    const dark = usePrefersDark();
    const hover = useSignal(false);
    const pressed = useSignal(false);
    return (
        <Link
            href={props.href}
            style={{
                cursor: "pointer",
                color: linkColor(dark.value, hover.value),
                textDecoration: "none",
                transform: pressed.value ? "translateY(1px)" : "none",
                ...(props.fontSize !== undefined ? { fontSize: props.fontSize } : {}),
            }}
            onMouseEnter$={() => {
                hover.value = true;
            }}
            onMouseLeave$={() => {
                hover.value = false;
                pressed.value = false;
            }}
            onMouseDown$={() => {
                pressed.value = true;
            }}
            onMouseUp$={() => {
                pressed.value = false;
            }}
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
