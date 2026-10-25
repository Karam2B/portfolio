import { component$, useStylesScoped$ } from "@builder.io/qwik";
import * as v from "valibot";
import { project_schema } from "./endpoint_2";
import { Link } from "@builder.io/qwik-city";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { DisplayImage, InlineA } from "./components";

export const ProjectSummary = component$((props: {
    data: Omit<v.InferOutput<typeof project_schema>, "content">;
    href?: string;
}) => {
    const href = props.href ?? "/projects/" + props.data.snake_case_id;

    // Flashing Colors When Opening Page:
    // Summary text contrast used to wait on usePrefersDark.
    useStylesScoped$(`
        .summary {
            margin: 0;
        }
        @media (prefers-color-scheme: light) {
            .summary { color: rgba(51, 65, 85, 0.8); }
        }
        @media (prefers-color-scheme: dark) {
            .summary { color: rgba(226, 232, 240, 0.8); }
        }
        .force_scheme_to_light .summary { color: rgba(51, 65, 85, 0.8); }
        .force_scheme_to_dark .summary { color: rgba(226, 232, 240, 0.8); }
    `);

    return (
        <div>

            <div
                role="link"
                style={{
                    borderRadius: 8,
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    overflow: "hidden",
                    marginBottom: "0.5rem",
                }}
            >
                <Link href={href} style={{ cursor: "pointer" }}>
                    <DisplayImage src={props.data.display_picture} ratio={66} />
                </Link>
            </div>

            <Link
                href={href}
                style={{
                    fontSize: "1.5rem",
                    lineHeight: "2rem",
                    fontWeight: 300,
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "none",
                }}
            >
                {props.data.title}
            </Link>
            <p class="summary">
                {props.data.summary}
            </p>
            <div>
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                    {props.data.github_link && (
                        <InlineA href={props.data.github_link} target="_blank" ariaLabel="view code on GitHub">
                            <Github
                                //@ts-ignore
                                height="24"
                                width="24"
                                style={{ fill: "currentColor", display: "inline", width: 24, height: 24 }}
                            />
                        </InlineA>
                    )}
                    {props.data.live_link && (
                        <InlineA href={props.data.live_link} target="_blank" ariaLabel="view live demo">
                            <Live
                                //@ts-ignore
                                height="24"
                                width="24"
                                style={{ fill: "currentColor", display: "inline", width: 24, height: 24 }}
                            />
                        </InlineA>
                    )}
                </div>
            </div>
        </div>
    );
});
