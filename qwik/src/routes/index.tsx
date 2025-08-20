import { $, Slot, component$, useOnWindow, useSignal, useStylesScoped$ } from "@builder.io/qwik";
import ScrollIcon from "~/../public/scroll.svg?jsx";
import type { DocumentHead } from "@builder.io/qwik-city";
import { use_projects } from "~/utils/endpoint";
import { MainGrid, Separator, StyleA } from "~/utils/components"
import { LinkAsA } from "./link/[link]";
import { ProjectSummary } from "~/utils/endpoint_view";
import { links } from "~/utils/links";
import { Flare } from "~/utils/Flare";
import { Illigal } from "~/utils/illegal";

export default component$(() => {
    return (
        <IndexStructure>
            <div q:slot="main">
                <Intro>
                    <span q:slot="h1">Hi 👋, My Name is Karam</span>
                    <span q:slot="h2">I'm full-stack developer based in the bay area</span>
                </Intro>

                <AboutMe>
                    <div q:slot="main">
                        <p>
                            Hi I’m Karam, I’m a full-stack developer developer currently finishing
                            computer engineering degree in SF State.
                        </p>
                        <p>
                            I love building elegant websites and web application using state-of-art technologies.
                        </p>
                        <p>
                            I'm looking for job opportunities in the bay area, if you're
                            interested in hiring, hit me up.
                        </p>
                    </div>
                    <div q:slot="call_of_action">
                        <LinkAsA name="Resume" >
                            View my Resume
                        </LinkAsA>{" "}
                        <LinkAsA name="Github">
                            View my Github
                        </LinkAsA>
                    </div>
                </AboutMe>
                <Projects />
                <ContactMe >
                    <span q:slot="message" >
                        I'm currently looking for jobs, you can say hi any time
                    </span>
                </ContactMe>
            </div>
            <div q:slot="footer">
                Built with Typescript🛡️⚙️, Qwik🏃💨, SQL, and Rust ⚙️🦀 | checkout the code on{" "}
                <StyleA>
                    <a href="https://github.com/karambarakat/myportfolio">Github</a>
                </StyleA>
            </div>
        </IndexStructure>
    );
});

export const head: DocumentHead = {
    title: "Welcome to Qwik",
    meta: [
        {
            name: "description",
            content: "Qwik site description",
        },
    ],
};

const IndexStructure = component$(() => {
    return (
        <div class="min-h-[100vh] flex flex-col">
            <div class="flex-1">
                <Flare />
                <Scroll />
                <div style={{ isolation: "isolate" }}>
                    <Slot name="main" />
                </div>
            </div>

            <div class="mt-8" >
                <Separator />
            </div>
            <footer class="text-center py-4">
                <Slot name="footer" />
            </footer>

        </div >
    );
});

const Scroll = component$(() => {
    const hide = useSignal(false);
    useOnWindow(
        "scroll",
        $(() => {
            hide.value = window.document.documentElement.scrollTop !== 0;
        }),
    );

    return (
        <div class={["fixed bottom-[40px] w-full flex justify-center pt-[30px] "]}>
            <ScrollIcon
                class={[
                    "w-[40px] h-[40px] fill-black dark:fill-white stroke-black dark:stroke-white stroke-as-text",

                    "animate-bounce",
                    "transition-[transform,opacity]",
                    hide.value
                        ? "opacity-0 translate-y-[15px]"
                        : "",
                ]}
            />
        </div>
    );
});

const Intro = component$(() => {
    useStylesScoped$(`
    .slide-up-on-scroll {
      transition: transform 0.2s ease-out;
      transform: translateY(calc(var(--scroll) * -100%));
    }
    `);

    return (
        <div
            window:onScroll$={(_, target) => {
                const { y } = target.getBoundingClientRect();
                const scrollTop = window.document.documentElement.scrollTop;
                const val = (scrollTop - y) / window.innerHeight;

                if (val > 0.5) return;

                const child = target.firstChild as HTMLDivElement;
                child.style.setProperty("--scroll", `${val}`);
            }}
        >
            <div class="slide-up-on-scroll h-screen">
                <div class="h-full p-2 text-center grid place-items-center place-content-center relative">
                    <h1 class="text-5xl pb-3"><Slot name="h1" /></h1>
                    <h2 class="font-light text-3xl pb-3 mb-8"><Slot name="h2" /></h2>
                </div>
            </div>
        </div>
    );
});

