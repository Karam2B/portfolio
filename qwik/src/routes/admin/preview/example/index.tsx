import { component$, useSignal } from "@builder.io/qwik"
import { get_marked_engine, Marked } from "~/utils/marked_down";

export default component$(() => {
    let s = useSignal(() => {
        let m = get_marked_engine();
        return m.lexer(`
> hello *world*
            `)
    })
    return <div>
        <Marked content={s.value} nesting_level={0} />
        <pre style={{ overflowX: "auto" }}>
            {JSON.stringify(s.value, null, 2)}
        </pre>
    </div>
})