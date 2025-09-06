import { Slot, component$, useComputed$, useStylesScoped$ } from "@builder.io/qwik";
import Github from "~/../public/github.svg?jsx";
import Live from "~/../public/live.svg?jsx";
import { MoChevronRight } from "@qwikest/icons/monoicons";
import { DateTime } from "luxon";
import { DisplayImage, StyleA } from "~/utils/components";
import * as v from "valibot";
import { project_schema } from "~/utils/endpoint";
import { StaticGenerateHandler, useLocation } from "@builder.io/qwik-city";


type ProjectData = Omit<v.InferOutput<typeof project_schema>, "content" | "id">;

export const all_custom_projects: { url_name: string, rest: ProjectData }[] = [
    {
        url_name: "web_matric_and_vital",
        rest: {
            title: "Private local-first progressive web app2",
            summary: "newlkjlkjd",
            skills: [],
            live_link: null,
            github_link: null,
            created_at: "2023-12-04T19:45:14.000Z",
            display_picture: null
        },
    }
]


export default component$(() => {
    const params = useLocation();

//     useStylesScoped$(`
// .markdown > :global(*) { margin-bottom: 0.5em }
// .markdown > :global(h1) { font-size: var(--text-3xl); line-height: var(--tw-leading, var(--text-3xl--line-height)) } }
// .markdown > :global(h2) { margin-bottom: 0.5em }
// .markdown > :global(h3) { margin-bottom: 0.5em }
// `)

    const project = useComputed$(() => {
        const url_name_ = params.url.pathname.split("/");
        let last;
        let maybe_last = url_name_[url_name_.length - 1];
        if (maybe_last === "") {
            last = url_name_[url_name_.length - 2]
        } else {
            last = maybe_last
        }
        const project = all_custom_projects.find((e) => { return e.url_name === last });
        if (!project) throw new Error("panic")
        return { last, project: project.rest }
    })

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
            <DisplayImage src={project.value.project.display_picture} />
        </div>
        <h1 class="text-3xl pb-0">{project.value.project.title}</h1>
        <p class="opacity-70">
            created at{" "}
            <time>
                {DateTime.fromISO(project.value.project.created_at).toFormat("LLL dd yyyy")}
            </time>
        </p>

        <div class="flex gap-3">
            {project.value.project.github_link && (
                <StyleA>
                    <a target="_blank" href={project.value.project.github_link}>
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
            {project.value.project.live_link && (
                <StyleA>
                    <a target="_blank" href={project.value.project.live_link} class="">
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
        <div class="markdown">
            <Slot />
        </div>
    </div>
})

export const onStaticGenerate: StaticGenerateHandler = function() {
    let params = all_custom_projects.map((e) => ({ project_name: e.url_name }))
    return { params }
}