const AboutMe = component$(() => {
    // *:(mb-5) *:w-[500px] *:text-6 *:max-w-screen
    useStylesScoped$(`
.slot-decendent > :global(*) > :global(*) {
    text-align: left;
    margin-bottom: calc(var(--spacing) * 5);
    width: 500px;
    max-width: 100vw;
    font-size: var(--text-2xl); /* 3.75rem (60px) */ 
    line-height: var(--text-2xl--line-height); /* 1 */
}
.call_of_action > :global(*) {
    display: flex; flex-direction: column;
    gap: calc(var(--spacing));
}
`)
    return (

        <div class="mt-[-30vh] [@media(max-height:700px)]:mt-[200px]">
            <AnimatedLine>
                <div
                    class="
  max-w-[95vw]
  m-auto grid justify-items-center text-center
  "
                >
                    <div class="slot-decendent ">
                        <Slot name="main" />
                        <div class="call_of_action" ><Slot name="call_of_action" /> </div>
                    </div>
                </div>
            </AnimatedLine>
        </div>
    );
});

const AnimatedLine = component$(() => {
    useStylesScoped$(`
  path {
    stroke-dasharray: 3223px;

    animation: rotate 1s linear infinite;
    animation-play-state: paused;
    animation-delay: calc(var(--scroll) * -1s);
    
    animation-iteration-count: 1;
    animation-fill-mode: both;

    transform-origin: center;
  }

  @keyframes rotate {
    from {
      stroke-dashoffset: 3223px;
    }
  }
  `);

    useStylesScoped$(`

  @media (max-width: 1280px) {
    .content-spec {
      width: 95vw;
      margin: 2.5vw;
      left: 0;
      place-content:center;
    }
  }
  .content-spec > :global(*) {
    isolation: isolate;
    z-index: 10;
  }
  `);

    return (
        <>
            <div class="flex justify-center translate-y-[-144px] overflow-hidden">
                <div class="">
                    <svg
                        window:onScroll$={(_, target) => {
                            const y_t = target.getBoundingClientRect().y;
                            const y_w =
                                window.document.documentElement.getBoundingClientRect().y;
                            const y = y_t - y_w;

                            const top = window.document.documentElement.scrollTop;

                            const prog =
                                (top - y + target.clientHeight * 0.5) / target.clientHeight;

                            if (prog > 2.1) return;
                            (target as SVGElement).style.setProperty(
                                "--scroll",
                                String(prog - 0.3),
                            );
                        }}
                        version="1.2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 2200"
                        preserveAspectRatio="xMidYMin meet"
                        width="1200"
                        height="2200"
                    >
                        <path
                            fill-opacity="0"
                            class="stroke-black stroke-black dark:stroke-white"
                            stroke-width="2"
                            d="m600 0c0 0 0 42 0 96 0 54-14.2 180.6-237.8 272-233.4 95.5-264.4 304.5-259.1 469.8 5.3 162.6 79.3 355.6 239 472.3 97.7 71.4 257.7 147.4 375.5 93.7 55.6-25.3 61.4-100.7 24.5-125.8-36.1-24.6-91.9-21.3-131.7 18-78 77.2-8.5 201.5-10.5 599.2-0.2 54.3 0.1 244.7 0.1 304.8"
                        />
                    </svg>
                    <div class="content-spec absolute w-[1200px] grid h-0 content-center items-center top-[38%]">
                        <Slot />
                    </div>
                </div>
            </div>
        </>
    );
});

const Projects = component$(() => {
    const projects = use_projects();
    return <div>
        <h2 class="text-4xl text-center">All Projects</h2>
        <p class="text-center">
            list of all my projects, you can check a live-preview or the codebase too
        </p>

        <div class="my-5">
            <MainGrid>
                {
                    projects.value ? projects.value.map((pro) => {
                        if (pro.display_picture) {
                            return <ProjectSummary key={pro.id} data={pro} />;
                        }
                    }) : <Illigal />
                }
            </MainGrid>
            <div class="pt-7 grid place-content-center"><StyleA><a class="text-2xl" href="/projects" >See All</a></StyleA> </div>
        </div>

    </div>
})



const ContactMe = component$(() => {
    return <div >
        <div class="h-[calc(100vh-90px)] grid place-content-center">
            <h2 class="text-center text-5xl mb-2">Get in Contact</h2>
            <p class="text-center text-2xl font-thin">
                <Slot name="message" />
            </p>
            <div class="flex gap-4 justify-center mt-4">
                {links.map((item) => {
                    if (!item.Img) return;
                    return (
                        <a
                            href={item.href}
                            class="cursor-pointer *:text-[32px] *:fill-blue-500 *:text-blue-500"
                            target="_blank"
                            key={item.text}
                        >
                            <div >
                                <item.Img
                                    //@ts-ignore
                                    alt={item.text}
                                />
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    </div>
})
