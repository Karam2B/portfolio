import { component$ } from "@builder.io/qwik";
import { MainGrid, StyleA } from "~/utils/components";
import { use_projects } from "~/utils/endpoint";
import { ProjectSummary } from "~/utils/endpoint_view";
import { Illigal } from "~/utils/illegal";
import { MoArrowLeft } from "@qwikest/icons/monoicons";
import { Link } from "@builder.io/qwik-city";

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
                projects.value ? projects.value.map((p) => {
                    return <ProjectSummary key={p.id} data={p} />
                }) : <Illigal />
            }
        </MainGrid>
    </div >
})
