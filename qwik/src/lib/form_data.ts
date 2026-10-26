/**
 * Readers for `routeAction$` form data.
 * A field can arrive as a string, as an array (repeated names), or be missing,
 * so actions read fields through these instead of trusting the raw value.
 */

/** First string value of a field, or "" when it is missing. */
export function form_field(value: unknown) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    return "";
}

/** Checkbox value. An unchecked box is not sent at all, which reads as false. */
export function form_bool(value: unknown) {
    const raw = form_field(value);
    return raw === "true" || raw === "on" || raw === "1";
}
