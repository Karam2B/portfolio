import { snakeCase } from "change-case";
import * as v from "valibot";

/** Normalize admin input to a stable slug (`My Project` → `my_project`). */
export function normalize_snake_case_id(raw: string): string {
    return snakeCase(raw.trim());
}

export const snake_case_id_field = v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1),
    v.transform((value) => normalize_snake_case_id(value)),
    v.minLength(1),
);

export function is_unique_constraint_error(error: unknown) {
    return error instanceof Error && /unique constraint failed/i.test(error.message);
}
