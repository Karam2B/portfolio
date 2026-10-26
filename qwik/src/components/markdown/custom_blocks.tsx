/**
 * Maps markdown `:::name` directives to Qwik components.
 * Add a new block here, then authors can write `:::your_name` in a post.
 */

import { Slot, component$, useSignal } from "@builder.io/qwik";

export const Note = component$((props: { title?: string }) => {
    return (
        <aside style={{ border: "1px solid currentColor", borderRadius: 8, padding: "0.75rem 1rem", margin: "1rem 0" }}>
            {props.title && <strong style={{ display: "block", marginBottom: "0.35rem" }}>{props.title}</strong>}
            <Slot />
        </aside>
    );
});

const LighthouseReport = component$(() => {
    const height = useSignal<number | undefined>(0);
    return (
        <iframe
            onLoad$={(_, elem) => {
                const element = elem.contentWindow as Window | undefined;
                if (!element) return;

                const styles = document.createElement("Style");
                styles.innerHTML = `
          html {
            overflow: hidden;
          }
          body {
            overflow: visible;
          }
          article.lh-root {
            background: transparent;
          }
          .lh-topbar {
            display: none!important;
          }
        `;

                element.document.head.appendChild(styles);
                height.value = element.document.body.scrollHeight || 0;

                element.document.addEventListener("click", () => {
                    setTimeout(() => {
                        height.value = element.document.body.scrollHeight || 0;
                    }, 150);
                });
            }}
            style={{
                height: (height.value && height.value + 100 + "px") || "100vh",
                opacity: height.value ? 1 : 0,
                width: "100%",
                minHeight: "100%",
            }}
            src="/lighthouse.html"
        />
    );
});

export const CustomBlock = component$((props: { name: string; attrs: Record<string, string> }) => {
    return (
        <>
            {props.name === "note" && (
                <Note title={props.attrs.title}>
                    <Slot />
                </Note>
            )}
            {props.name === "lighthouse_report" && <LighthouseReport />}
            {props.name !== "note" && props.name !== "lighthouse_report" && (
                <p style={{ margin: "1rem 0" }}>Unknown component "{props.name}". Define it in src/components/markdown/custom_blocks.tsx.</p>
            )}
        </>
    );
});
