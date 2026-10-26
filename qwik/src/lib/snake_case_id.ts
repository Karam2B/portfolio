/**
 * `snake_case_id` is the public slug of a project or blog post.
 * It appears in URLs (`/projects/my_project`, `/blog/my_post`) and is UNIQUE in
 * both tables, while the numeric `id` stays the primary key used by admin pages.
 */

import { snakeCase } from "change-case";
import * as v from "valibot";

/** Normalize admin input to a stable slug (`My Project` → `my_project`). */
export function normalize_snake_case_id(raw: string): string {
    return snakeCase(raw.trim());
}

/** Form field schema: trims, normalizes, and rejects input that normalizes to an empty slug. */
export const snake_case_id_field = v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1),
    v.transform((value) => normalize_snake_case_id(value)),
    v.minLength(1),
);
