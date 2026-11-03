/**
 * Resume page. One-off layout uses inline styles. Repeated tags are
 * components in this file. Fonts live in `public/fonts` (SIL OFL).
 */

import { Slot, component$, useStyles$, useStylesScoped$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { BsDownload } from "@qwikest/icons/bootstrap";

const BLACK = "#000000";
const GREY = "#666666";
const BLUE = "#2079c7";
const SERIF = '"Merriweather", Georgia, serif';
const SANS = '"Open Sans", Arial, sans-serif';
const ROBOTO = '"Roboto", Arial, sans-serif';
const BODY_LH = "14.2pt";

export default component$(() => {
    // Cover the document canvas so the site's dark body never shows in gutters
    // or overscroll. Unmounts when leaving /resume.
    useStyles$(`
        html, body {
            background: #e8eaed !important;
            color-scheme: light;
        }
        @font-face { font-family: "Merriweather"; font-style: normal; font-weight: 400; src: url("/fonts/merriweather-latin-400-normal.woff2") format("woff2"); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
        @font-face { font-family: "Merriweather"; font-style: normal; font-weight: 400; src: url("/fonts/merriweather-latin-ext-400-normal.woff2") format("woff2"); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
        @font-face { font-family: "Merriweather"; font-style: italic; font-weight: 400; src: url("/fonts/merriweather-latin-400-italic.woff2") format("woff2"); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
        @font-face { font-family: "Merriweather"; font-style: italic; font-weight: 400; src: url("/fonts/merriweather-latin-ext-400-italic.woff2") format("woff2"); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
        @font-face { font-family: "Merriweather"; font-style: normal; font-weight: 700; src: url("/fonts/merriweather-latin-700-normal.woff2") format("woff2"); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
        @font-face { font-family: "Merriweather"; font-style: normal; font-weight: 700; src: url("/fonts/merriweather-latin-ext-700-normal.woff2") format("woff2"); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
        @font-face { font-family: "Open Sans"; font-style: normal; font-weight: 400; src: url("/fonts/open-sans-latin-400-normal.woff2") format("woff2"); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
        @font-face { font-family: "Open Sans"; font-style: normal; font-weight: 400; src: url("/fonts/open-sans-latin-ext-400-normal.woff2") format("woff2"); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
        @font-face { font-family: "Open Sans"; font-style: normal; font-weight: 700; src: url("/fonts/open-sans-latin-700-normal.woff2") format("woff2"); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
        @font-face { font-family: "Open Sans"; font-style: normal; font-weight: 700; src: url("/fonts/open-sans-latin-ext-700-normal.woff2") format("woff2"); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
        @font-face { font-family: "Roboto"; font-style: normal; font-weight: 400; src: url("/fonts/roboto-latin-400-normal.woff2") format("woff2"); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
        @font-face { font-family: "Roboto"; font-style: normal; font-weight: 400; src: url("/fonts/roboto-latin-ext-400-normal.woff2") format("woff2"); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
        @font-face { font-family: "Roboto"; font-style: italic; font-weight: 400; src: url("/fonts/roboto-latin-400-italic.woff2") format("woff2"); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
        @font-face { font-family: "Roboto"; font-style: italic; font-weight: 400; src: url("/fonts/roboto-latin-ext-400-italic.woff2") format("woff2"); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }

        @page { size: letter; margin: 0; }

        button svg {
            width: 1.15rem;
            height: 1.15rem;
        }
        button:hover {
            background: #222222 !important;
        }

        @media print {
            html, body {
                background: #ffffff !important;
                min-height: 0 !important;
            }
            [data-resume] {
                background: none !important;
                padding: 0 !important;
                min-height: 0 !important;
                width: auto !important;
            }
            [data-resume-toolbar],
            button {
                display: none !important;
            }
            main {
                margin: 0 !important;
                box-shadow: none !important;
            }
        }
    `);

    return (
        <div
            data-resume
            style={{
                background: "#e8eaed",
                minHeight: "100dvh",
                width: "max(100%, calc(612pt + 24px))",
                color: BLACK,
                padding: "24pt 12px",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
                boxSizing: "border-box",
            }}
        >
            <div
                data-resume-toolbar
                style={{
                    position: "sticky",
                    top: "0",
                    left: "0",
                    zIndex: 2,
                    width: "612pt",
                    display: "flex",
                    justifyContent: "start",
                    margin: "auto",
                    padding: "12px 0",
                }}
            >
                <button
                    type="button"
                    onClick$={() => window.print()}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.45rem",
                        width: "fit-content",
                        padding: "0.55rem 1rem",
                        border: "none",
                        borderRadius: "6px",
                        background: "rgb(71, 71, 71)",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontFamily: SANS,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        lineHeight: 1,
                    }}
                >
                    <BsDownload />
                    Download PDF
                </button>
            </div>
            <main
                style={{
                    width: "612pt",
                    height: "792pt",
                    margin: "0 auto",
                    padding: "48.5pt 48.9pt 0 49.2pt",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(60, 64, 67, .3), 0 4px 8px 3px rgba(60, 64, 67, .15)",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: "330pt 155.4pt",
                    gridTemplateRows: "minmax(121.5pt, auto) auto",
                    columnGap: "28.5pt",
                    alignContent: "start",
                    alignItems: "start",
                    boxSizing: "border-box",
                }}
            >

                <header>
                    <h1
                        style={{
                            margin: "0.4pt 0 0",
                            padding: 0,
                            font: `700 36pt/1.257 ${SERIF}`,
                            color: BLACK,
                        }}
                    >
                        Karam Barakat
                    </h1>
                    <Tagline>
                        Full-stack developer focused on building fast, reliable web applications with real users -- from UI to infrastructure
                    </Tagline>
                    <Tagline>
                        Available to work in the US <span style={{ fontWeight: 700 }}>without</span> a sponsorship
                    </Tagline>
                </header>

                <aside
                    style={{
                        color: BLACK,
                        fontSize: "9pt",
                        lineHeight: "12.75pt",
                    }}
                >
                    <p style={{ margin: 0, padding: 0, fontFamily: SANS }}>San Francisco, CA</p>
                    <p style={{ margin: 0, padding: 0, fontFamily: SANS, fontWeight: 700 }}>kb.karam.barakat@gmail.com</p>
                    <p style={{ margin: 0, padding: 0, fontFamily: ROBOTO }}>(415) 919-0440</p>
                    <p style={{ margin: "12.75pt 0 0", padding: 0, fontFamily: ROBOTO }}>More information: visit my portfolio</p>
                    <p style={{ margin: 0, padding: 0, fontFamily: ROBOTO }}>www.karam.page</p>
                </aside>

                <div>
                    <Section>
                        <SectionTitle>Education</SectionTitle>
                        <Entry>
                            <EntryTitle>San Francisco State University,<span style={{ fontWeight: 400 }}> CA</span></EntryTitle>
                            <p
                                style={{
                                    margin: 0,
                                    padding: 0,
                                    font: `italic 400 11pt/13.4pt ${ROBOTO}`,
                                    color: BLACK,
                                }}
                            >
                                Bachelor of Computer Engineering
                            </p>
                            <EntryMeta>{"September 2024 - May 2028\nGPA: 3.85"}</EntryMeta>
                        </Entry>
                    </Section>

                    <Section>
                        <SectionTitle>Experience</SectionTitle>
                        <Entry>
                            <EntryTitle>Freelancing <span style={{ fontWeight: 400, fontStyle: "italic" }}>— Frontend Developer</span></EntryTitle>
                            <EntryMeta>February 2022 - PRESENT</EntryMeta>
                            <EntryBody>
                                <p>- Built and shipped 50+ production React pages used by real clients.</p>
                                <p>- Worked with designers and backend developers to deliver features <span style={{ whiteSpace: "nowrap" }}>end-to-end.</span></p>
                                <p>- Owned features from UI implementation to API integration.</p>
                            </EntryBody>
                        </Entry>
                    </Section>

                    <Section>
                        <SectionTitle>Projects</SectionTitle>
                        <Entry>
                            <EntryTitle>Expenses Tracker</EntryTitle>
                            <EntryMeta>tracker.karam.page   –    github.com/karambarakat/MoneyTracker</EntryMeta>
                            <EntryBody>A full-stack CRUD application is written in React, Rust, and SQL. It has email/google authentication, CI/CD pipeline, end-to-end testing, Terraform, and more.</EntryBody>
                        </Entry>
                        <Entry>
                            <EntryTitle>Open-source CMS in Rust.</EntryTitle>
                            <EntryMeta>github.com/Karam2B/linked-ql  –  crates.io/crates/linked-ql</EntryMeta>
                            <EntryBody>I maintain an open-source content-management-system CMS that focuses on performance and customizability.</EntryBody>
                        </Entry>
                        <Entry>
                            <EntryTitle>Todo App</EntryTitle>
                            <EntryMeta>doiter.karam.page – github.com/karambarakat/doiter</EntryMeta>
                            <EntryBody>A lightweight task management application focused on simplicity and offline ownership of data.</EntryBody>
                        </Entry>
                    </Section>
                </div>

                <div>
                    <Section>
                        <SectionTitle>Skills</SectionTitle>
                        <div style={{ marginTop: "17.53pt" }}>
                            <SkillGroup category="Languages:" items={["Python", "Rust", "TypeScript", "SQL"]} />
                            <SkillGroup category="Backend & APIs:" items={["Django", "Spring Boot", "Prisma"]} />
                            <SkillGroup category="Frontend" items={["React", "Next.js", "Tailwind CSS", "Storybook"]} />
                            <SkillGroup category="Databases:" items={["PostgreSQL", "MongoDB"]} />
                            <SkillGroup category="Cloud & DevOps:" items={["AWS", "Docker", "Terraform", "GitHub Actions"]} />
                            <SkillGroup category="Development & Testing Tools:" items={["Git, GitHub", "Playwright", "Figma"]} />
                        </div>
                    </Section>
                </div>

            </main>
        </div>
    );
});

