import { component$ } from "@builder.io/qwik";
import * as v from "valibot";
import { project_schema } from "./endpoint_2";
import { Link } from "@builder.io/qwik-city";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { DisplayImage, InlineA } from "./components";
import { usePrefersDark } from "./inline";

export const ProjectSummary = component$((props: {
    data: Omit<v.InferOutput<typeof project_schema>, "content">;
}) => {
    const dark = usePrefersDark();

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
                <Link href={"/projects/" + props.data.id} style={{ cursor: "pointer" }}>
                    <DisplayImage src={props.data.display_picture} ratio={66} />
                </Link>
            </div>
            <Link
                href={"/projects/" + props.data.id}
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
            <p
                style={{
                    margin: 0,
                    color: dark.value ? "rgba(226, 232, 240, 0.8)" : "rgba(51, 65, 85, 0.8)",
                }}
            >
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
