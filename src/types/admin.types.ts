import z from "zod";
import { PostStatus, Rating } from "../generated/prisma/enums.js";
import { SortOrder } from "../generated/prisma/internal/prismaNamespace.js";

export const postModerationQuerySchema = z.object({
    status: z.enum(PostStatus),
    order: z.enum(SortOrder).default("asc"),
});

export const postUpdateSchema = z.object({
    id: z.uuidv7(),
    title: z.string().trim().max(120).nullable(),
    description: z.string().trim().max(1000).nullable(),
    rating: z.enum(Rating),
    status: z.enum(PostStatus),
    tags: z.array(z.string().trim().min(1).max(64)).max(30),
    suggestedTags: z.string().trim().max(1000).nullable(),
    sourceUrl: z.url().max(200).nullable(),
});

const commandSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("APPROVE"),
    }),
    z.object({
        type: z.literal("REJECT"),
        reason: z.string().trim().min(1).max(1000),
    }),
    z.object({
        type: z.literal("DELETE"),
        reason: z.string().trim().max(1000).nullable(),
    }),
]);

export const postUpdateRequestSchema = z.object({
    updates: z
        .array(
            z.object({
                post: postUpdateSchema,
                commands: z.array(commandSchema).default([]),
            }),
        )
        .min(1)
        .max(100),
});

export type PostUpdate = z.infer<typeof postUpdateSchema>;
export type PostUpdateRequest = z.infer<typeof postUpdateRequestSchema>;
