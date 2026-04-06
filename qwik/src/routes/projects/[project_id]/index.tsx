import { component$, useComputed$, useSignal, useStylesScoped$, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, StaticGenerateHandler, useLocation } from "@builder.io/qwik-city";
import { DisplayImage, StyleA } from "~/utils/components";
import { MoChevronRight } from "@qwikest/icons/monoicons";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { DateTime } from "luxon";
import { marked } from "marked";
import { one_project_2, all_projects_ids } from "~/utils/endpoint_2";
import { get_marked_engine, Marked } from "~/utils/marked_down";

export const use_project = routeLoader$(async (event) => {
    const id = event.params.project_id;
    let s = await one_project_2(event, Number(id), false);
    if (s.found === "none") {
        event.status(404);
    }
    return s
})

export default component$(() => {
    let project = use_project();
    let parse_content = useComputed$(() => {
        let m = get_marked_engine();
        let og = "";
        if (project.value.value) og = project.value.value.content;

        return m.lexer(og.replace(/\\n/g, "\n"));
    })

    if (project.value.found === "none") {
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
        <div class="markdown" >
            <Marked content={parse_content.value} nesting_level={0} />
        </div>
    </div>
})



export const onStaticGenerate: StaticGenerateHandler = async function ({ env }) {
    let params = await all_projects_ids(env)
    return { params: params.map((e) => ({ project_id: e.id.toString() })) }
}
function sanitizeHtml(arg0: any, arg1: { allowedTags: string[]; allowedAttributes: { a: string[]; img: string[]; }; }): string {
    throw new Error("Function not implemented.");
}

