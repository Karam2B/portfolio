import { pipe, string, nonEmpty, strictObject } from "valibot"

export const cookie_schema = strictObject({
    google_jwt: pipe(string(), nonEmpty())
})
