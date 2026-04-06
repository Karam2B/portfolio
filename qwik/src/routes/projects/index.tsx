import { component$ } from "@builder.io/qwik";
import { MainGrid, StyleA } from "~/utils/components";
import { ProjectSummary } from "~/utils/endpoint_view";
import { Illigal } from "~/utils/illegal";
import { MoArrowLeft } from "@qwikest/icons/monoicons";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import { use_server_projects_2 } from "~/utils/endpoint_2";

export const use_projects = routeLoader$(async (event) => {
    return await use_server_projects_2(event);
})

export default component$(() => {
    const projects = use_projects();
    return <div >
        <div class="flex items-center gap-3 w-[800px] max-w-[90vw] m-auto py-7 text-3xl cursor-pointer">
            <StyleA>
                <Link href="/">
                    <MoArrowLeft />
                </Link>
            </StyleA>
            <StyleA>
                <Link href="/">
                    <span>Go Home</span>
                </Link>
            </StyleA>
        </div>
        <MainGrid>
            {
                projects.value.map((p) => {
                    return <ProjectSummary key={p.id} data={p} />
                })
            }
        </MainGrid>
    </div >
})
