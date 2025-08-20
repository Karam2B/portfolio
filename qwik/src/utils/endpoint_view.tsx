import { component$ } from "@builder.io/qwik"
import * as  v from "valibot"
import { project_schema } from "./endpoint"
import { Link, useNavigate } from "@builder.io/qwik-city";
import Github from "~/../public/github.svg?jsx"
import Live from "~/../public/live.svg?jsx"
import { DisplayImage, StyleA } from "./components";

export const ProjectSummary = component$((props: { data: v.InferOutput<typeof project_schema> }) => {
    const _nav = useNavigate();

    return (
        <div>
            <div
                role="link"
                class=" rounded-lg shadow-md overflow-hidden mb-2"
            >
                {/* WARN_ING: nav function is not working! if DisplayImage have an `usemap` attribute this will not be valid HTML5!! */}
                <Link href={"/projects/" + props.data.id} class="cursor-pointer">
                    <DisplayImage
                        src={props.data.display_picture}
                        ratio={66}
                    />
                </Link>
            </div>
            <Link href={"/projects/" + props.data.id} class="text-2xl font-300 cursor-pointer">
                {props.data.title}
            </Link>
            <p class=" text-slate-700/80 dark:text-slate-200/80">{props.data.summary}</p>
            <div>
                <div class="mt-2 flex gap-2">
                    {props.data.github_link && (
                        <StyleA >
                            <a
                                target="_blank"
                                href={props.data.github_link}
                                class="a"
                                aria-label="view code on GitHub"
                            >
                                <Github
                                    //@ts-ignore
                                    height="24"
                                    width="24"
                                    class="fill-as-a inline"
                                />
                            </a>
                        </StyleA>
                    )}
                    {props.data.live_link && (

                        <StyleA >
                            <a
                                target="_blank"
                                href={props.data.live_link}
                                class="a"
                                aria-label="view live demo"
                            >
                                <Live //@ts-ignore
                                    height="24"
                                    width="24"
                                    class="fill-as-a inline"
                                />
                            </a>

                        </StyleA>
                    )}
                </div>
            </div>
        </div>
    );
})


