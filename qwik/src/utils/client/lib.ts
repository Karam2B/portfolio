import { Client, createClient, Row } from "@libsql/client"
import * as v from "valibot"

export type CollectionMeta = {
    select: (by_id: number) => string,
    schema: v.GenericSchema,
    relation: Record<string, v.GenericSchema>,
};
export type RelationSpec = (link_spec_self: any, filters: any) => { select_one?: (client: Client) => Promise<any> }

export type Collections = Record<string, CollectionMeta>

export type Select<From, Meta extends CollectionMeta, Schema extends Collections> = {
    _from: From,
    _meta: Meta
    execute: SelectExecute<From, Meta, Schema>
}

export type SelectExecute<From, Meta extends CollectionMeta, Schema extends Collections> =
    From extends string ? Meta extends CollectionMeta ?
    <T extends (keyof Meta["relation"])[]>
        (arg: { client: Client, relation: T, by_id: number }) => Promise<SelectResult<From, Schema, Meta, T[number]>> : never : never

export type SelectResult<From extends string, Schema extends Collections, Meta extends CollectionMeta, Relations extends (keyof Meta["relation"])> = {
    attribute: v.InferOutput<Meta["schema"]>,
    relation: <Selected extends Relations>(t: Selected) => v.InferOutput<Meta["relation"][Selected]>
}

export function nullable_for_falsies<N extends v.GenericSchema>(s: N) {
    return v.pipe(
        v.nullable(s),
        v.transform((val) => { if (!val) { return null } else { return val } })
    )
}

export function non_nullable_for_falsies<N extends v.GenericSchema>(s: N) {
    return v.pipe(
        s,
        v.nonEmpty("cannot be empty") as any
    )
}

export function select<
    C extends Collections,
    L extends Record<string, RelationSpec>,
    From extends keyof C
>(spec: {
    collections: C,
    links: L,
    from: From,
}): Select<From, C[From], C> {

    return {
        _from: spec.from,
        _meta: spec.collections[spec.from],
        execute: async ({ relation, by_id, client }) => {
            let res = await client.execute({
                sql: spec.collections[spec.from].select(by_id),
                args: [by_id]
            })

            if (res.rows.length !== 1) {
                return { found: "none" as const }
            }

            let attribute_schema = spec.collections[spec.from].schema;
            let attribute = v.parse(attribute_schema, res.rows[0]);

            const relation_obj: Record<string, any> = {}

            for (const s_relation of relation) {
                let rel_spec = spec.links.relation;

                let res_ = rel_spec({ from: String(spec.from), to: s_relation }, { by_id });
                if (res_.select_one === undefined) {
                    throw new Error("must be a bug in typescript")
                }
                relation_obj[s_relation] = await res_.select_one(client)
            }

            return {
                attribute,
                relation: (rela) => relation_obj[rela]
            }
        }
    } as Select<From, C[From], C>
}




async function _test_typescript() {
    const client = createClient({} as any)

    const todo_schema = v.object({ title: v.string(), done: v.boolean() })
    const tag_schema = v.object({ tag_title: v.string() })
    const cat_schema = v.object({ cat_title: v.string() })
    const todo_app_collections = {
        todo: {
            schema: todo_schema,
            select: (by_id) => {
                return ""
            },
            relation: {
                category: cat_schema,
                tag: v.array(tag_schema)
            }
        },
        category: {
            schema: cat_schema,
            select: (by_id) => { return "" },
            relation: {
                todo: todo_schema
            }
        },
        tag: {
            schema: tag_schema,
            select: (by_id) => { return "" },
            relation: {
                todo: v.array(todo_schema)
            }
        },
    } as const satisfies Collections
    {
        let s1 = select({
            links: {},
            collections: todo_app_collections,
            from: "todo",
        });
        let s2 = await s1.execute({ client, relation: ["tag"], by_id: 1 })
        let _1 = s2.relation("tag"); // tag is related
        //@ts-expect-error
        let _2 = s2.relation("category"); // category is related, but not specified in execute fn 
    }
    let s = await select({
        links: {},
        collections: todo_app_collections,
        from: "todo",
    }).execute({ relation: ["category", "tag"], by_id: 0, client })
    {
        let _: boolean = s.attribute.done; // access attrbiutes
    }
    {
        let _: string = s.relation("tag")[0].tag_title // access related attrbiutes
    }
    {
        let _: string = s.relation("category").cat_title // access related attrbiutes
    }
    {
        //@ts-expect-error
        let _ = s.relation("tag").etc // attrbiute_doesnt_exist_in_tag
    }
    {
        //@ts-expect-error
        let _ = s.relation("unrelated") // unrelated is not related to todo
    }

}