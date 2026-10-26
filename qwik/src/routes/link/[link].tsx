/**
 * Short URLs for the entries in `~/lib/profile_links`.
 * `/link/github` looks up the link whose `text` snake-cases to `github`.
 */

import { RequestEvent } from "@builder.io/qwik-city";
import * as cc from "change-case";
import { links } from "~/lib/profile_links";

export const onGet = async ({ redirect, params }: RequestEvent) => {
    const link = cc.snakeCase(params.link);
    const found = links.find((search) => cc.snakeCase(search.text) === link);

    if (!found) {
        throw redirect(302, "/link");
    }

    throw redirect(302, found.href);
};

