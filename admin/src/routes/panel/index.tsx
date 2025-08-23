import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <div class="flex flex-col">
        <a href="/panel/add_project">add project</a>
        <a href="/panel/project_update">update project</a>

        <a href="/panel/add_skill">add skill</a>
        <a href="/panel/skill_update">update skill</a>
    </div>
})
