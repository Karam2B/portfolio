import { Slot, component$, useStylesScoped$, type QRL } from "@builder.io/qwik";

/**
 * Solid button that inverts with the color scheme (black on light, white on dark).
 * - `compact`: smaller padding, for buttons inside cards and rows.
 * - `danger`: red, for destructive actions such as delete.
 * Defaults to `type="button"`; pass `type="submit"` inside a `<Form>`.
 */
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
        .force_scheme_to_light .btn {
            background: #000000;
            color: #ffffff;
        }
        .force_scheme_to_light .btn.danger {
            background: #b91c1c;
            color: #ffffff;
        }
        .force_scheme_to_dark .btn {
            background: #ffffff;
            color: #000000;
        }
        .force_scheme_to_dark .btn.danger {
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
