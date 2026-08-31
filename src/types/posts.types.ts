import { z } from "zod";

export const querySchema = z.object({
    tags: z
        .string()
        .transform((value) =>
            value
                .split("+")
                .map((tag) => tag.trim())
                .filter(Boolean),
        )
        .optional()
        .default([]),

    limit: z.coerce.number().min(1).default(10),

    page: z.coerce.number().min(1).default(1),
});
