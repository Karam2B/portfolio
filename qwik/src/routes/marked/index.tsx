import { component$, useSignal, useStylesScoped$, useTask$ } from "@builder.io/qwik";
import { marked } from "marked"

export default component$(() => {
    const md = useSignal<{ parse: boolean, value: string }>({ parse: false, value: "hello worl" });
    useTask$(async () => {
        if (md.value.parse === true) return

        let value = await marked.parse(`# Hi
<hello>hi</hello>
`);

        md.value = { parse: true, value }
    })

useStylesScoped$(`
:global(h1) { color: blue }
:global(hello) { color: red }
`)

    return <>{md.value.parse ? <div dangerouslySetInnerHTML={md.value.value} /> : <div >ii</div>}</>
})
