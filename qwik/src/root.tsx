import { DocumentHead, QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./utils/router_head";
import { component$, isDev, useStylesScoped$ } from "@builder.io/qwik";
import { Base } from "./utils/components";
import { SANS } from "./utils/inline";


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
                background: #1e293b;
                color: #ffffff;
            }
        }
        .force_scheme_to_light.root {
            background: #ffffff;
            color: #000000;
        }
        .force_scheme_to_dark.root {
            background: #1e293b;
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
    ]
}
