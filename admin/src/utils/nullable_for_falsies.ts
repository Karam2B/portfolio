import * as v from "valibot"

export function nullable_for_falsies<N extends v.GenericSchema>(s: N) {
    return v.pipe(
        v.nullable(s),
        v.transform((val) => { if (!val) { return null } else { return val } })
    )
}
