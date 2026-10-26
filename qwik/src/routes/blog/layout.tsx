/** Full-height wrapper for `/blog` and `/blog/:id`. Public chrome is `<BlogFrame>`. */

import { Slot, component$ } from "@builder.io/qwik";

export default component$(() => {
    return (
        <div style={{ minHeight: "100vh" }}>
            <Slot />
        </div>
    );
});
