import { component$, Slot } from "@builder.io/qwik";
import { InlineA } from "~/utils/components";
import { routeLoader$ } from "@builder.io/qwik-city";
import { decode } from "js-base64"
import jwt from "jsonwebtoken";

export const admin_auth = routeLoader$(async (event) => {
    let coockie = event.cookie.get("jwt")?.value;
    let decoded_str = coockie ? decode(coockie.split(".")[1]) : null;
    let decoded = decoded_str ? JSON.parse(decoded_str) : null;

    if (!coockie || !decoded) {
        return { pass: false }
    }
    let jwt_secret = event.env.get("JWT_SECRET");
    if (!jwt_secret || typeof jwt_secret !== "string") {
        return { pass: false }
    }
    if (!jwt.verify(coockie, jwt_secret)) {
        return { pass: false }
    }
    if (decoded && typeof decoded === "object" && "exp" in decoded && typeof decoded.exp === "string" && new Date(decoded.exp) > new Date()) {
        event.cookie.delete("jwt")
        return { pass: false }
    }
    return { pass: true }
})

export default component$(() => {
    let auth = admin_auth();
    return <>
        {auth.value.pass ?
            <Slot />
            : <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}><div>Unauthorized</div><InlineA href="/auth">auth</InlineA></div>
        }
    </>
})