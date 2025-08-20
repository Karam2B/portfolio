import { component$ } from "@builder.io/qwik"

export const Illigal = component$(() => {
    if (import.meta.env.DEV) {
        return <div>error</div>
    } else {
        throw new Error("illigal")
    }
})