export const head: DocumentHead = {
    title: "Resume - Karam Barakat",
};

const Tagline = component$(() => {
    useStylesScoped$(`
        p {
            margin: 3.9pt 0 0;
            padding: 0;
            font: 400 9pt/12.8pt ${SANS};
            color: ${BLACK};
        }
    `);
    return (
        <p>
            <Slot />
        </p>
    );
});

const Section = component$(() => {
    useStylesScoped$(`
        section {
            margin: 0;
            padding: 0;
        }
        section + section {
            margin-top: 30pt;
        }
    `);
    return (
        <section>
            <Slot />
        </section>
    );
});

const SectionTitle = component$(() => {
    useStylesScoped$(`
        h2 {
            margin: 0;
            padding: 0;
            font: 700 9pt/12.8pt ${SANS};
            color: ${BLUE};
            text-transform: uppercase;
        }
    `);
    return (
        <h2>
            <Slot />
        </h2>
    );
});

const Entry = component$(() => {
    useStylesScoped$(`
        div {
            margin-top: 14.67pt;
        }
        div + div {
            margin-top: 17.46pt;
        }
    `);
    return (
        <div>
            <Slot />
        </div>
    );
});

const EntryTitle = component$(() => {
    useStylesScoped$(`
        h3 {
            margin: 0;
            padding: 0;
            font: 700 11pt/13.83pt ${SERIF};
            color: ${BLACK};
        }
    `);
    return (
        <h3>
            <Slot />
        </h3>
    );
});

