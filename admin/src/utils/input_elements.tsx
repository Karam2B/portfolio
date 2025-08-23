import { component$, useComputed$, useSignal, useTask$ } from "@builder.io/qwik";
import { FormStore, getValue, setValue } from "@modular-forms/qwik";
import * as v from "valibot"

export const StringField = component$((p: {
    meta_action_set: Record<string, { next: string, disabled: boolean }>,
    field: any,
    props: any,
    store: FormStore<any>,
    name: string
}) => {
    useTask$(() => {
        const set_active = p.store.internal.fields[p.name + ".meta"]
        if (set_active) {
            set_active.active = true
        }
    }, { eagerness: "load" })
    const def = useComputed$(() => {
        const m = getValue(p.store, p.name + ".meta", { shouldActive: false })
        return v.parse(v.object({
            current: v.string(),
            val: v.strictObject({
                next: v.string(),
                disabled: v.boolean()
            })
        }), { current: m, val: p.meta_action_set[m] })
    })
    const current_state = useSignal(def.value.current);
    const current_state_val = useSignal(def.value.val);
    const disabled_sig = useComputed$(() => {
        return current_state_val.value.disabled
    })
    const display_meta = useComputed$(() => {
        return Object.entries(p.meta_action_set).length >= 1
    })
    return <div class="flex flex-col p-1 px-2 bg-slate-200 dark:bg-slate-700">
        <span class="opacity-70 flex gap-2">
            <span>{p.name}</span>
            {p.field.error && <span class="text-red-400 ellipsis flex-shrink-1">{p.field.error}</span>}
            <span class="flex-1" />
            {display_meta.value && <span class="cursor-pointer user-select-none underline"
                onClick$={() => {
                    const next = current_state_val.value.next
                    current_state.value = next;
                    current_state_val.value = p.meta_action_set[next];
                    setValue(p.store, p.name + "_set", next)
                }}
            >{current_state.value.replace("_", " ")}</span>}
        </span>
        <input {...p.props} class={disabled_sig.value && "opacity-50"} disabled={disabled_sig.value} type="string" value={p.field.value} />
    </div>
})

export const TextareaField = component$((p: {
    meta_action_set: Record<string, { next: string, disabled: boolean }>,
    field: any,
    props: any,
    store: FormStore<any>,
    name: string
}) => {
    useTask$(() => {
        const set_active = p.store.internal.fields[p.name + ".meta"]
        if (set_active) {
            set_active.active = true
        }
    }, { eagerness: "load" })
    const def = useComputed$(() => {
        const m = getValue(p.store, p.name + ".meta", { shouldActive: false })
        return v.parse(v.object({
            current: v.string(),
            val: v.strictObject({
                next: v.string(),
                disabled: v.boolean()
            })
        }), { current: m, val: p.meta_action_set[m] })
    })
    const current_state = useSignal(def.value.current);
    const current_state_val = useSignal(def.value.val);
    const disabled_sig = useComputed$(() => {
        return current_state_val.value.disabled
    })
    const display_meta = useComputed$(() => {
        return Object.entries(p.meta_action_set).length >= 1
    })
    return <div class="flex flex-col p-1 px-2 bg-slate-200 dark:bg-slate-700">
        <span class="opacity-70 flex gap-2">
            <span>{p.name}</span>
            {p.field.error && <span class="text-red-400 ellipsis flex-shrink-1">{p.field.error}</span>}
            <span class="flex-1" />
            {display_meta.value && <span class="cursor-pointer user-select-none underline"
                onClick$={() => {
                    const next = current_state_val.value.next
                    current_state.value = next;
                    current_state_val.value = p.meta_action_set[next];
                    setValue(p.store, p.name + "_set", next)
                }}
            >{current_state.value.replace("_", " ")}</span>}
        </span>
        <textarea {...p.props} class={["min-h-500px ", disabled_sig.value && "opacity-50"]} disabled={disabled_sig.value} value={p.field.value} />
    </div>
})

