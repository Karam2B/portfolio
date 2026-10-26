/**
 * Markdown parsing. Content is stored as markdown in the database and turned
 * into tokens here; `<Marked>` (marked.tsx) renders the tokens as Qwik JSX,
 * so no raw HTML string is ever injected into the page.
 *
 * `marked-directive` adds custom blocks written as
 *     :::note{title="Heads up"}
 *     markdown here
 *     :::
 * which `<CustomBlock>` (custom_blocks.tsx) maps to components.
 */

import { marked, type Token } from "marked";
import { createDirectives } from "marked-directive";

export const get_marked_engine = () => {
    return marked.use({ async: true, breaks: true, gfm: true }, createDirectives());
};

/** Tokens for a markdown string. Literal `\n` sequences in the stored text count as newlines. */
export function lex_markdown(source: string): Token[] {
    return get_marked_engine().lexer(source.replace(/\\n/g, "\n"));
}
