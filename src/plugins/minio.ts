import fp from "fastify-plugin";
import { Client } from "minio";

import { config } from "../config/config.js";

const minio = new Client({
    endPoint: config.S3_ENDPOINT,
    port: config.S3_PORT,
    useSSL: config.S3_USE_SSL,

    accessKey: config.S3_ACCESS_KEY,
    secretKey: config.S3_SECRET_KEY,
});

export default fp(async (fastify) => {
    const bucket = config.S3_BUCKET;

    if (config.NODE_ENV !== "test") {
        const exists = await minio.bucketExists(bucket);

        if (!exists) {
            await minio.makeBucket(bucket);
        }
    }

    fastify.decorate("minio", minio);
    fastify.decorate("minioBucket", bucket);
});
