import { Slot, component$, useStylesScoped$ } from "@builder.io/qwik";
import NoPreview from "~/../public/noPreview.svg?raw"

export const Separator = component$(() => {
    return <div class="min-w-[1px] min-h-[1px] self-stretch bg-black/80 dark:bg-white/80"><Slot /></div>
})

export const Base = component$(() => {
    return <div class="dark:bg-slate-800 dark:text-white"><Slot /></div>
})

export const MainGrid = component$(() => {
    return <div class="w-[800px] max-w-[90vw] m-auto"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><Slot /></div></div>
})

export const StyleA = component$(() => {
    return <span
        class={`
cursor-pointer
          [&_a]:active:translate-y-1px
          [&_a]:active:translate-y-1px

          [&_a]:text-blue-500 
          [&_a]:dark:text-blue-400

          [&_svg]:fill-blue-500 
          [&_svg]:dark:fill-blue-400

          [&_vg]:hover:fill-blue-600 
          [&_vg]:dark:hover:fill-blue-500
`}
    ><Slot /></span>
})

export const DisplayImage = component$(function({
    src,
    ratio,
}: {
    src?: string | null;
    ratio?: number;
}) {
    return (
        <div class="rounded-xl ">
            <AspectRatio ratio={ratio || 66}>
                {!src ? (
                        <div
                            class="rounded-xl w-full h-full p-5 bg-white"
                            dangerouslySetInnerHTML={NoPreview}
                        />
                ) : (
                    <img class="rounded-xl" src={import.meta.env.PUBLIC_MEDIA_BUCKET_DOMAIN + "/raw" + src} alt="Display Image" />)}
            </AspectRatio>
        </div>
    );
});

const AspectRatio = component$(function({ ratio }: { ratio: number }) {
    useStylesScoped$(`
       .ar-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: var(--ar-ratio);
        }
        .ar-container > :global(*) {
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover;
        } 
        .ar-container :global(svg) {
            width: 100%;
            height: 100%;
        }
    `);

    return (
        <div class="ar-container" style={{ "--ar-ratio": ratio + "%" }}>
            <Slot />
        </div>
    );
});
