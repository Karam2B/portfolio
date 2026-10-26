/**
 * Side-by-side markdown textarea and live preview for admin create/edit forms.
 *
 * Buttons and labeled inputs live in `~/components/ui`. This file is only the
 * editor: the textarea posts as `name="content"` so `routeAction$` can read it
 * with `form_field` from `~/lib/form_data`.
 */

import { component$, useComputed$, useSignal, type Signal } from "@builder.io/qwik";
import { fieldStyle } from "~/components/ui/form_fields";
import { useViewport } from "~/hooks/use_viewport";
import { lex_markdown } from "./engine";
import { Marked } from "./marked";

/** Textarea on the left, rendered preview on the right from 960px wide. */
export const MarkdownField = component$((props: { text: Signal<string> }) => {
    const viewport = useViewport();
    const tokens = useComputed$(() => lex_markdown(props.text.value || ""));
    const twoColumns = viewport.value.width >= 960;

    return (
        <div style={{ display: "grid", gridTemplateColumns: twoColumns ? "1fr 1fr" : "1fr", gap: "1rem", alignItems: "start" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Markdown
                <textarea
                    name="content"
                    rows={18}
                    bind:value={props.text}
                    style={{ ...fieldStyle, resize: "vertical", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
                />
                <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                    {'Insert a component on its own lines: :::note{title="Heads up"} then markdown, then :::'}
                </span>
            </label>
            <div>
                <div style={{ marginBottom: "0.35rem" }}>Preview</div>
                <div style={{ border: "1px solid currentColor", borderRadius: 8, padding: "0.75rem 1rem", minHeight: 200 }}>
                    <Marked content={tokens.value} nesting_level={0} />
                </div>
            </div>
        </div>
    );
});

/** Uncontrolled wrapper: owns the draft signal and seeds it from `initial`. */
export const ContentDraft = component$((props: { initial: string }) => {
    const text = useSignal(props.initial);
    return <MarkdownField text={text} />;
});
