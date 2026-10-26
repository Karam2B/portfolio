/**
 * Form controls for the admin pages. They render plain inputs with a `name`, so
 * they work inside Qwik City's `<Form>` and post to a `routeAction$`; read the
 * values there with `form_field` / `form_bool` from `~/lib/form_data`.
 */

import { component$, useSignal, type Signal } from "@builder.io/qwik";

/** Shared look for text inputs, textareas, and file inputs. */
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

/** Label stacked above its control. */
export const labelStyle = { display: "flex", flexDirection: "column" as const, gap: "0.35rem" };

/**
 * Labeled single-line text input.
 * Pass `value` to bind the input to a signal (edit pages prefill it from the
 * loader); leave it out for an empty input (new pages).
 */
export const TextField = component$((props: {
    name: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    value?: Signal<string>;
}) => {
    return (
        <label style={labelStyle}>
            {props.label}
            {props.value ? (
                <input name={props.name} type="text" required={props.required} placeholder={props.placeholder} bind:value={props.value} style={fieldStyle} />
            ) : (
                <input name={props.name} type="text" required={props.required} placeholder={props.placeholder} style={fieldStyle} />
            )}
        </label>
    );
});

/** Labeled checkbox. Submits `"true"` when checked and nothing when unchecked (read it with `form_bool`). */
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
