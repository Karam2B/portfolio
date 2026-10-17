import { component$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { RequestEvent, routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { decode } from "js-base64";

export const oauth_code = routeLoader$(async (event) => {
    let jwt_secret = event.env.get("JWT_SECRET");
    if (!jwt_secret || typeof jwt_secret !== "string") {
        return { state: "bug", dev_message: "jwt secret not found" } as const
    }
    let code = event.url.searchParams.get("code");
    let error = event.url.searchParams.get("error");
    if (typeof error === "string" && error === "access_denied") {
        return { state: "catchable_error", frontend_message: "access_denied" } as const
    }
    if (!code || typeof code !== "string") {
        return { state: "catchable_error", frontend_message: "code not found" } as const
    }

    let token_url_params = new URLSearchParams({
        code: code,
        client_id: import.meta.env.PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        client_secret: event.env.get("GOOGLE_OAUTH_CLIENT_SECRET"),
        grant_type: "authorization_code",
        redirect_uri: `${event.url.origin}${event.url.pathname}`
    } as any);

    let exchange_code = await fetch(`https://oauth2.googleapis.com/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: token_url_params.toString()
    })


    let exchange_code_json = await exchange_code.json()
    let access_token = exchange_code_json.access_token;

    if (exchange_code.status !== 200 || !access_token || typeof access_token !== "string") {
        return { state: "bug", dev_message: "exchanging code with token failed", info: exchange_code_json } as const
    }

    let user_info = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo`,
        {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        }
    );

    let user_info_json = await user_info.json();

    console.log("last_state: ", JSON.stringify(user_info_json));

    if (user_info.status !== 200 || !user_info_json.email) {
        return { state: "bug", dev_message: "accessing userinfo failed" } as const
    }

    // I'm the only user of my portfolio, leaving my email hardcoded here is fine and is what I want.
    if (user_info_json.email !== "k99.barakat@gmail.com") {
        return { state: "catchable_error", frontend_message: "you are not authorized" } as const
    }

    let in_one_hour = new Date(Date.now() + 1 * 60 * 60 * 1000).getTime();

    let token = jwt.sign({ email: user_info_json.email, exp: in_one_hour }, jwt_secret);

    return { state: "authorized", token, name: user_info_json.name as string } as const

})

export default component$(() => {
    let location = useLocation();
    let code = oauth_code();
    let show_info = useSignal(false);
    useVisibleTask$(() => {
        if (code.value.state === "authorized") {
            localStorage.setItem("token", code.value.token);
        }

    });

    useVisibleTask$(() => {
        let exist = localStorage.getItem("token") || (code.value.state === "authorized" && code.value.token);
        if (exist) {
            document.cookie = `jwt=${exist}; path=/; max-age=3600`;
        }
    });

    let authorized_already = useSignal<{ email?: string, expired?: true }>({});
    useVisibleTask$(() => {
        let payload = localStorage.getItem("token")?.split(".")[1];
        if (!payload) {
            return;
        }
        let decoded_str = payload ? decode(payload) : null;
        let decoded = decoded_str ? JSON.parse(decoded_str) : null;
        let email = decoded && typeof decoded === "object" && "email" in decoded && typeof decoded.email === "string" ? decoded.email : null;
        if (decoded && typeof decoded === "object" && "exp" in decoded && typeof decoded.exp === "string" && new Date(decoded.exp) > new Date()) {
            authorized_already.value = { expired: true };
        }

        if (email) {
            authorized_already.value = { email };
        }
    });
    return <div style={{ width: "min(500px, 90vw)", margin: "0 auto", paddingTop: "2.5rem" }} >
        <p style={{ margin: 0 }}>
            Hi there, I'm interested how you knew this route exists. Anyway, only authorized users have access, tell me how are you:
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <a href={
                `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.PUBLIC_GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${location.url.origin}${location.url.pathname}&response_type=code&scope=email`
            } style={{ marginTop: "2.5rem", marginLeft: "auto", marginRight: "auto", width: "fit-content", cursor: "pointer", padding: "0.5rem 1.25rem", background: "#22c55e", color: "#ffffff", borderRadius: 6, textDecoration: "none" }}>
                Auth with Google
            </a>
        </div>
        <div style={{ marginTop: "2.5rem" }}>
            {
                code.value.state === "authorized" ? <div style={{ overflow: "hidden" }}>Hi there: {code.value.name}</div>
                    : authorized_already.value && authorized_already.value.expired ? <div>Your token has expired, please login again</div>
                        : authorized_already.value && authorized_already.value.email ? <div>Hi there: {authorized_already.value.email}</div>
                            : code.value.state === "bug" ? <div>
                                ops, there must be a bug, will catch it and comeback
                                <div style={{ cursor: "pointer" }} onClick$={() => show_info.value = !show_info.value}>view</div>
                                {show_info.value && (
                                    <pre style={{ overflow: "scroll" }}>
                                        {JSON.stringify(code.value, null, 2)}
                                    </pre>
                                )}
                            </div>
                                : code.value.state === "catchable_error" && code.value.frontend_message === "access_denied" ? <div>You have denied the access</div>
                                    : code.value.state === "catchable_error" && code.value.frontend_message === "you are not authorized" ? <div>You are not authorized</div>
                                        : code.value.state === "catchable_error" && code.value.frontend_message === "code not found" ? <div></div>
                                            : <div>...</div>
            }
        </div>
    </div >
})

