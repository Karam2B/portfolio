import { component$, useOnWindow, useSignal, $ } from "@builder.io/qwik";
import BgSelector from "~/../public/hov/selector.webp";
import BgShades from "~/../public/hov/shades.png";
import { usePrefersDark } from "./inline";

export const Flare = component$((props: { shift?: number }) => {
    const ref = useSignal<HTMLImageElement>();
    const loc = useSignal({ x: -250, y: -350 });
    const dark = usePrefersDark();

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
                        <div
                            role="presentation"
                            tabIndex={-1}
                            style={{
                                position: "relative",
                                isolation: "isolate",
                                minHeight: 800,
                                mixBlendMode: "exclusion",
                            }}
                        >
                            <img
                                alt=""
                                aria-hidden="true"
                                id="background-pattern"
                                src={BgShades}
                                height={800}
                                width={1200}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0,
                                    zIndex: 3,
                                    maxWidth: "none",
                                    mixBlendMode: dark.value ? "difference" : "normal",
                                    filter: dark.value ? "invert(1)" : "none",
                                }}
                                loading="lazy"
                            />

                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0,
                                    zIndex: 4,
                                    mixBlendMode: dark.value ? "overlay" : "multiply",
                                }}
                            >
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

                            <div
                                style={{
                                    background: dark.value ? "#000000" : "#ffffff",
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
