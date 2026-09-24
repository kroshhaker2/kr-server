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

    S3_ENDPOINT: z.string().min(1),
    S3_PORT: z.coerce.number().int().positive().default(9000),
    S3_USE_SSL: z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),

    S3_ACCESS_KEY: z.string().min(1),
    S3_SECRET_KEY: z.string().min(12),

    S3_BUCKET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:");

    console.error(z.prettifyError(parsed.error));

    process.exit(1);
}

export const config = parsed.data;
