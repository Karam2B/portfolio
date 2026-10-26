/**
 * Renders `marked` tokens as Qwik JSX. Call `lex_markdown` from `./engine`
 * first; never pass a raw HTML string into the page.
 *
 * Custom `:::name{attr="value"}` blocks are handed to `<CustomBlock>`.
 */

import { component$ } from "@builder.io/qwik";
import type { Token } from "marked";
import { CustomBlock } from "./custom_blocks";

export const TokenError = component$((props: { token: Token; code: string }) => {
    return <div></div>;
});

function directive_attrs(raw: unknown): Record<string, string> {
    if (!raw || typeof raw !== "object") return {};
    const source = Array.isArray(raw) ? Object.fromEntries(raw) : raw;
    const attrs: Record<string, string> = {};
    for (const [key, value] of Object.entries(source)) {
        if (value == null) attrs[key] = "";
        else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            attrs[key] = String(value);
        }
    }
    return attrs;
}

export function escape_html_entities(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export const Marked = component$((props: { content: Token[]; nesting_level: number }) => {
    return props.content.map((token) => {
        if (token.type === "space") {
            return <span></span>;
        }

        if (token.type === "blockquote") {
            return <blockquote><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></blockquote>;
        }
        if (token.type === "br") {
            return <br />;
        }

        if (token.type === "heading" && token.depth === 1) {
            return <h1><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></h1>;
        }

        if (token.type === "heading" && token.depth === 2) {
            return <h2><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></h2>;
        }

        if (token.type === "heading" && token.depth === 3) {
            return <h3><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></h3>;
        }

        if (token.type === "hr") {
            return <hr />;
        }

        if (token.type === "list" && token.ordered) {
            return (
                <ol>
                    {token.items.map((item: any) => {
                        if (item.task) {
                            throw new Error("todo: list of checkboxes");
                        }
                        return <li><Marked content={item.tokens || []} nesting_level={props.nesting_level + 1} /></li>;
                    })}
                </ol>
            );
        }

        if (token.type === "list" && !token.ordered) {
            return (
                <ul>
                    {token.items.map((item: any) => {
                        return <li><Marked content={item.tokens || []} nesting_level={props.nesting_level + 1} /></li>;
                    })}
                </ul>
            );
        }

        if (token.type === "checkbox") {
            return <input type="checkbox" checked={token.checked} disabled />;
        }

        if (token.type === "paragraph") {
            return <p><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></p>;
        }

        if (token.type === "table") {
            return (
                <table>
                    <thead>{token.header.map((cell: any) => <th><Marked content={cell.tokens || []} nesting_level={props.nesting_level + 1} /></th>)}</thead>
                    <tbody>
                        {token.rows.map((row: any) => <tr>{row.map((cell: any) => <td><Marked content={cell.tokens || []} nesting_level={props.nesting_level + 1} /></td>)}</tr>)}
                    </tbody>
                </table>
            );
        }

        if (token.type === "strong") {
            return <strong><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></strong>;
        }

        if (token.type === "em") {
            return <em><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></em>;
        }

        if (token.type === "codespan") {
            return <code>{escape_html_entities(token.text)}</code>;
        }

        if (token.type === "del") {
            return <del><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></del>;
        }

        if (token.type === "link") {
            return <a href={token.href} title={token.title}><Marked content={token.tokens || []} nesting_level={props.nesting_level + 1} /></a>;
        }

        if (token.type === "image") {
            return <img src={token.href} alt={token.text} title={token.title} />;
        }

        if (token.type === "code") {
            return (
                <pre style={{ overflowX: "auto", margin: "1rem 0" }}>
                    <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>{escape_html_entities(token.text)}</code>
                </pre>
            );
        }

        if (token.type === "text") {
            return <span>{escape_html_entities(token.text)}</span>;
        }

        if (token.type === "html" || token.type === "def") {
            throw new Error("not willing to implement" + token.type);
        }

        if (token.type.startsWith("directiveInline")) {
            return <span>Inline components are not supported. Use a ::: block instead.</span>;
        }

        if (token.type.startsWith("directive")) {
            const name = String((token as { meta?: { name?: string } }).meta?.name || "");
            const attrs = directive_attrs((token as { attrs?: unknown }).attrs);
            const tokens = (token as { tokens?: Token[] }).tokens || [];
            return (
                <CustomBlock name={name} attrs={attrs}>
                    <Marked content={tokens} nesting_level={props.nesting_level + 1} />
                </CustomBlock>
            );
        }

        return <TokenError token={token} code="uncovered_type" />;
    });
});
