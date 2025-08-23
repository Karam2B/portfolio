import { Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { object, parse, string } from "valibot";
import jwt_lib from "jsonwebtoken"

export const use_server = server$(function(this, jwt: string) {
    const env = parse(object({
        JWT_SECRET: string(),
    }), {
        JWT_SECRET: this.env.get("JWT_SECRET")
    });

    try {
        jwt_lib.verify(jwt, env.JWT_SECRET);
        return { success: true }
    } catch {
        return { success: false }
    }
})

export default component$(() => {
    const auth = useSignal({ auth: "need_auth" as "need_auth" | "auth" });
    useVisibleTask$(async () => {
        const jwt = parse(string(), window.localStorage.getItem("jwt"));
        const response = await use_server(jwt)
        if (response.success) auth.value = { auth: "auth" }
    }, { strategy: "document-ready" });

    return <div class="max-w-[300px] pt-3 m-auto">
        {auth.value.auth === "auth" ?
            <Slot /> : <div >need auth <a href="/auth/google">google</a></div>
        }</div>
})
