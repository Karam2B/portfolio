import { createClient } from "@libsql/client"
import { $, component$, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import * as v from "valibot"
import { InitialValues, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik"
import { nullable_for_falsies } from "~/utils/nullable_for_falsies";

const project_schema = v.object({
    title: v.pipe(v.string("has tobe string"), v.nonEmpty("title cannot be null")),
    content: v.pipe(v.string(), v.nonEmpty("content cannot be null")),
    summary: v.pipe(v.string(), v.nonEmpty("summary cannot be null")),
    github_link: nullable_for_falsies(v.string()),
    live_link: nullable_for_falsies(v.string()),
    created_at: v.pipe(v.string(), v.isoTimestamp()),
    display_picture: v.nullable(v.string()),
});

export const server_submit = server$(async function(this, vals: v.InferOutput<typeof project_schema>) {
    const authToken = this.env.get("TURSO_AUTH_TOKEN")
    const url = this.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    const client = createClient({ url, authToken })

    const keys = [];
    const inserts = [];
    const args = [];

    for (const key in vals) {
        //@ts-ignore
        const val = vals[key];
        if (val === null) {
            continue
        }
        keys.push(key);
        inserts.push("?");
        args.push(val);
    }


    const fetched = await client.execute({
        sql: `INSERT INTO project (${keys.join(", ")}) VALUES ${inserts.join(",")} RETURNING id`,
        args
    })

    return v.parse(v.pipe(v.array(v.object({ id: v.number() })), v.minLength(1)), fetched.rows as any)[0].id
})

export const use_form_loader = routeLoader$<InitialValues<v.InferInput<typeof project_schema>>>(() => {
    return {
        title: "",
        content: "",
        summary: "",
        github_link: null,
        live_link: null,
        created_at: (new Date()).toISOString(),
        display_picture: null,
    }
});

export default component$(() => {
    const [thisForm, { Form, Field }] = useForm<v.InferInput<typeof project_schema>>({
        loader: use_form_loader(),
        validate: valiForm$(project_schema),
    });

    const vals = useComputed$(() => {
        return Object.values(thisForm.internal.fields).map((e) => [e.name, e.value] as const)
    })
    const errors = useComputed$(() => {
        return Object.values(thisForm.internal.fields).map((e) => e.error).filter((e) => e !== "")
    })

    const submit = $<SubmitHandler<v.InferInput<typeof project_schema>>>(async (vals) => {
        const vals2 = v.parse(project_schema, vals);
        const res = await server_submit(vals2);

    })

    return <div>
        Add Project
        <Form onSubmit$={submit}>
            <div class="flex flex-col *:bg-slate-700 gap-2">
                <Field name="title">
                    {(field, props) => (
                        <div class="flex flex-col p-1">
                            <span class="opacity-70 flex gap-2">
                                <span>{props.name}</span>
                                {field.error && <span class="text-red-400 ellipsis">{field.error}</span>}
                            </span>
                            <input {...props} type="string" />
                        </div>
                    )}
                </Field>
                <Field name="content">
                    {(field, props) => (
                        <div class="flex flex-col p-1">
                            <span class="opacity-70 flex gap-2">
                                <span>{props.name}</span>
                                {field.error && <span class="text-red-400 ellipsis">{field.error}</span>}
                            </span>
                            <textarea {...props} />
                        </div>
                    )}
                </Field>
                <Field name="summary">
                    {(field, props) => (
                        <div class="flex flex-col p-1">
                            <span class="opacity-70 flex gap-2">
                                <span>{props.name}</span>
                                {field.error && <span class="text-red-400 ellipsis">{field.error}</span>}
                            </span>
                            <input {...props} type="string" />
                        </div>
                    )}
                </Field>

                <Field name="github_link">
                    {(field, props) => (
                        <div class="flex flex-col p-1">
                            <span class="opacity-70 flex gap-2">
                                <span>{props.name}</span>
                                {field.error && <span class="text-red-400 ellipsis">{field.error}</span>}
                            </span>
                            <input {...props} type="string" />
                        </div>
                    )}
                </Field>

                <Field name="live_link">
                    {(field, props) => (
                        <div class="flex flex-col p-1">
                            <span class="opacity-70 flex gap-2">
                                <span>{props.name}</span>
                                {field.error && <span class="text-red-400 ellipsis">{field.error}</span>}
                            </span>
                            <input {...props} type="string" />
                        </div>
                    )}
                </Field>

                <Field name="created_at">
                    {(field, props) => (
                        <div class="flex flex-col p-1">
                            <span class="opacity-70 flex gap-2">
                                <span>{props.name}</span>
                                {field.error && <span class="text-red-400 ellipsis">{field.error}</span>}
                            </span>
                            <input {...props} type="string" />
                        </div>
                    )}
                </Field>
                <Field name="display_picture">
                    {(field, props) => (
                        <div class="flex flex-col p-1">
                            <span class="opacity-70 flex gap-2">
                                <span>{props.name}</span>
                                {field.error && <span class="text-red-400 ellipsis">{field.error}</span>}
                            </span>
                            <input {...props} type="string" />
                        </div>
                    )}
                </Field>
                <button class="cursor-pointer p-1" type="submit">submit</button>
                {false && <div>
                    <span>values: </span>
                    {vals.value.map((e) => {
                        return <div>{e[0]}: {JSON.stringify(e[1])}</div>
                    })}
                </div>}
                {errors.value.length !== 0 &&
                    <div class="flex flex-col p-1">
                        <span>errors:</span>
                        {errors.value.map((e) => <span>{e}</span>)}
                    </div>
                }
            </div>
        </Form>
    </div>
})
