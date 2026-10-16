import { S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";

export const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
] as const;

export type Photo = {
    key: string;
    path: string;
    url: string;
};

function media_config(env: EnvGetter) {
    const accessKeyId = env.get("AWS_ACCESS_KEY_ID");
    const secretAccessKey = env.get("AWS_SECRET_ACCESS_KEY");
    const region = env.get("AWS_REGION") || "us-west-2";
    const bucket = env.get("AWS_S3_BUCKET");
    const publicDomain = env.get("PUBLIC_MEDIA_BUCKET_DOMAIN");
    if (!accessKeyId || !secretAccessKey || !bucket) {
        throw new Error("media is not configured");
    }
    return { accessKeyId, secretAccessKey, region, bucket, publicDomain };
}

function s3_client(env: EnvGetter) {
    const cfg = media_config(env);
    return {
        client: new S3Client({
            region: cfg.region,
            credentials: {
                accessKeyId: cfg.accessKeyId,
                secretAccessKey: cfg.secretAccessKey,
            },
        }),
        bucket: cfg.bucket,
        publicDomain: cfg.publicDomain,
    };
}

// Object key is raw/foo.jpg. Site path is /foo.jpg (DisplayImage prepends /raw).
function photo_from_key(key: string, publicDomain: string | null | undefined): Photo {
    const path = "/" + key.replace(/^raw\//, "");
    const url = publicDomain
        ? publicDomain.replace(/\/$/, "") + "/raw" + path
        : path;
    return { key, path, url };
}

export function sanitize_filename(name: string) {
    const base = name.split(/[/\\]/).pop() || "photo";
    const cleaned = base
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return cleaned || "photo";
}

export async function list_photos(env: EnvGetter): Promise<Photo[]> {
    const { client, bucket, publicDomain } = s3_client(env);
    const photos: Photo[] = [];
    let token: string | undefined;
    do {
        const page = await client.send(new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: "raw/",
            ContinuationToken: token,
        }));
        for (const item of page.Contents || []) {
            if (!item.Key || item.Key.endsWith("/")) continue;
            photos.push(photo_from_key(item.Key, publicDomain));
        }
        token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
    photos.sort((a, b) => a.key.localeCompare(b.key));
    return photos;
}

export async function presign_upload(env: EnvGetter, filename: string, contentType: string) {
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(contentType)) {
        throw new Error("unsupported type");
    }
    const { client, bucket, publicDomain } = s3_client(env);
    const safe = sanitize_filename(filename);
    const key = `raw/${Date.now()}-${safe}`;
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
    });
    const putUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    const photo = photo_from_key(key, publicDomain);
    return { putUrl, ...photo };
}

export async function delete_photo(env: EnvGetter, key: string) {
    if (!key.startsWith("raw/") || key.includes("..") || key.endsWith("/")) {
        throw new Error("invalid key");
    }
    const { client, bucket } = s3_client(env);
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function media_error(error: unknown) {
    console.error(error);
    if (error instanceof Error && error.message === "media is not configured") {
        return "Media storage is not configured.";
    }
    if (error instanceof Error && error.message === "unsupported type") {
        return "Use a jpeg, png, webp, gif, or svg image.";
    }
    if (error instanceof Error && error.message === "invalid key") {
        return "That photo key is not allowed.";
    }
    return "Could not update media.";
}