const EntryMeta = component$(() => {
    useStylesScoped$(`
        p {
            margin: 4.6pt 0 0;
            padding: 0;
            font: 400 8pt/9.2pt ${SANS};
            color: ${GREY};
            letter-spacing: -0.17pt;
            white-space: pre-wrap;
        }
    `);
    return (
        <p>
            <Slot />
        </p>
    );
});

const EntryBody = component$(() => {
    useStylesScoped$(`
        div {
            margin-top: 4.72pt;
            font: 400 9pt/${BODY_LH} ${SERIF};
            color: ${GREY};
        }
        div :global(p) {
            margin: 0;
            padding: 0;
        }
    `);
    return (
        <div>
            <Slot />
        </div>
    );
});

const SkillGroup = component$((props: { category: string; items: string[] }) => {
    useStylesScoped$(`
        div + div {
            margin-top: 12.1pt;
        }
        h3 {
            margin: 0;
            padding: 0;
            font: 700 9pt/14.22pt ${SERIF};
            color: ${GREY};
        }
        ul {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        li {
            font: 400 9pt/14.22pt ${SERIF};
            color: ${GREY};
        }
        li::before {
            content: "- ";
        }
    `);
    return (
        <div>
            <h3>{props.category}</h3>
            <ul>
                {props.items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
});

