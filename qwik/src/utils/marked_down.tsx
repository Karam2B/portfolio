import { component$, isDev, useSignal } from "@builder.io/qwik";
import { marked, Token, TokensList } from "marked"
import { createDirectives, presetDirectiveConfigs, } from "marked-directive"
import * as v from "valibot"

export const TokenError = component$((props: { token: Token, code: string }) => {
    return <div></div>
})

export const get_marked_engine = () => {
    return marked.use({ async: true, breaks: true, gfm: true }, createDirectives());
}

export const directive_block_attributes = v.union([
    v.strictObject({
        key: v.literal("lighthouse_report"),
        attrs: v.strictObject({})
    }),
])

export const DirectiveBlock = component$((props: v.InferOutput<typeof directive_block_attributes>) => {
    if (props.key === "lighthouse_report") {
        return <LighthouseReport />
    }
})

export function escape_html_entities(text: string) {
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

export const Marked = component$((props: { content: Token[], nesting_level: number }) => {
    return props.content.map((token) => {
        if (token.type === "space") {
            return <span></span>
        }

        if (token.type === "blockquote") {
            return <blockquote><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></blockquote>
        }
        if (token.type === "br") {
            return <br />
        }

        if (token.type === "heading" && token.depth === 1) {
            return <h1><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></h1>
        }

        if (token.type === "heading" && token.depth === 2) {
            return <h2><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></h2>
        }

        if (token.type === "heading" && token.depth === 3) {
            return <h3><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></h3>
        }

        if (token.type === "hr") {
            return <hr />
        }

        if (token.type === "list" && token.ordered) {

            return <ol>
                {
                    token.items.map((item: any) => {
                        if (item.task) {
                            throw new Error("todo: list of checkboxes")
                        }
                        return <li><Marked content={item.tokens || []} nesting_level={props.nesting_level + 1} /></li>
                    })
                }
            </ol>
        }

        if (token.type === "list" && !token.ordered) {
            return <ul>
                {
                    token.items.map((item: any) => {
                        return <li><Marked content={item.tokens || []} nesting_level={props.nesting_level + 1} /></li>
                    })
                }
            </ul>
        }

        if (token.type === "checkbox") {
            return <input type="checkbox" checked={token.checked} disabled />
        }


        if (token.type === "paragraph") {
            return <p><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></p>
        }

        if (token.type === "table") {
            return <table>
                <thead>{token.header.map((cell: any) => <th><Marked content={cell.tokens || []} nesting_level={props.nesting_level + 1} /></th>)}</thead>
                <tbody>
                    {token.rows.map((row: any) => <tr>{row.map((cell: any) => <td><Marked content={cell.tokens || []} nesting_level={props.nesting_level + 1} /></td>)}</tr>)}
                </tbody>
            </table>

        }

        if (token.type === "strong") {
            return <strong><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></strong>
        }

        if (token.type === "em") {
            return <em><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></em>
        }

        if (token.type === "codespan") {
            return <code>
                {escape_html_entities(token.text)}
            </code>
        }

        if (token.type === "br") {
            return <br />
        }

        if (token.type === "del") {
            return <del><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></del>
        }

        if (token.type === "link") {
            return <a href={token.href} title={token.title}><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></a>
        }

        if (token.type === "image") {
            return <img src={token.href} alt={token.text} title={token.title} />
        }

        if (token.type === "code") {
            return <pre class={`language-${token.lang}`}>
                <code>{escape_html_entities(token.text)}</code>
            </pre>
        }

        if (token.type === "text") {
            return <span>{escape_html_entities(token.text)}</span>
        }

        if (token.type === "html" || token.type === "def") {
            throw new Error("not willing to implement" + token.type)
        }

        if (token.type.startsWith("directiveBlock")) {
            let name = (token as any)?.meta?.name;
            let attrs = (token as any)?.attrs || {};
            let attrs_ = v.parse(directive_block_attributes, { key: name, attrs });
            return <DirectiveBlock {...attrs_} />
        }

        if (token.type.startsWith("directiveInline")) {
            throw new Error("inline directive is not allowed")
        }

        return <TokenError token={token} code="uncovered_type" />
    })
})

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
            }}
            class="w-full min-h-full"
            src="/lighthouse.html"
        />
    );
});