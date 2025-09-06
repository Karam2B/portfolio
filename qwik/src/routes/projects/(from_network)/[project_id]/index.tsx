import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { all_projects_ids, use_one_project } from "~/utils/endpoint";
import { StaticGenerateHandler, useLocation } from "@builder.io/qwik-city";
import { DisplayImage, StyleA } from "~/utils/components";
import { MoChevronRight } from "@qwikest/icons/monoicons";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { DateTime } from "luxon";

export default component$(() => {
    const { params } = useLocation();

    const num = Number(params["project_id"]);

    let project = use_one_project(num);

    if (!project.value || project.value.found === "none") {
        return <div class="w-[800px] max-w-[95vw] m-auto">
            <div class="h-[400px] flex flex-col items-center justify-center">
                <span class="text-7xl">
                    Project Not Found
                </span>
                <StyleA><div class="mt-4 flex gap-2"><a href="/">go home</a> | <a href="/projects">go to all project</a></div></StyleA>
            </div>
        </div>
    }


    return <div class="w-[500px] max-w-[95vw] m-auto">
        <div class="flex items-center gap-3 py-7 text-3xl">
            <StyleA>
                <a href="/">Home</a>
            </StyleA>
            <MoChevronRight />
            <StyleA>
                <a href="/projects">Project</a>
            </StyleA>
        </div>

        <div class="rounded-xl pb-5">
            <DisplayImage src={project.value.value.display_picture} />
        </div>
        <h1 class="text-3xl pb-0">{project.value.value.title}</h1>
        <p class="opacity-70">
            created at{" "}
            <time>
                {DateTime.fromISO(project.value.value.created_at).toFormat("LLL dd yyyy")}
            </time>
        </p>

        <div class="flex gap-3">
            {project.value.value.github_link && (
                <StyleA>
                    <a target="_blank" href={project.value.value.github_link}>
                        <Github
                            //@ts-ignore
                            height="16"
                            width="16"
                            class=" inline"
                        />{" "}
                        View Source Code
                    </a>

                </StyleA>
            )}
            {project.value.value.live_link && (
                <StyleA>
                    <a target="_blank" href={project.value.value.live_link} class="">
                        <Live //@ts-ignore
                            height="16"
                            width="16"
                            class="inline"
                        />{" "}
                        View Live Code
                    </a>
                </StyleA>
            )}
        </div>
        <div class="markdown" dangerouslySetInnerHTML={project.value.value.content} />
    </div>
})



export const onStaticGenerate: StaticGenerateHandler = async function({ env }) {
    let params = await all_projects_ids(env)
    return { params }
}
