import { Slot, component$ } from "@builder.io/qwik";

export default component$(() => {
    return (
        <div style={{ minHeight: "100vh" }}>
            <Slot />
        </div>
    );
});
