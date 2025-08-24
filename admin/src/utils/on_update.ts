import * as v from "valibot"

export const meta_schema = v.union([
    v.literal("set_as"),
    v.literal("keep"),
    v.literal("set_null"),
    v.literal("default")
]);

export const meta_set = { set_as: { next: "set_as", disabled: false } }
export const meta_set_schema = v.union([v.literal("set_as")])

export const meta_set_optional = {
    set_as: { next: "set_null", disabled: false },
    set_null: { next: "set_as", disabled: true },
}
export const meta_set_optional_schema = v.union([v.literal("set_as"), v.literal("set_null")])

export const meta_set_default = { set_as: { next: "set_as", disabled: false } }
export const meta_set_default_schema = v.union([v.literal("set_as")])

export const meta_update = { set_as: { next: "keep", disabled: false }, keep: { next: "set_as", disabled: true } }
export const meta_update_schema = v.union([v.literal("keep"), v.literal("set_as")])

export const meta_update_optional = {
    set_as: { next: "set_null", disabled: false },
    set_null: { next: "keep", disabled: true },
    keep: { next: "set_as", disabled: true }
}
export const meta_update_optional_schema = v.union([v.literal("keep"), v.literal("set_null"), v.literal("set_as")])

export const return_schema_and_transform = <
    H extends v.GenericSchema,
    M extends v.GenericSchema,
    T extends v.StrictObjectSchema<{ meta: M, value: H }, undefined>,
>(t: T, meta: v.InferInput<M>) => {
    return v.pipe(t.entries.value, v.transform((e) => ({ value: e, meta }))) as any as T
}
