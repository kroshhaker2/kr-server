import { z } from "zod";
import { Rating } from "../generated/prisma/enums.js";

export type PostFilters = {
    rating?: Rating;
    mimeType?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sort?: "newest" | "oldest" | "views" | "favorites";
};

export type createPost = {
    userId: string;
    rating: Rating;
    tags: string[];
    title?: string;
    description?: string;
    sourceUrl?: string;
    file: Buffer<ArrayBufferLike>;
    filename: string;
};

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

export const uploadPostSchema = z.object({
    title: z
        .string()
        .trim()
        .max(120)
        .optional()
        .transform((value) => value || undefined),

    description: z
        .string()
        .trim()
        .max(1000)
        .optional()
        .transform((value) => value || undefined),

    tags: z.array(z.uuidv7()).max(30).optional().default([]),

    rating: z.enum(Rating),

    sourceUrl: z.url().max(200).optional(),
});
