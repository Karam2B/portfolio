import { component$, useOnWindow, useSignal ,$, useStylesScoped$} from "@builder.io/qwik";
import BgSelector from "~/../public/hov/selector.webp";
import BgShades from "~/../public/hov/shades.png";


export const Flare = component$((props: { shift?: number }) => {
    const ref = useSignal<HTMLDivElement>();
    const loc = useSignal({ x: -250, y: -350 });

    useOnWindow(
        "mousemove",
        $((e) => {
            const event = e as MouseEvent;

            if (!ref.value) return;

            const svg = ref.value.getBoundingClientRect();
            loc.value = { x: event.clientX - svg.x, y: event.clientY - svg.y };
        }),
    );

    useStylesScoped$(`
    #background-mouse-effect {
        mask-image: url(${BgSelector});
        mask-position: var(--x) var(--y);
        mask-repeat: no-repeat;

        -webkit-mask-image: url(${BgSelector});
        -webkit-mask-position: var(--x) var(--y);
        -webkit-mask-repeat: no-repeat;
    }
  `);
    return <div class="relative">
        <div class="absolute w-full overflow-hidden" style={{ top: `${props.shift}px` }}>
            <div class="grid place-content-center w-screen h-screen overflow-hidden overflow-y-visible">
                <div class="min-w-[1200px] min-h-[800px]">
                    <div
                        // @ts-ignore
                        style={{ speak: "none" }}
                        role="presentation"
                        tabIndex={-1}
                        class={[
                            "print:hidden relative isolate min-h-800px min-h-800px mix-blend-exclusion",
                        ]}
                    >
                        <img
                            alt=""
                            aria-hidden="true"
                            id="background-pattern"
                            src={BgShades}
                            height={800}
                            width={1200}
                            class={[
                                "max-w-initial absolute inset-0 z-3",
                                "dark:mix-blend-difference dark:invert",
                            ]}
                            loading="lazy"
                        />

                        <div class="absolute inset-0 z-4 mix-blend-multiply dark:mix-blend-overlay">
                            <img
                                alt=""
                                aria-hidden="true"
                                ref={ref}
                                id="background-mouse-effect"
                                src={BgShades}
                                style={{
                                    "--x": loc.value.x - 517 + "px",
                                    "--y": loc.value.y - 517 + "px",
                                }}
                                height={800}
                                width={1200}
                                class={["max-w-initial"]}
                                loading="lazy"
                            />
                        </div>

                        <div class="bg-white dark:bg-black absolute w-full h-full inset-0" />
                    </div>
                </div>
            </div>
        </div>
    </div>
})
