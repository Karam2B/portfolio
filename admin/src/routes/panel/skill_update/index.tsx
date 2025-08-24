import { $, component$, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import * as v from "valibot"
import { InitialValues, SubmitHandler, useForm, valiForm$ } from "@modular-forms/qwik"
import { client } from "~/utils/client";
import { StringField } from "~/utils/input_elements";
import { meta_update, meta_update_schema, return_schema_and_transform } from "~/utils/on_update";
import { required_string } from "~/utils/valibot_ext";

const entity_schema = v.object({
    title: v.strictObject({ meta: meta_update_schema, value: required_string }),
});

export const server_submit = server$(async function(this, vals: { project: v.InferOutput<typeof entity_schema>, id: number }) {
    if (vals.project.title.meta === "set_as") {
        const fetched = await client(this.env).execute({
            sql: `UPDATE skill SET title = ? WHERE id = ? RETURNING id`,
            args: [vals.project.title.value, vals.id]
        });
        return v.parse(v.pipe(v.array(v.object({ id: v.number() })), v.minLength(1)), fetched.rows as any)[0].id
    } else { return vals.id }
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
        sql: `SELECT * FROM skill WHERE id = ?`,
        args: [id]
    });

    return v.parse(v.pipe(v.array(
        v.object({
            title: return_schema_and_transform(entity_schema.entries.title, "set_as")
        })
    ), v.minLength(1)), res.rows)[0]
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

    const status = useSignal(null as null | "loading" | number);

    const submit = $<SubmitHandler<v.InferInput<typeof entity_schema>>>(async (vals, evn) => {
        status.value = "loading";
        const vals2 = v.parse(entity_schema, vals);
        const res = await server_submit({ project: vals2, id: id.value });
        status.value = res;
    })

    return <div>
        <div class="flex gap-2"><span>Update Skill</span> </div>
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
                <div class="!bg-white flex items-strech gap-1">
                    <div class="flex-1" />
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
