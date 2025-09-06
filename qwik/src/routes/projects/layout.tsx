import { Slot, component$ } from "@builder.io/qwik";
import { Flare } from "~/utils/Flare";
import Css from "./markdown.css?raw"

export default component$(() => {
    return <div class="min-h-screen">
        <style dangerouslySetInnerHTML={Css} />
        <Flare shift={-200} />
        <div style={{ isolation: "isolate" }}>
            <Slot />
            <div class="min-h-[120px]" />
        </div>
    </div>
})
