import { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler"
import { createClient } from "@libsql/client"

export const client = (env: EnvGetter) => {
    const authToken = env.get("TURSO_AUTH_TOKEN")
    const url = env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    const client = createClient({ url, authToken })

    return client
}
