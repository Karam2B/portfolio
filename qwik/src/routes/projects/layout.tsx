import { Slot, component$ } from "@builder.io/qwik";
import { Flare } from "~/utils/Flare";

export default component$(() => {
    return <div style={{ minHeight: "100vh" }}>
        <Flare shift={-200} />
        <div style={{ isolation: "isolate" }}>
            <Slot />
            <div style={{ minHeight: 120 }} />
        </div>
    </div>
})
