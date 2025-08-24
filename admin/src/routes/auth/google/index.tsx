import { component$, useSignal, useVisibleTask$, useVisibleTaskQrl } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import * as jwt from "jose";
import * as v from "valibot"

export const use_server = routeLoader$(async (req) => {
    const env = v.parse(v.object({
        GOOGLE_OAUTH_CLIENT_SECRET: v.string(),
        PUBLIC_GOOGLE_OAUTH_CLIENT_ID: v.string(),
        JWT_SECRET: v.string(),
    }), {
        GOOGLE_OAUTH_CLIENT_SECRET: req.env.get("GOOGLE_OAUTH_CLIENT_SECRET"),
        PUBLIC_GOOGLE_OAUTH_CLIENT_ID: import.meta.env.PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        JWT_SECRET: req.env.get("JWT_SECRET")
    });

    const q = req.query

    if (q.size === 0) {
        return { stage: "stage_1" as const }
    }

    const query = v.safeParse(
        v.object({
            code: v.string(),
            scope: v.string(),
            prompt: v.string(),
        }),
        {
            code: q.get("code"),
            scope: q.get("scope"),
            prompt: q.get("prompt")
        }
    );

    if (query.success) {
        const res_raw = await fetch(`https://oauth2.googleapis.com/token?${new URLSearchParams({
            grant_type: "authorization_code",
            code: query.output.code,
            redirect_uri: "http://localhost:5173/auth/google",
            client_id: env.PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
            client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET
        })}`, { method: "POST" })

        if (res_raw.status !== 200) {
            // console.log(await res_raw.text(), {
            //     code: query.output.code,
            //     client_id: import.meta.env.PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
            //     client_secret: req.env.get("GOOGLE_OAUTH_CLIENT_SECRET")
            // });
            return { stage: "error" as const }
        }

        const res_json = await res_raw.json();

        const res = v.parse(v.strictObject({
            access_token: v.string(),
            expires_in: v.number(),
            scope: v.string(),
            token_type: v.literal("Bearer"),
            id_token: v.string(),
        }), res_json)

        const source_raw = await fetch(`https://openidconnect.googleapis.com/v1/userinfo`, {
            headers: { authorization: "Bearer " + res.access_token }
        });

        if (source_raw.status !== 200) {
            console.log("status ", { text: await source_raw.text(), status: source_raw.status });
            return { stage: "unkown" }
        }

        const source_json = await source_raw.json();

        const source = v.parse(v.strictObject({
            email: v.string(), email_verified: v.boolean(), picture: v.string(),
            name: v.string(), sub: v.string()
        }), source_json);

        if (source.email === "k99.barakat@gmail.com") {
            return {
                stage: "stage_2" as const,
                jwt_token: await new jwt.SignJWT({}).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode(env.JWT_SECRET))
            }
        } else {
            return { stage: "auth_error" as const }
        }
    }

    return { stage: "unkown" as const }

})

export default component$(() => {
    const server_data = use_server();
    let redirect_uri = useSignal<string>();
    useVisibleTask$(() => {
        var url = new URL(import.meta.url);
        const port = url.port !== "" ? ":" + url.port : "";
        redirect_uri.value = url.protocol + "//" + url.hostname + port + "/auth/google";
    }, { strategy: "document-ready" })
    useVisibleTask$((t) => {
        t.track(server_data)
        if (server_data.value.stage === "stage_2" && server_data.value.jwt_token) {
            window.document.cookie = `jwt=${server_data.value.jwt_token}`
            window.localStorage.setItem("jwt", server_data.value.jwt_token)
        }
    }, { strategy: "document-ready" })

    return <div class="grid place-content-center">
        {server_data.value.stage === "stage_1" ?
            redirect_uri.value && <a href={`https://accounts.google.com/o/oauth2/auth?${new URLSearchParams({
                response_type: "code",
                redirect_uri: redirect_uri.value,
                scope: "https://www.googleapis.com/auth/userinfo.email",
                client_id: import.meta.env.PUBLIC_GOOGLE_OAUTH_CLIENT_ID
            }).toString()
                }`}>
                auth with google
            </a>
            : server_data.value.stage === "stage_2" ? <span>auth succss <a href="/">home</a></span>
                : <span>error | <a href="/auth/google">back</a></span>
        }
    </div>
})
