import { Slot, component$, useSignal, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { floatShapes } from "./float_shapes";

/**
 * Background from the `from/` glob-blob composition: two floating glass shapes.
 * Home hero only — render hero text as children so backdrop-filter glass can blur it
 * (text must live inside the same canvas as the blobs, matching from/).
 * Pass parallax so the stage rises with scroll.
 */
export const GlobBlobs = component$((props: { parallax?: boolean }) => {
    const stage = useSignal<HTMLDivElement>();
    const scrollShift = useSignal(0);
    const parallax = props.parallax === true;

    useStylesScoped$(`
        .parallax {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .stage {
            width: 100%;
            overflow: visible;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            touch-action: pinch-zoom;
            pointer-events: none;
            transition: transform 0.2s ease-out;
        }
        .stage.is-grabbable,
        .stage.is-grabbable * {
            cursor: grab;
        }
        .stage.is-dragging,
        .stage.is-dragging * {
            cursor: grabbing;
            -webkit-user-select: none;
            user-select: none;
        }
        .canvas {
            position: relative;
            flex: none;
            width: 1200px;
            height: 800px;
            pointer-events: auto;
        }
        /*
         * Hero under both blobs so glass/glow from gold and mint tint and blur the text.
         * Keep z-index on layers (not .blob), or dark-mode blend modes stop reaching the text.
         */
        .hero {
            position: absolute;
            inset: 0;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            pointer-events: none;
        }
        .blob {
            position: absolute;
            aspect-ratio: 1695 / 928;
            pointer-events: none;
        }
        .blob > * {
            position: absolute;
            inset: 0;
            z-index: 2;
            width: 100%;
            height: 100%;
            transform-origin: var(--com);
            translate: var(--x, 0px) var(--y, 0px);
            rotate: calc(var(--spin, 0deg) + var(--tilt, 0deg));
            will-change: translate, rotate;
        }
        .blob__aura,
        .blob__glass {
            -webkit-backdrop-filter: blur(var(--blur)) saturate(var(--saturate, 1));
            backdrop-filter: blur(var(--blur)) saturate(var(--saturate, 1));
            -webkit-mask: var(--shape) center / 100% 100% no-repeat;
            mask: var(--shape) center / 100% 100% no-repeat;
        }
        .blob__aura:nth-child(1) {
            --blur: 1.5px;
            transform: scale(1.15);
        }
        .blob__aura:nth-child(2) {
            --blur: 2.5px;
            transform: scale(1.1);
        }
        .blob__aura:nth-child(3) {
            --blur: 3.5px;
            transform: scale(1.05);
        }
        .blob__halo {
            filter: blur(48px) saturate(1.6);
            opacity: 0.55;
            transform: scale(1.08);
        }
        .blob__glass {
            --blur: 7px;
            --saturate: 1.6;
        }
        .blob__body {
            opacity: 0.62;
        }
        .blob--gold {
            --shape: url("/golden_glow_shape.png");
            --com: 51% 50%;
            width: 760px;
            left: 0;
            top: 0;
        }
        .blob--mint {
            --shape: url("/mint_glow_shape.png");
            --com: 54.4% 53.8%;
            --spin: 160deg;
            width: 800px;
            left: 431px;
            top: 348px;
        }
        @media (max-width: 599px) {
            .canvas {
                width: 100%;
                height: 100%;
                min-height: 640px;
            }
            .blob--gold {
                width: 540px;
                left: calc(50% - 360px);
                top: calc(50% - 370px);
            }
            .blob--mint {
                width: 580px;
                left: calc(50% - 204px);
                top: calc(50% + 55px);
            }
        }
        /*
         * invert() turns gold into blue and mint into magenta.
         * Exclusion stays on the halo only: on the body it blends blue on blue into green.
         */
        @media (prefers-color-scheme: dark) {
            .blob__halo {
                filter: invert(1) blur(48px) saturate(1.8);
                opacity: 0.75;
                mix-blend-mode: exclusion;
            }
            .blob__body {
                filter: invert(1) saturate(1.5);
                opacity: 0.85;
            }
        }
        .force_scheme_to_dark .blob__halo {
            filter: invert(1) blur(48px) saturate(1.8);
            opacity: 0.75;
            mix-blend-mode: exclusion;
        }
        .force_scheme_to_dark .blob__body {
            filter: invert(1) saturate(1.5);
            opacity: 0.85;
        }
        .force_scheme_to_light .blob__halo {
            filter: blur(48px) saturate(1.6);
            opacity: 0.55;
            mix-blend-mode: normal;
        }
        .force_scheme_to_light .blob__body {
            filter: none;
            opacity: 0.62;
        }
    `);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
        if (stage.value) cleanup(floatShapes(stage.value));
    });

    return (
        <div
            class="parallax"
            window:onScroll$={(_, target) => {
                if (!parallax) return;
                const { y } = target.getBoundingClientRect();
                const scrollTop = window.document.documentElement.scrollTop;
                const val = (scrollTop - y) / window.innerHeight;
                if (val > 0.5) return;
                scrollShift.value = val;
            }}
        >
            <div
                class="stage"
                ref={stage}
                style={parallax ? { transform: `translateY(${scrollShift.value * -100}%)` } : undefined}
            >
                <div class="canvas">
                    <div class="hero">
                        <Slot />
                    </div>
                    <div class="blob blob--gold" aria-hidden="true">
                        <div class="blob__aura" />
                        <div class="blob__aura" />
                        <div class="blob__aura" />
                        <img class="blob__halo" src="/golden_glow.png" alt="" width={1695} height={928} />
                        <div class="blob__glass" />
                        <img class="blob__body" src="/golden_glow.png" alt="" width={1695} height={928} />
                    </div>
                    <div class="blob blob--mint" aria-hidden="true">
                        <div class="blob__aura" />
                        <div class="blob__aura" />
                        <div class="blob__aura" />
                        <img class="blob__halo" src="/mint_glow.png" alt="" width={1695} height={928} />
                        <div class="blob__glass" />
                        <img class="blob__body" src="/mint_glow.png" alt="" width={1695} height={928} />
                    </div>
                </div>
            </div>
        </div>
    );
});
