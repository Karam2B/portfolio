import { $, Slot, component$, useOnWindow, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import ScrollIcon from "~/../public/scroll.svg?jsx";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { InlineA, InlineLink, MainGrid, Separator } from "~/utils/components";
import { LinkAsA } from "./link/[link]";
import { ProjectSummary } from "~/utils/endpoint_view";
import { links } from "~/utils/links";
import { Flare } from "~/utils/Flare";
import { use_server_projects_2 } from "~/utils/endpoint_2";
import { usePrefersDark, useViewport } from "~/utils/inline";

export default component$(() => {
    const aboutParagraph = {
        textAlign: "left" as const,
        margin: "0 0 1.25rem",
        width: "min(500px, 100vw)",
        fontSize: "1.5rem",
        lineHeight: "2rem",
    };

    return (
        <IndexStructure>
            <div q:slot="main">
                <Intro>
                    <span q:slot="h1">Hi 👋, My Name is Karam</span>
                    <span q:slot="h2">I'm full-stack developer based in the bay area</span>
                </Intro>

                <AboutMe>
                    <div q:slot="main">
                        <p style={aboutParagraph}>
                            Hi I’m Karam, I’m a full-stack developer developer currently finishing
                            computer engineering degree in SF State.
                        </p>
                        <p style={aboutParagraph}>
                            I love building elegant websites and web application using state-of-art technologies.
                        </p>
                        <p style={aboutParagraph}>
                            I'm looking for job opportunities in the bay area, if you're
                            interested in hiring, hit me up.
                        </p>
                    </div>
                    <div q:slot="call_of_action" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <LinkAsA name="Resume" >
                            View my Resume
                        </LinkAsA>
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
                <InlineA href="https://github.com/karambarakat/myportfolio">
                    Github
                </InlineA>
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
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }}>
                <Flare />
                <Scroll />
                <div style={{ isolation: "isolate" }}>
                    <Slot name="main" />
                </div>
            </div>

            <div style={{ marginTop: "2rem" }}>
                <Separator />
            </div>
            <footer style={{ textAlign: "center", padding: "1rem 0" }}>
                <Slot name="footer" />
            </footer>
        </div>
    );
});

const Scroll = component$(() => {
    const hide = useSignal(false);
    const offset = useSignal(0);
    const dark = usePrefersDark();

    useOnWindow(
        "scroll",
        $(() => {
            hide.value = window.document.documentElement.scrollTop !== 0;
        }),
    );

    useVisibleTask$(({ cleanup }) => {
        const id = window.setInterval(() => {
            offset.value = Math.sin(Date.now() / 160) * -10;
        }, 50);
        cleanup(() => window.clearInterval(id));
    });

    return (
        <div
            style={{
                position: "fixed",
                bottom: 40,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                paddingTop: 30,
            }}
        >
            <ScrollIcon
                style={{
                    width: 40,
                    height: 40,
                    fill: dark.value ? "#ffffff" : "#000000",
                    stroke: dark.value ? "#ffffff" : "#000000",
                    opacity: hide.value ? 0 : 1,
                    transform: hide.value ? "translateY(15px)" : `translateY(${offset.value}px)`,
                    transition: "opacity 0.2s ease",
                }}
            />
        </div>
    );
});

const Intro = component$(() => {
    const shift = useSignal(0);

    return (
        <div
            window:onScroll$={(_, target) => {
                const { y } = target.getBoundingClientRect();
                const scrollTop = window.document.documentElement.scrollTop;
                const val = (scrollTop - y) / window.innerHeight;
                if (val > 0.5) return;
                shift.value = val;
            }}
        >
            <div
                style={{
                    height: "100vh",
                    transition: "transform 0.2s ease-out",
                    transform: `translateY(${shift.value * -100}%)`,
                }}
            >
                <div
                    style={{
                        height: "100%",
                        padding: "0.5rem",
                        textAlign: "center",
                        display: "grid",
                        placeItems: "center",
                        placeContent: "center",
                        position: "relative",
                    }}
                >
                    <h1 style={{ fontSize: "3rem", lineHeight: 1, fontWeight: 400, paddingBottom: "0.75rem", margin: 0 }}>
                        <Slot name="h1" />
                    </h1>
                    <h2
                        style={{
                            fontWeight: 300,
                            fontSize: "1.875rem",
                            lineHeight: "2.25rem",
                            paddingBottom: "0.75rem",
                            margin: "0 0 2rem",
                        }}
                    >
                        <Slot name="h2" />
                    </h2>
                </div>
            </div>
        </div>
    );
});

