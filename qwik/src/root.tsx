import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./utils/router_head";
import "./utils/global.css";
import { component$, isDev } from "@builder.io/qwik";
import { Base } from "./utils/components";

export default component$(() => {
    return (
        <QwikCityProvider>
            <head>
                <meta charset="utf-8" />
                {!isDev && (
                    <link
                        rel="manifest"
                        href={`${import.meta.env.BASE_URL}manifest.json`}
                    />
                )}
                <RouterHead />
            </head>
            <body lang="en" class="font-sans">
                <Base>
                    <div class="min-h-screen">
                        <RouterOutlet />
                    </div>
                </Base>
            </body>
        </QwikCityProvider>
    );
});
