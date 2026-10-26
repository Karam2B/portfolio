import { component$, useSignal } from "@builder.io/qwik"
import { lex_markdown } from "~/components/markdown/engine";
import { Marked } from "~/components/markdown/marked";

export default component$(() => {
    const s = useSignal(() => {
        return lex_markdown(`
> hello *world*
            `);
    });
    return <div>
        <Marked content={s.value} nesting_level={0} />
        <pre style={{ overflowX: "auto" }}>
            {JSON.stringify(s.value, null, 2)}
        </pre>
    </div>
})