const AboutMe = component$(() => {
    const viewport = useViewport();
    const short = viewport.value.height <= 700;
    return (
        <div style={{ marginTop: short ? 200 : "-30vh" }}>
            <AnimatedLine>
                <div
                    style={{
                        maxWidth: "95vw",
                        margin: "0 auto",
                        display: "grid",
                        justifyItems: "center",
                        textAlign: "center",
                    }}
                >
                    <div>
                        <Slot name="main" />
                        <Slot name="call_of_action" />
                    </div>
                </div>
            </AnimatedLine>
        </div>
    );
});

const AnimatedLine = component$(() => {
    const dark = usePrefersDark();
    const viewport = useViewport();
    const draw = useSignal(0);
    const narrow = viewport.value.width <= 1280;

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                transform: "translateY(-144px)",
                overflow: "hidden",
            }}
        >
            <div>
                <svg
                    window:onScroll$={(_, target) => {
                        const y_t = target.getBoundingClientRect().y;
                        const y_w = window.document.documentElement.getBoundingClientRect().y;
                        const y = y_t - y_w;
                        const top = window.document.documentElement.scrollTop;
                        const prog = (top - y + target.clientHeight * 0.5) / target.clientHeight;
                        if (prog > 2.1) return;
                        draw.value = Math.min(Math.max(prog - 0.3, 0), 1);
                    }}
                    version="1.2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 2200"
                    preserveAspectRatio="xMidYMin meet"
                    width="1200"
                    height="2200"
                >
                    <path
                        d="m600 0c0 0 0 42 0 96 0 54-14.2 180.6-237.8 272-233.4 95.5-264.4 304.5-259.1 469.8 5.3 162.6 79.3 355.6 239 472.3 97.7 71.4 257.7 147.4 375.5 93.7 55.6-25.3 61.4-100.7 24.5-125.8-36.1-24.6-91.9-21.3-131.7 18-78 77.2-8.5 201.5-10.5 599.2-0.2 54.3 0.1 244.7 0.1 304.8"
                        style={{
                            fillOpacity: 0,
                            stroke: dark.value ? "#ffffff" : "#000000",
                            strokeWidth: 2,
                            strokeDasharray: "3223px",
                            strokeDashoffset: `${3223 * (1 - draw.value)}px`,
                        }}
                    />
                </svg>
                <div
                    style={{
                        position: "absolute",
                        width: narrow ? "95vw" : 1200,
                        display: "grid",
                        height: 0,
                        placeContent: "center",
                        alignItems: "center",
                        top: "38%",
                        ...(narrow ? { margin: "2.5vw", left: 0 } : {}),
                    }}
                >
                    <div style={{ isolation: "isolate", zIndex: 10 }}>
                        <Slot />
                    </div>
                </div>
            </div>
        </div>
    );
});

export const use_projects = routeLoader$(async (event) => {
    return await use_server_projects_2(event);
});

const Projects = component$(() => {
    const projects = use_projects();
    return (
        <div>
            <h2 style={{ fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 400, textAlign: "center", margin: 0 }}>
                All Projects
            </h2>
            <p style={{ textAlign: "center", margin: 0 }}>
                list of all my projects, you can check a live-preview or the codebase too
            </p>

            <div style={{ margin: "1.25rem 0" }}>
                <MainGrid>
                    {projects.value.map((pro) => {
                        if (pro.display_on_home) {
                            return <ProjectSummary key={pro.id} data={pro} />;
                        }
                    })}
                </MainGrid>
                <div style={{ paddingTop: "1.75rem", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
                    <InlineLink href="/projects" fontSize="1.5rem">
                        See All
                    </InlineLink>
                    <InlineLink href="/blog" fontSize="1.5rem">
                        Blog
                    </InlineLink>
                </div>
            </div>
        </div>
    );
});

const ContactMe = component$(() => {
    return (
        <div>
            <div
                style={{
                    height: "calc(100vh - 90px)",
                    display: "grid",
                    placeContent: "center",
                }}
            >
                <h2 style={{ textAlign: "center", fontSize: "3rem", lineHeight: 1, fontWeight: 400, margin: "0 0 0.5rem" }}>
                    Get in Contact
                </h2>
                <p style={{ textAlign: "center", fontSize: "1.5rem", lineHeight: "2rem", fontWeight: 100, margin: 0 }}>
                    <Slot name="message" />
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                    {links.map((item) => {
                        if (!item.Img) return;
                        return (
                            <a
                                href={item.href}
                                target="_blank"
                                key={item.text}
                                style={{
                                    cursor: "pointer",
                                    color: "#3b82f6",
                                    fontSize: 32,
                                    lineHeight: 1,
                                    textDecoration: "none",
                                    display: "inline-flex",
                                }}
                            >
                                <item.Img
                                    //@ts-ignore
                                    alt={item.text}
                                    style={{ width: 32, height: 32, fill: "currentColor" }}
                                />
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
