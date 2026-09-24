import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number().int().min(1).max(65535).default(3000),

    HOST: z.string().default("0.0.0.0"),

    DATABASE_URL: z.url(),

    CORS_ORIGINS: z.string().transform((value) =>
        value
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean),
    ),

    STORAGE_URL: z.url().default("http://localhost:9000"),

    MINIO_ENDPOINT: z.string().min(1),
    MINIO_PORT: z.coerce.number().int().positive().default(9000),
    MINIO_USE_SSL: z.coerce.boolean().default(false),

    MINIO_ACCESS_KEY: z.string().min(8),
    MINIO_SECRET_KEY: z.string().min(12),

    MINIO_BUCKET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:");

    console.error(z.prettifyError(parsed.error));

    process.exit(1);
}

export const config = parsed.data;
