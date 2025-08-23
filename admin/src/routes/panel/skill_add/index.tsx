import { createClient } from "@libsql/client"
import { $, component$, useComputed$, useSignal, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useNavigate } from "@builder.io/qwik-city";
import * as v from "valibot"
import { InitialValues, SubmitHandler, reset, useForm, valiForm$ } from "@modular-forms/qwik"

const project_schema = v.object({
    title: v.pipe(v.string("has tobe string"), v.nonEmpty("title cannot be null")),
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
        sql: `INSERT INTO skill (title) VALUES (?) RETURNING id`,
        args: [vals.title]
    });

    return v.parse(v.pipe(v.array(v.object({ id: v.number() })), v.minLength(1)), fetched.rows as any)[0].id
})

export const use_form_loader = routeLoader$<InitialValues<v.InferInput<typeof project_schema>>>(() => {
    return {
        title: "",
    }
});

export default component$(() => {
    useVisibleTask$(() => {
        const res = v.parse(v.pipe(v.optional(v.string()), v.transform((e) => { if (e === "") { return null } else return e })), "");
        console.log(JSON.stringify(res))
    }, { strategy: "document-ready" })

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

    const create_more = useSignal(true);
    const status = useSignal(null as null | "loading" | number);

    const loc = useNavigate();
    const submit = $<SubmitHandler<v.InferInput<typeof project_schema>>>(async (vals, evn) => {
        status.value = "loading";
        const vals2 = v.parse(project_schema, vals);
        const res = await server_submit(vals2);
        status.value = res;
        if (create_more.value) {
            reset(thisForm)
        } else {
            loc(`/admin/skill/${res}`)
        }
    })

    return <div>
        <div class="flex gap-2"><span>Add Skill</span> </div>
        <Form onSubmit$={submit}>
            <div class="flex flex-col gap-2">
                <Field name="title">
                    {(field, props) => (
                        <div class="flex flex-col p-1 bg-slate-200">
                            <span class="opacity-70 flex gap-2">
                                <span>{props.name}</span>
                                {field.error && <span class="text-red-400 ellipsis">{field.error}</span>}
                            </span>
                            <input {...props} type="string" value={field.value} />
                        </div>
                    )}
                </Field>
                <div class="!bg-white flex items-strech gap-1">
                    <div class="flex-1" />
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

                {status.value !== null && <div class="flex gap-2 p-1">
                    {typeof status.value === "number" && <span class="text-green-500">Success: {status.value}</span>}
                    {status.value === "loading" && <span class="text-orange-500">loading</span>}
                </div>}
                {errors.value.length !== 0 &&
                    <div class="flex flex-col p-1">
                        <span>errors:</span>
                        {errors.value.map((e) => <span>{e}</span>)}
                    </div>
                }
            </div>
        </Form >
    </div >
})
