import { Slot, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";

export default component$(() => {
    const ready = useSignal(false);
    const loc = useLocation();
    const nav = useNavigate();
    useVisibleTask$((t) => {
        t.track(loc);
        if (loc.url.pathname.toString() === "/") {
            const jwt = localStorage.getItem("jwt");
            if (jwt === null) {
                nav("/auth/google")
            } else {
                nav("/panel")
            }
        }
        ready.value = true
    })

    return <div class=" dark:bg-slate-800 dark:text-white">
        <div class="w-[300px] m-auto">
            <div class="min-h-screen flex flex-col">
                {ready.value ?
                    <>
                        <div class="flex-1">
                            <Slot />
                        </div>
                    </>
                    :
                    <h1 class="text-center flex-1">Hi 👋 you will be redirected</h1>}
                <div class="py-3">
                    <a href="/">go home</a>
                </div>
            </div>
        </div>
    </div>
})
