import { component$, useComputed$, $, useSignal } from "@builder.io/qwik";
import * as v from "valibot"
import { meta_update, meta_update_optional, meta_update_optional_schema, meta_update_schema, return_schema_and_transform } from "~/utils/on_update";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { InitialValues, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik"
import { client } from "~/utils/client";
import { DateField, PhotoField, StringField, TextareaField } from "~/utils/input_elements";

const optional_string = v.nullable(v.pipe(v.string(), v.transform((e) => { if (e === "") { return null } else { return e } })))
const required_string = v.pipe(v.string("has tobe string"), v.nonEmpty("cannot be null"))
const date = v.pipe(v.string(), v.isoTimestamp())

const entity_schema = v.object({
    title: v.strictObject({ meta: meta_update_schema, value: required_string }),
    content: v.strictObject({ meta: meta_update_schema, value: required_string }),
    summary: v.strictObject({ meta: meta_update_schema, value: required_string }),
    github_link: v.strictObject({ meta: meta_update_optional_schema, value: optional_string }),
    live_link: v.strictObject({ meta: meta_update_optional_schema, value: optional_string }),
    created_at: v.strictObject({ meta: meta_update_schema, value: date }),
    display_picture: v.strictObject({ meta: meta_update_optional_schema, value: optional_string }),
});

const server_submit = server$(async function(this, vals: { id: number, entity: v.InferOutput<typeof entity_schema> }) {
    const sets = [];
    const args: any[] = [];


    for (const key in vals.entity) {
        const value = v.parse(v.object({ meta: v.string(), value: v.unknown() }), (vals.entity as any)[key]);
        if (value.meta === "set_as") {
            sets.push(`${key} = ?`)
            args.push(value.value);
        } else if (value.meta === "set_null") {
            sets.push(`${key} = NULL`)
        }
    }
    args.push(vals.id)
    console.log(vals.entity, sets, args)

    const fetched = await client(this.env).execute({
        sql: `UPDATE project SET ${sets.join(", ")} WHERE id = ? RETURNING id`,
        args: [...args]
    })
    // return v.parse(v.pipe(v.array(v.object({ id: v.number() })), v.minLength(1)), fetched.rows as any)[0].id
    return vals.id
})

export const use_id = routeLoader$(async (env) => {
    return v.parse(
        v.tuple([v.tuple([v.literal("id"), v.pipe(v.string(), v.transform((e) => Number(e)), v.number())])]),
        Array.from(env.query.entries())
    )[0][1];
})

export const use_form_loader = routeLoader$<InitialValues<v.InferInput<typeof entity_schema>>>(async (
    env
) => {
    const id = await env.resolveValue(use_id);

    const res = await client(env.env).execute({
        sql: `SELECT * FROM project WHERE id = ?`,
        args: [id]
    });

    return v.parse(v.pipe(v.array(
        v.object({
            title: return_schema_and_transform(entity_schema.entries.title, "set_as"),
            content: return_schema_and_transform(entity_schema.entries.content, "set_as"),
            summary: return_schema_and_transform(entity_schema.entries.summary, "set_as"),
            github_link: return_schema_and_transform(entity_schema.entries.github_link, "set_as"),
            live_link: return_schema_and_transform(entity_schema.entries.live_link, "set_as"),
            created_at: return_schema_and_transform(entity_schema.entries.created_at, "keep"),
            display_picture: return_schema_and_transform(entity_schema.entries.display_picture, "set_as"),
        })
        // entity_schema
    ), v.minLength(1)), res.rows)[0] as any
});

export default component$(() => {
    const id = use_id();
    const [thisForm, { Form, Field }] = useForm<v.InferInput<typeof entity_schema>>({
        loader: use_form_loader(),
        validate: valiForm$(entity_schema),
    });

    const vals = useComputed$(() => {
        return Object.values(thisForm.internal.fields).map((e) => [e.name, e.value] as const)
    })
    const errors = useComputed$(() => {
        return Object.values(thisForm.internal.fields).map((e) => e.error).filter((e) => e !== "")
    })

    const status = useSignal("idle" as "idle" | "loading" | "error" | { result: number });

    const submit = $<SubmitHandler<v.InferInput<typeof entity_schema>>>(async (vals, evn) => {
        status.value = "loading";
        const vals2 = v.parse(entity_schema, vals);
        let res
        try {
            res = await server_submit({ entity: vals2, id: id.value });
            status.value = { result: res }
        } catch {
            status.value = "error"
        }
    })

    return <div>
        Update Project id={id.value}
        <Form onSubmit$={submit}>
            <div class="flex flex-col gap-2">
                <Field name="title.value">
                    {(field, props) => (
                        <StringField
                            field={field} props={props} store={thisForm}
                            name="title"
                            meta_action_set={meta_update}
                        />
                    )}
                </Field>
                <Field name="content.value">
                    {(field, props) => (
                        <TextareaField
                            field={field} props={props} store={thisForm}
                            name="content"
                            meta_action_set={meta_update}
                        />
                    )}
                </Field>
                <Field name="summary.value">
                    {(field, props) => (
                        <StringField
                            field={field} props={props} store={thisForm}
                            name="summary"
                            meta_action_set={meta_update}
                        />
                    )}
                </Field>
                <Field name="github_link.value">
                    {(field, props) => (
                        <StringField
                            field={field} props={props} store={thisForm}
                            name="github_link"
                            meta_action_set={meta_update_optional}
                        />
                    )}
                </Field>
                <Field name="live_link.value">
                    {(field, props) => (
                        <StringField
                            field={field} props={props} store={thisForm}
                            name="live_link"
                            meta_action_set={meta_update_optional}
                        />
                    )}
                </Field>
                <Field name="created_at.value">
                    {(field, props) => (
                        <DateField
                            field={field} props={props} store={thisForm}
                            name="created_at"
                            meta_action_set={meta_update}
                        />
                    )}
                </Field>
                <Field name="display_picture.value">
                    {(field, props) => (
                        <PhotoField
                            field={field} props={props} store={thisForm}
                            name="display_picture"
                            meta_action_set={meta_update_optional}
                        />
                    )}
                </Field>
                <div class="flex gap-2 items-strech">
                    <span class="flex-1" />
                    {status.value !== "idle" && <div style={{ background: status.value === "loading" ? "var(--color-yellow-400)" : status.value === "error" ? "var(--color-red-400)" : "var(--color-green-400)" }} class="p-1 px-3">
                        {typeof status.value === "string" ? status.value : `success: ${status.value.result}`}
                    </div>}
                    <button class="cursor-pointer p-1 px-3 bg-slate-200 dark:bg-slate-700" type="submit">submit</button>
                </div>
                {errors.value.length !== 0 &&
                    <div class="flex flex-col p-1">
                        <span>errors:</span>
                        {errors.value.map((e) => <span>{e}</span>)}
                    </div>
                }
                {false && <div>
                    <span>values: </span>
                    {vals.value.map((e) => {
                        return <div>{e[0]}: {JSON.stringify(e[1])}</div>
                    })}
                </div>}
            </div>
        </Form>
    </div>
});
