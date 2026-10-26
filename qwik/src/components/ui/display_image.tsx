import { component$ } from "@builder.io/qwik";

/**
 * Image in a fixed aspect-ratio box, used for project pictures.
 *
 * `src` is a site path from /admin/photos such as `/foo.jpg`; the media bucket
 * domain and `/raw` prefix are added here. Without a `src`, a "no preview"
 * placeholder is shown instead.
 *
 * `ratio` is height as a percentage of width (default 66, roughly 3:2).
 */
export const DisplayImage = component$((props: { src?: string | null; ratio?: number }) => {
    const ratio = props.ratio || 66;
    const hasSrc = !!props.src;
    const src = hasSrc
        ? String(import.meta.env.PUBLIC_MEDIA_BUCKET_DOMAIN) + "/raw" + props.src
        : "/noPreview.svg";
    return (
        <div style={{ borderRadius: 12 }}>
            <div style={{ position: "relative", width: "100%", height: 0, paddingBottom: `${ratio}%` }}>
                <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
                    <img
                        src={src}
                        alt="Display Image"
                        style={hasSrc ? {
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 12,
                            display: "block",
                        } : {
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            background: "#ffffff",
                            borderRadius: 12,
                            padding: "1.25rem",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
            </div>
        </div>
    );
});
