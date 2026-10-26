/**
 * Turns errors from the table modules into short messages for admin forms.
 * The raw error is logged; only the friendly message goes back to the browser.
 */

import { DB_NOT_CONFIGURED, NOT_FOUND, is_unique_constraint_error } from "./client";

/** `verb` fills the generic fallback, e.g. "Could not delete." */
export function save_error(error: unknown, verb = "save") {
    console.error(error);
    if (error instanceof Error && error.message === DB_NOT_CONFIGURED) {
        return "The database is not configured for writing.";
    }
    if (error instanceof Error && error.message === NOT_FOUND) return "That record was not found.";
    if (is_unique_constraint_error(error) && /snake_case_id/i.test((error as Error).message)) {
        return "That snake_case_id is already taken.";
    }
    return `Could not ${verb}.`;
}
