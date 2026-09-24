import fp from "fastify-plugin";
import { Client } from "minio";

import { config } from "../config/config.js";

const minio = new Client({
    endPoint: config.MINIO_ENDPOINT,
    port: config.MINIO_PORT,
    useSSL: config.MINIO_USE_SSL,

    accessKey: config.MINIO_ACCESS_KEY,
    secretKey: config.MINIO_SECRET_KEY,
});

export default fp(async (fastify) => {
    const bucket = config.MINIO_BUCKET;

    if (config.NODE_ENV !== "test") {
        const exists = await minio.bucketExists(bucket);

        if (!exists) {
            await minio.makeBucket(bucket);
        }
    }

    fastify.decorate("minio", minio);
    fastify.decorate("minioBucket", bucket);
});
