import { Slot, component$, useComputed$, useSignal, useStylesScoped$, type QRL, type Signal } from "@builder.io/qwik";
import { get_marked_engine, Marked } from "./marked_down";
import { useViewport } from "./inline";

export const fieldStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "0.6rem 0.75rem",
    font: "inherit",
    color: "inherit",
    background: "transparent",
    border: "1px solid currentColor",
    borderRadius: 8,
};

export const PrimaryButton = component$((props: {
    type?: "button" | "submit";
    disabled?: boolean;
    compact?: boolean;
    danger?: boolean;
    onClick$?: QRL<() => void>;
}) => {
    // Flashing Colors When Opening Page:
    // Button fill used to depend on usePrefersDark after first paint.
    useStylesScoped$(`
        .btn {
            width: fit-content;
            cursor: pointer;
            border: none;
            border-radius: 8px;
            padding: 0.55rem 1rem;
            font: inherit;
        }
        .btn:disabled {
            opacity: 0.6;
            cursor: default;
        }
        .btn.compact {
            padding: 0.3rem 0.65rem;
        }
        @media (prefers-color-scheme: light) {
            .btn {
                background: #000000;
                color: #ffffff;
            }
            .btn.danger {
                background: #b91c1c;
                color: #ffffff;
            }
        }
        @media (prefers-color-scheme: dark) {
            .btn {
                background: #ffffff;
                color: #000000;
            }
            .btn.danger {
                background: #7f1d1d;
                color: #ffffff;
            }
        }
        .force_scheme_to_light.btn {
            background: #000000;
            color: #ffffff;
        }
        .force_scheme_to_light.btn.danger {
            background: #b91c1c;
            color: #ffffff;
        }
        .force_scheme_to_dark.btn {
            background: #ffffff;
            color: #000000;
        }
        .force_scheme_to_dark.btn.danger {
            background: #7f1d1d;
            color: #ffffff;
        }
    `);
    const classes = ["btn"];
    if (props.compact) classes.push("compact");
    if (props.danger) classes.push("danger");
    return (
        <button
            class={classes.join(" ")}
            type={props.type || "button"}
            disabled={props.disabled}
            onClick$={props.onClick$}
        >
            <Slot />
        </button>
    );
});

export const MarkdownField = component$((props: { text: Signal<string> }) => {
    const viewport = useViewport();
    const tokens = useComputed$(() => {
        return get_marked_engine().lexer((props.text.value || "").replace(/\\n/g, "\n"));
    });
    const twoColumns = viewport.value.width >= 960;

    return (
        <div style={{ display: "grid", gridTemplateColumns: twoColumns ? "1fr 1fr" : "1fr", gap: "1rem", alignItems: "start" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                Markdown
                <textarea name="content" rows={18} bind:value={props.text} style={{ ...fieldStyle, resize: "vertical", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }} />
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

export function save_error(error: unknown) {
    console.error(error);
    if (error instanceof Error && error.message === "database is not configured") {
        return "The database is not configured for writing.";
    }
    if (error instanceof Error && error.message === "not found") return "That record was not found.";
    return "Could not save.";
}

export function form_field(value: unknown) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    return "";
}

export function form_bool(value: unknown) {
    const raw = form_field(value);
    return raw === "true" || raw === "on" || raw === "1";
}

export const CheckField = component$((props: { name: string; label: string; checked: boolean }) => {
    const on = useSignal(props.checked);
    return (
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
                type="checkbox"
                name={props.name}
                value="true"
                checked={on.value}
                onChange$={(_, el) => {
                    on.value = (el as HTMLInputElement).checked;
                }}
            />
            {props.label}
        </label>
    );
});

export const ContentDraft = component$((props: { initial: string }) => {
    const text = useSignal(props.initial);
    return <MarkdownField text={text} />;
});
