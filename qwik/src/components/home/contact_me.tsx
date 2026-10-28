/**
 * Contact section: heading, message, and icon links from `~/lib/profile_links`.
 * The page passes `title` and `message`; icons stay the same on home and `/link`.
 */

import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { BLUE, BLUE_DARK, BLUE_HOVER } from "~/lib/theme";
import { links } from "~/lib/profile_links";

export const ContactMe = component$((props: { title: string; message: string }) => {
    useStylesScoped$(`
        .section {
            display: grid;
            place-content: center;
            justify-items: center;
            box-sizing: border-box;
            width: 100%;
            min-height: calc(100svh - 90px);
            padding: 4rem 1.25rem;
        }
        /* Narrow / short view: a fixed viewport height + centering overflows
           into Projects above and the footer below, and the copy sinks off-screen. */
        @media (max-width: 480px), (max-height: 600px) {
            .section {
                min-height: 0;
                padding: 3.5rem 1.25rem 4.5rem;
            }
        }
        .title {
            text-align: center;
            font-size: clamp(2rem, 8vw, 3rem);
            line-height: 1.15;
            font-weight: 400;
            margin: 0 0 0.5rem;
            max-width: 100%;
        }
        .message {
            text-align: center;
            font-size: clamp(1.125rem, 4vw, 1.5rem);
            line-height: 1.4;
            font-weight: 100;
            margin: 0;
            max-width: 28rem;
        }
        .icons {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
        }
        .icon {
            cursor: pointer;
            font-size: 32px;
            line-height: 1;
            text-decoration: none;
            display: inline-flex;
        }
        .icon :global(svg) {
            width: 32px;
            height: 32px;
            fill: currentColor;
        }
        @media (prefers-color-scheme: light) {
            .icon { color: ${BLUE}; }
            .icon:hover { color: ${BLUE_HOVER}; }
        }
        @media (prefers-color-scheme: dark) {
            .icon { color: ${BLUE_DARK}; }
            .icon:hover { color: ${BLUE}; }
        }
        .force_scheme_to_light .icon { color: ${BLUE}; }
        .force_scheme_to_light .icon:hover { color: ${BLUE_HOVER}; }
        .force_scheme_to_dark .icon { color: ${BLUE_DARK}; }
        .force_scheme_to_dark .icon:hover { color: ${BLUE}; }
    `);

    return (
        <div class="section">
            <h2 class="title">{props.title}</h2>
            <p class="message">{props.message}</p>
            <div class="icons">
                {links.map((item) => {
                    if (!item.Img) return;
                    return (
                        <a class="icon" href={item.href} target="_blank" key={item.text} aria-label={item.text}>
                            <item.Img />
                        </a>
                    );
                })}
            </div>
        </div>
    );
});
