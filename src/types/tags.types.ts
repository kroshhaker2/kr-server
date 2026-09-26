import z from "zod";
import { TagType } from "../generated/prisma/enums.js";

export const tagsSearchQuerySchema = z.object({
    q: z.string().optional().default(""),
});

export const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const tagUpdateSchema = z.object({
    name: z.string().trim().min(1).max(64).optional(),
    type: z.enum(TagType).optional(),
});

export const tagSchema = z.object({
    name: z.string().trim().min(1).max(64),
    type: z.enum(TagType),
});

export type TagUpdateSchema = z.infer<typeof tagUpdateSchema>;
export type TagSchema = z.infer<typeof tagSchema>;
