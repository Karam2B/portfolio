/**
 * App shell. Qwik City mounts this once; pages live under `src/routes`.
 *
 * Where to put new code:
 *   routes/          A page, loader, or action (file-based routing). No SQL here.
 *   components/ui/   Reusable primitives: links, buttons, form fields, images.
 *   components/      Feature UI: blog/, project/, markdown/, layout/, home/.
 *   hooks/           Browser-only Qwik hooks (viewport, local admin token).
 *   lib/             Pure helpers that run on server or browser (theme, dates, slugs).
 *   server/db/       Every SQL statement, one file per table (projects.ts, blogs.ts).
 *   server/          Other server-only code: auth.ts, media.ts (S3). Never import
 *                    these from components except with `import type`.
 *   experimental/    Unused experiments. Production queries are in server/db/.
 */

import { DocumentHead, QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { component$, isDev, useStylesScoped$ } from "@builder.io/qwik";
import { RouterHead } from "~/components/layout/router_head";
import { Base } from "~/components/layout/base";
import { SANS } from "~/lib/theme";

export default component$(() => {
    // Flashing Colors When Opening Page:
    // Body background/color used to wait for usePrefersDark after hydration.
    useStylesScoped$(`
        .root {
            margin: 0;
            font-family: ${SANS};
            font-weight: 400;
            line-height: 1.5;
        }
        @media (prefers-color-scheme: light) {
            .root {
                background: #ffffff;
                color: #000000;
            }
        }
        @media (prefers-color-scheme: dark) {
            .root {
                background: #05060a;
                color: #ffffff;
            }
        }
        .force_scheme_to_light .root {
            background: #ffffff;
            color: #000000;
        }
        .force_scheme_to_dark .root {
            background: #05060a;
            color: #ffffff;
        }
    `);
    return (
        <QwikCityProvider>
            <head>
                <title>Karam's Portfolio</title>
                <meta charset="utf-8" />
                {!isDev && (
                    <link
                        rel="manifest"
                        href={`${import.meta.env.BASE_URL}manifest.json`}
                    />
                )}
                <RouterHead />
            </head>
            <body class="root" lang="en">
                <Base>
                    <div style={{ minHeight: "100vh" }}>
                        <RouterOutlet />
                    </div>
                </Base>
            </body>
        </QwikCityProvider>
    );
});

export const head: DocumentHead = {
    title: "Karam's Portfolio",
    meta: [
        { name: "description", content: "Karam's Portfolio" },
    ],
    links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
};