export const DateField = component$((p: {
    meta_action_set: Record<string, { next: string, disabled: boolean }>,
    field: any,
    props: any,
    store: FormStore<any>,
    name: string
}) => {
    useTask$(() => {
        const set_active = p.store.internal.fields[p.name + ".meta"]
        if (set_active) {
            set_active.active = true
        }
    }, { eagerness: "load" })
    const def = useComputed$(() => {
        const m = getValue(p.store, p.name + ".meta", { shouldActive: false })
        return v.parse(v.object({
            current: v.string(),
            val: v.strictObject({
                next: v.string(),
                disabled: v.boolean()
            })
        }), { current: m, val: p.meta_action_set[m] })
    })
    const current_state = useSignal(def.value.current);
    const current_state_val = useSignal(def.value.val);
    const disabled_sig = useComputed$(() => {
        return current_state_val.value.disabled
    })
    const display_meta = useComputed$(() => {
        return Object.entries(p.meta_action_set).length >= 1
    })
    return <div class="flex flex-col p-1 px-2 bg-slate-200 dark:bg-slate-700">
        <span class="opacity-70 flex gap-2">
            <span>{p.name}</span>
            {p.field.error && <span class="text-red-400 ellipsis flex-shrink-1">{p.field.error}</span>}
            <span class="flex-1" />
            {display_meta.value && <span class="cursor-pointer user-select-none underline"
                onClick$={() => {
                    const next = current_state_val.value.next
                    current_state.value = next;
                    current_state_val.value = p.meta_action_set[next];
                    setValue(p.store, p.name + "_set", next)
                }}
            >{current_state.value.replace("_", " ")}</span>}
        </span>
        <input {...p.props} class={disabled_sig.value && "opacity-50"} disabled={disabled_sig.value} type="string" value={p.field.value} />
    </div>
})

export const PhotoField = component$((p: {
    meta_action_set: Record<string, { next: string, disabled: boolean }>,
    field: any,
    props: any,
    store: FormStore<any>,
    name: string
}) => {
    // useTask$((t) => {
    //     t.track(p.store);
    //     let m = getValue(p.store, p.name + ".value", { shouldActive: false })
    //     // if m is_empty, set p.name+".meta" to "set_null", but what if this is not optional? then rais an issue
    // })
    useTask$(() => {
        const set_active = p.store.internal.fields[p.name + ".meta"]
        if (set_active) {
            set_active.active = true
        }
    }, { eagerness: "load" })
    const def = useComputed$(() => {
        const m = getValue(p.store, p.name + ".meta", { shouldActive: false })
        return v.parse(v.object({
            current: v.string(),
            val: v.strictObject({
                next: v.string(),
                disabled: v.boolean()
            })
        }), { current: m, val: p.meta_action_set[m] })
    })
    const current_state = useSignal(def.value.current);
    const current_state_val = useSignal(def.value.val);
    const disabled_sig = useComputed$(() => {
        return current_state_val.value.disabled
    })
    const display_meta = useComputed$(() => {
        return Object.entries(p.meta_action_set).length >= 1
    })
    return <div class="flex flex-col p-1 px-2 bg-slate-200 dark:bg-slate-700">
        <span class="opacity-70 flex gap-2">
            <span>{p.name}</span>
            {p.field.error && <span class="text-red-400 ellipsis flex-shrink-1">{p.field.error}</span>}
            <span class="flex-1" />
            {display_meta.value && <span class="cursor-pointer user-select-none underline"
                onClick$={() => {
                    const next = current_state_val.value.next
                    current_state.value = next;
                    current_state_val.value = p.meta_action_set[next];
                    setValue(p.store, p.name + "_set", next)
                }}
            >{current_state.value.replace("_", " ")}</span>}
        </span>
        <input {...p.props} class={disabled_sig.value && "opacity-50"} disabled={disabled_sig.value} type="string" value={p.field.value} />
    </div>
})
