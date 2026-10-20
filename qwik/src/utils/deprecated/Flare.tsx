// Deprecated: replaced by GlobBlobs (from/ glob-blob). Do not import this.
import { component$, useOnWindow, useSignal, useStylesScoped$, $ } from "@builder.io/qwik";
import BgSelector from "~/../public/hov/selector.webp";
import BgShades from "~/../public/hov/shades.png";

export const Flare = component$((props: { shift?: number }) => {
    const ref = useSignal<HTMLImageElement>();
    const loc = useSignal({ x: -250, y: -350 });

    // Flashing Colors When Opening Page:
    // Blend modes and invert used to toggle after matchMedia; CSS applies on first paint.
    useStylesScoped$(`
        .blend-root {
            position: relative;
            isolation: isolate;
            min-height: 800px;
        }
        .pattern {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 3;
            max-width: none;
        }
        .overlay {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 4;
        }
        .fill {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
        @media (prefers-color-scheme: light) {
            .blend-root { mix-blend-mode: normal; }
            .pattern {
                mix-blend-mode: normal;
                filter: none;
            }
            .overlay { mix-blend-mode: multiply; }
            .fill { background: #ffffff; }
        }
        @media (prefers-color-scheme: dark) {
            .blend-root { mix-blend-mode: exclusion; }
            .pattern {
                mix-blend-mode: difference;
                filter: invert(1);
            }
            .overlay { mix-blend-mode: overlay; }
            .fill { background: #000000; }
        }
        .force_scheme_to_light .blend-root { mix-blend-mode: normal; }
        .force_scheme_to_light .pattern {
            mix-blend-mode: normal;
            filter: none;
        }
        .force_scheme_to_light .overlay { mix-blend-mode: multiply; }
        .force_scheme_to_light .fill { background: #ffffff; }
        .force_scheme_to_dark .blend-root { mix-blend-mode: exclusion; }
        .force_scheme_to_dark .pattern {
            mix-blend-mode: difference;
            filter: invert(1);
        }
        .force_scheme_to_dark .overlay { mix-blend-mode: overlay; }
        .force_scheme_to_dark .fill { background: #000000; }
    `);

    useOnWindow(
        "mousemove",
        $((e) => {
            const event = e as MouseEvent;
            if (!ref.value) return;
            const svg = ref.value.getBoundingClientRect();
            loc.value = { x: event.clientX - svg.x, y: event.clientY - svg.y };
        }),
    );

    const maskPosition = `${loc.value.x - 517}px ${loc.value.y - 517}px`;

    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    overflow: "hidden",
                    ...(props.shift !== undefined ? { top: props.shift } : {}),
                }}
            >
                <div
                    style={{
                        display: "grid",
                        placeContent: "center",
                        width: "100vw",
                        height: "100vh",
                        overflow: "hidden",
                        overflowY: "visible",
                    }}
                >
                    <div style={{ minWidth: 1200, minHeight: 800 }}>
                        <div class="blend-root" role="presentation" tabIndex={-1}>
                            <img
                                class="pattern"
                                alt=""
                                aria-hidden="true"
                                id="background-pattern"
                                src={BgShades}
                                height={800}
                                width={1200}
                                loading="lazy"
                            />

                            <div class="overlay">
                                <img
                                    alt=""
                                    aria-hidden="true"
                                    ref={ref}
                                    id="background-mouse-effect"
                                    src={BgShades}
                                    height={800}
                                    width={1200}
                                    style={{
                                        maxWidth: "none",
                                        maskImage: `url(${BgSelector})`,
                                        WebkitMaskImage: `url(${BgSelector})`,
                                        maskPosition,
                                        WebkitMaskPosition: maskPosition,
                                        maskRepeat: "no-repeat",
                                        WebkitMaskRepeat: "no-repeat",
                                    }}
                                    loading="lazy"
                                />
                            </div>

                            <div class="fill" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
