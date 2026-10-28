/** Same chrome as `/projects`. */

import { Slot, component$ } from "@builder.io/qwik";

export default component$(() => {
    return (
        <div style={{ minHeight: "100vh" }}>
            <div style={{ isolation: "isolate" }}>
                <Slot />
                <div style={{ minHeight: 120 }} />
            </div>
        </div>
    );
});
