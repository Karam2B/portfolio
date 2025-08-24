import { createClient } from "@libsql/client"
import { $, component$, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useNavigate } from "@builder.io/qwik-city";
import * as v from "valibot"
import { InitialValues, SubmitHandler, reset, useForm, valiForm$ } from "@modular-forms/qwik"
import { StringField } from "~/utils/input_elements";
import { meta_schema, meta_set_schema } from "~/utils/on_update";
import { required_string } from "~/utils/valibot_ext";

const entity_schema = v.object({
    title: v.object({ meta: meta_set_schema, value: required_string })
});

export const server_submit = server$(async function(this, vals: v.InferOutput<typeof entity_schema>) {
    const authToken = this.env.get("TURSO_AUTH_TOKEN")
    const url = this.env.get("TURSO_DATABASE_URL")

    if (!url || !authToken) { throw new Error("enviroments are not set up") }

    const client = createClient({ url, authToken })

    const keys = [];
    const inserts = [];
    const args: any[] = [];

    for (const key in vals) {
        const val = v.parse(
            v.object({ meta: meta_schema, value: v.pipe(v.unknown(), v.check((e) => { return Boolean(e) })) }),
            (vals as any)[key]
        )

        if (val.meta === "set_as") {
            keys.push(key);
            inserts.push("?");
            args.push(val);
        }
    }


    const fetched = await client.execute({
        sql: `INSERT INTO skill (${keys.join(", ")}) VALUES (${inserts.join(", ")}) RETURNING id`,
        args
    });

    return v.parse(v.pipe(v.array(v.object({ id: v.number() })), v.minLength(1)), fetched.rows as any)[0].id
})

export const use_form_loader = routeLoader$<InitialValues<v.InferInput<typeof entity_schema>>>(() => {
    return {
        title: { meta: "set_as", value: "" },
    }
});

export default component$(() => {
    useVisibleTask$(() => {
        const res = v.parse(v.pipe(v.optional(v.string()), v.transform((e) => { if (e === "") { return null } else return e })), "");
        console.log(JSON.stringify(res))
    }, { strategy: "document-ready" })

    const [thisForm, { Form, Field }] = useForm<v.InferInput<typeof entity_schema>>({
        loader: use_form_loader(),
        validate: valiForm$(entity_schema),
    });

    const vals = useComputed$(() => {
        return Object.values(thisForm.internal.fields).map((e) => [e.name, e.value] as const)
    })
    const errors = useComputed$(() => {
        return Object.values(thisForm.internal.fields).map((e) => ({ error: e.error, name: e.name })).filter((e) => e.error !== "")
    })

    const create_more = useSignal(true);
    const status = useSignal("idle" as "idle" | "loading" | "error" | { result: number });

    const loc = useNavigate();
    const submit = $<SubmitHandler<v.InferInput<typeof entity_schema>>>(async (vals,) => {
        status.value = "loading";
        const vals2 = v.parse(entity_schema, vals);
        try {
            const res = await server_submit(vals2);
            status.value = { result: res };
            if (create_more.value) {
                reset(thisForm)
            } else {
                loc(`/admin/skill/${res}`)
            }
        } catch {
            status.value = "error"
        }
    })

    return <div>
        <div class="flex gap-2"><span>Add Skill</span> </div>
        <Form onSubmit$={submit}>
            <div class="flex flex-col gap-2">
                <Field name="title.value">
                    {(field, props) => (
                        <StringField
                            field={field} props={props} store={thisForm}
                            name="title"
                            meta_action_set={{ set_as: { next: "set_as", disabled: false } }}
                        />
                    )}
                </Field>
                <div class="!bg-white flex items-strech gap-1">
                    <div class="flex-1" />
                    {status.value !== "idle" && <div style={{ background: status.value === "loading" ? "var(--color-yellow-400)" : status.value === "error" ? "var(--color-red-400)" : "var(--color-green-400)" }} class="p-1 px-3">
                        {typeof status.value === "string" ? status.value : `success: ${status.value.result}`}
                    </div>}
                    <div>
                        <div class="bg-slate-200 p-1 px-3 self-end cursor-pointer flex gap-1 items-center" onClick$={() => {
                            if (create_more.value) { create_more.value = false } else create_more.value = true
                        }}>
                            <input type="checkbox" checked={create_more.value} />create more
                        </div>
                    </div>
                    <button class="bg-slate-200 cursor-pointer p-1 px-3" type="submit">submit</button>
                </div>
                {false && <div>
                    <span>values: </span>
                    {vals.value.map((e) => {
                        return <div>{e[0]}: {JSON.stringify(e[1])}</div>
                    })}
                </div>}

                {errors.value.length !== 0 &&
                    <div class="flex flex-col p-1">
                        <span>errors:</span>
                        {errors.value.map((e) => <span>{e.name}: {e.error}</span>)}
                    </div>
                }
            </div>
        </Form >
    </div >
})
