import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number()
        .int()
        .min(1)
        .max(65535)
        .default(3000),

    HOST: z.string()
        .default("0.0.0.0"),

    DATABASE_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:");

    console.error(
        z.prettifyError(parsed.error)
    );

    process.exit(1);
}

export const config = parsed.data;