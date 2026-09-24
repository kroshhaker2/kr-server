import { config } from "../config/config.js";

import { createHash } from "node:crypto";

export function createObjectKey(id: string, ext: string, type: string): string {
    const hash = createHash("sha256").update(id).digest("hex");
    const extension = ext.replace(/^\./, "");

    return `${type}/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${id}.${extension}`;
}

export function fileUrl(key: string, bucket: string): string {
    const baseUrl = config.STORAGE_URL.replace(/\/+$/, "");
    const path = key.split("/").map(encodeURIComponent).join("/");

    return `${baseUrl}/${encodeURIComponent(bucket)}/${path}`;
}