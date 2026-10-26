import { $, component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { fieldStyle } from "~/components/ui/form_fields";
import { InlineA } from "~/components/ui/inline_link";
import { PrimaryButton } from "~/components/ui/primary_button";
import { form_field } from "~/lib/form_data";
import { is_admin } from "~/server/auth";
import { delete_photo, list_photos, media_error, presign_upload } from "~/server/media";

export const use_photos = routeLoader$(async (event) => {
    if (!is_admin(event)) return { ok: false as const, photos: [], message: "Sign in to manage photos." };
    try {
        return { ok: true as const, photos: await list_photos(event.env), message: "" };
    } catch (error) {
        return { ok: false as const, photos: [], message: media_error(error) };
    }
});

export const use_presign = routeAction$(async (data, event) => {
    if (!is_admin(event)) return { ok: false as const, message: "Sign in to upload." };
    const filename = form_field(data.filename);
    const contentType = form_field(data.contentType);
    if (!filename || !contentType) return { ok: false as const, message: "Pick an image first." };
    try {
        const signed = await presign_upload(event.env, filename, contentType);
        return {
            ok: true as const,
            message: "Upload URL ready.",
            putUrl: signed.putUrl,
            key: signed.key,
            path: signed.path,
            url: signed.url,
        };
    } catch (error) {
        return { ok: false as const, message: media_error(error) };
    }
});

export const use_delete_photo = routeAction$(async (data, event) => {
    if (!is_admin(event)) return { ok: false as const, message: "Sign in to delete." };
    const key = form_field(data.key);
    if (!key) return { ok: false as const, message: "Missing photo key." };
    try {
        await delete_photo(event.env, key);
        return { ok: true as const, message: "Deleted." };
    } catch (error) {
        return { ok: false as const, message: media_error(error) };
    }
});

export default component$(() => {
    const loaded = use_photos();
    const presign = use_presign();
    const remove = use_delete_photo();
    const status = useSignal("");
    const lastPath = useSignal("");
    const lastUrl = useSignal("");
    const fileInput = useSignal<HTMLInputElement>();

    // Flashing Colors When Opening Page:
    // Thumbnail placeholder used to wait on usePrefersDark.
    useStylesScoped$(`
        .thumb {
            width: 100%;
            height: 140px;
            object-fit: cover;
            border-radius: 6px;
            display: block;
        }
        @media (prefers-color-scheme: light) {
            .thumb { background: #f1f5f9; }
        }
        @media (prefers-color-scheme: dark) {
            .thumb { background: #0f172a; }
        }
        .force_scheme_to_light .thumb { background: #f1f5f9; }
        .force_scheme_to_dark .thumb { background: #0f172a; }
    `);

    const upload = $(async () => {
        const input = fileInput.value;
        const file = input?.files?.[0];
        if (!file) {
            status.value = "Pick an image first.";
            return;
        }
        status.value = "Preparing upload…";
        await presign.submit({ filename: file.name, contentType: file.type || "image/jpeg" });
        const signed = presign.value;
        if (!signed?.ok || !("putUrl" in signed) || !signed.putUrl) {
            status.value = signed?.message || "Could not prepare upload.";
            return;
        }
        status.value = "Uploading…";
        try {
            const put = await fetch(signed.putUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type || "image/jpeg" },
            });
            if (!put.ok) {
                status.value = "Upload failed (" + put.status + ").";
                return;
            }
            lastPath.value = signed.path || "";
            lastUrl.value = signed.url || "";
            status.value = "Uploaded.";
            if (input) input.value = "";
            globalThis.location.reload();
        } catch (error) {
            console.error(error);
            status.value = "Upload failed.";
        }
    });

    const copy = $((text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            status.value = "Copied.";
        }).catch(() => {
            status.value = "Could not copy.";
        });
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: 0 }}>Photos</h1>
            <p style={{ margin: 0, opacity: 0.75 }}>
                Files go under <code>raw/</code> on S3. Use the site path (starts with <code>/</code>) in project display picture fields.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    style={fieldStyle}
                />
                <PrimaryButton type="button" onClick$={upload}>
                    Upload
                </PrimaryButton>
            </div>

            {(status.value || lastPath.value) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {status.value && <p style={{ margin: 0 }}>{status.value}</p>}
                    {lastPath.value && (
                        <p style={{ margin: 0 }}>
                            Path: <code>{lastPath.value}</code>{" "}
                            <PrimaryButton type="button" compact onClick$={() => copy(lastPath.value)}>
                                Copy path
                            </PrimaryButton>
                        </p>
                    )}
                    {lastUrl.value && (
                        <p style={{ margin: 0 }}>
                            URL: <InlineA href={lastUrl.value} target="_blank">{lastUrl.value}</InlineA>{" "}
                            <PrimaryButton type="button" compact onClick$={() => copy(lastUrl.value)}>
                                Copy URL
                            </PrimaryButton>
                        </p>
                    )}
                </div>
            )}

            {!loaded.value.ok && loaded.value.message && (
                <p style={{ margin: 0 }}>{loaded.value.message}</p>
            )}

            {remove.value && <p style={{ margin: 0 }}>{remove.value.message}</p>}

            {loaded.value.photos.length === 0 ? (
                <p style={{ margin: 0, opacity: 0.75 }}>No photos in <code>raw/</code> yet.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                    {loaded.value.photos.map((photo) => (
                        <article key={photo.key} style={{ border: "1px solid currentColor", borderRadius: 8, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <a href={photo.url} target="_blank" rel="noreferrer" style={{ display: "block" }}>
                                <img class="thumb" src={photo.url} alt={photo.path} />
                            </a>
                            <code style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>{photo.path}</code>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                                <PrimaryButton type="button" compact onClick$={() => copy(photo.path)}>
                                    Path
                                </PrimaryButton>
                                <PrimaryButton type="button" compact onClick$={() => copy(photo.url)}>
                                    URL
                                </PrimaryButton>
                                <InlineA href={photo.url} target="_blank">Open</InlineA>
                            </div>
                            <Form action={remove}>
                                <input type="hidden" name="key" value={photo.key} />
                                <PrimaryButton type="submit" danger disabled={remove.isRunning}>
                                    Delete
                                </PrimaryButton>
                            </Form>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
});

export const head: DocumentHead = { title: "Admin photos" };
