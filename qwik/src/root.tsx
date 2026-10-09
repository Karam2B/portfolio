import { DocumentHead, QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./utils/router_head";
import { component$, isDev } from "@builder.io/qwik";
import { Base } from "./utils/components";
import { SANS, usePrefersDark } from "./utils/inline";


export default component$(() => {
    const dark = usePrefersDark();
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
            <body
                lang="en"
                style={{
                    margin: 0,
                    fontFamily: SANS,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    background: dark.value ? "#1e293b" : "#ffffff",
                    color: dark.value ? "#ffffff" : "#000000",
                }}
            >
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
