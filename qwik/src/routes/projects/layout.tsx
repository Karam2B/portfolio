import { Slot, component$ } from "@builder.io/qwik";
import { Flare } from "~/utils/Flare";

export default component$(() => {
    return <div class="min-h-screen">
        <Flare shift={-200} />
        <div style={{ isolation: "isolate" }}>
            <Slot />
        </div>
    </div>
})
