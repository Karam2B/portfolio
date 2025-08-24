import * as v from "valibot"

export const optional_string = v.nullable(v.pipe(v.string(), v.transform((e) => { if (e === "") { return null } else { return e } })))
export const required_string = v.pipe(v.string("has tobe string"), v.nonEmpty("cannot be null"))
export const date = v.pipe(v.string(), v.isoTimestamp())
