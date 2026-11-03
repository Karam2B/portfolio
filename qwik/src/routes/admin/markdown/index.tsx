/**
 * Catalog of custom markdown blocks (`:::name{...}`). Each entry is defined
 * next to its component in `~/components/markdown/custom_blocks`.
 * Examples stay closed until you open them.
 */

import { component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { custom_block_examples } from "~/components/markdown/custom_blocks";
import { lex_markdown } from "~/components/markdown/engine";
import { Marked } from "~/components/markdown/marked";
import { PrimaryButton } from "~/components/ui/primary_button";

const BlockExample = component$((props: { name: string; hint: string; example: string }) => {
    const open = useSignal(false);
    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 400, margin: 0 }}>
                <code>:::{props.name}</code>
            </h2>
            <p style={{ margin: 0, opacity: 0.75 }}>{props.hint}</p>
            <PrimaryButton compact onClick$={() => { open.value = !open.value; }}>
                {open.value ? "Hide example" : "Show example"}
            </PrimaryButton>
            {open.value && (
                <>
                    <pre style={{ overflowX: "auto", margin: 0, padding: "0.75rem 1rem", border: "1px solid currentColor", borderRadius: 8 }}>
                        <code>{props.example}</code>
                    </pre>
                    <div>
                        <div style={{ marginBottom: "0.35rem", opacity: 0.75 }}>Rendered</div>
                        <Marked content={lex_markdown(props.example)} nesting_level={0} />
                    </div>
                </>
            )}
        </section>
    );
});

export default component$(() => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
                <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: "0 0 0.5rem" }}>Markdown components</h1>
                <p style={{ margin: 0, opacity: 0.75 }}>
                    Custom blocks use their own lines: <code>:::name{"{attr=\"value\"}"}</code>, markdown body, then <code>:::</code>.
                </p>
            </div>

            {custom_block_examples.map((block) => (
                <BlockExample key={block.name} name={block.name} hint={block.hint} example={block.example} />
            ))}
        </div>
    );
});

export const head: DocumentHead = {
    title: "Markdown components",
};
