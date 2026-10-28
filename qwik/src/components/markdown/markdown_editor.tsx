/**
 * Side-by-side markdown textarea and live preview for admin create/edit forms.
 *
 * Buttons and labeled inputs live in `~/components/ui`. This file is only the
 * editor: the textarea posts as `name="content"` so `routeAction$` can read it
 * with `form_field` from `~/lib/form_data`.
 */

import { component$, useComputed$, useSignal, useStylesScoped$, type Signal } from "@builder.io/qwik";
import { fieldStyle } from "~/components/ui/form_fields";
import { lex_markdown } from "./engine";
import { Marked } from "./marked";

/** Textarea on the left, rendered preview on the right from 960px wide. */
export const MarkdownField = component$((props: { text: Signal<string> }) => {
    const tokens = useComputed$(() => lex_markdown(props.text.value || ""));

    useStylesScoped$(`
        .editor {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            align-items: start;
        }
        @media (min-width: 960px) {
            .editor {
                grid-template-columns: 1fr 1fr;
            }
        }
        .stack {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }
        .hint {
            opacity: 0.7;
            font-size: 0.9rem;
        }
        .preview-label {
            margin-bottom: 0.35rem;
        }
        .preview {
            border: 1px solid currentColor;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            min-height: 200px;
        }
    `);

    return (
        <div class="editor">
            <label class="stack">
                Markdown
                <textarea
                    name="content"
                    rows={18}
                    bind:value={props.text}
                    style={{ ...fieldStyle, resize: "vertical", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
                />
                <span class="hint">
                    {'Insert a component on its own lines: :::note{title="Heads up"} then markdown, then :::'}
                </span>
            </label>
            <div>
                <div class="preview-label">Preview</div>
                <div class="preview">
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
