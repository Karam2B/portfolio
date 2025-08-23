import { GenericSchema, variant, strictObject, literal, ObjectSchema, ObjectEntries } from "valibot"

export function maybe_uninit<N extends GenericSchema>(input: N) {
    return variant("set",
        [
            strictObject({
                set: literal("init"),
                value: input
            }),
            strictObject({
                set: literal("uninit"),
            })
        ]
    );
}

export function object_uninit<E extends ObjectEntries, N extends ObjectSchema<E, undefined>>(obj: N) {
    const ret: any = {}
    for (const key in obj.entries) {
        ret[key] = { set: "uninit" }
    }
    return ret
}


