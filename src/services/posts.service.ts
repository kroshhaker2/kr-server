import { fileTypeFromBuffer } from "file-type";

import { Prisma, type Post } from "../generated/prisma/client.js";
import { PrismaDb } from "../types/db.types.js";
import { createPost, PostFilters } from "../types/posts.types.js";
import { createObjectKey } from "../utils/minio.js";
import fastify, { FastifyInstance } from "fastify";
import { Client } from "minio";
import { config } from "../config/config.js";
import { createPreview } from "../utils/preview.js";

export function createPostsService(
    prisma: PrismaDb,
    error: FastifyInstance["error"],
    minio: Client,
) {
    return {
        async getById(id: string): Promise<Post> {
            const post = await prisma.post.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });

            if (!post) {
                throw error("POST_NOT_FOUND");
            }

            return post;
        },

        async getAll(filters: PostFilters = {}): Promise<Post[]> {
            const { rating, mimeType, tags } = filters;

            return prisma.post.findMany({
                where: {
                    deletedAt: null,

                    ...(rating !== undefined && { rating }),
                    ...(mimeType !== undefined && { mimeType }),

                    ...(tags?.length && {
                        AND: tags.map((name) => ({
                            tags: {
                                some: { name },
                            },
                        })),
                    }),
                },
                orderBy: {
                    id: "desc",
                },
                include: {
                    tags: {
                        select: { name: true },
                    },
                },
            });
        },

        async getPage(filters: PostFilters = {}) {
            const {
                rating,
                mimeType,
                tags,
                page = 1,
                limit = 20,
                sort = "newest",
            } = filters;

            const where: Prisma.PostWhereInput = {
                deletedAt: null,
                ...(rating !== undefined && { rating }),
                ...(mimeType !== undefined && { mimeType }),
                ...(tags?.length && {
                    AND: tags.map((name) => ({
                        tags: { some: { name } },
                    })),
                }),
            };

            const sorting: Record<
                NonNullable<PostFilters["sort"]>,
                Prisma.PostOrderByWithRelationInput[]
            > = {
                newest: [{ createdAt: "desc" }, { id: "desc" }],
                oldest: [{ createdAt: "asc" }, { id: "asc" }],
                views: [{ views: "desc" }, { id: "desc" }],
                favorites: [{ favorites: "desc" }, { id: "desc" }],
            };

            const [content, total] = await prisma.$transaction([
                prisma.post.findMany({
                    where,
                    orderBy: sorting[sort],
                    skip: (page - 1) * limit,
                    take: limit,
                    include: {
                        tags: {
                            select: { name: true },
                        },
                    },
                }),
                prisma.post.count({ where }),
            ]);

            return {
                content,
                pages: Math.ceil(total / limit),
            };
        },

        async getAllIncludingDeleted(): Promise<Post[]> {
            return prisma.post.findMany({
                orderBy: {
                    id: "desc",
                },
            });
        },

        async create(data: createPost): Promise<Post> {
            const allowedTypes = new Set([
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
            ]);

            const detected = await fileTypeFromBuffer(data.file);

            if (!detected || !allowedTypes.has(detected.mime)) {
                throw error("UNSUPPORTED_FILE_TYPE");
            }

            const post = await prisma.post.create({
                data: {
                    rating: data.rating,
                    title: data.title,
                    description: data.description,
                    sourceUrl: data.sourceUrl,
                    originalFilename: data.filename,
                    size: BigInt(data.file.length),
                    mimeType: detected.mime,
                    views: 0,
                    favorites: 0,
                    originalKey: "",
                },
            });

            const originalKey = createObjectKey(
                post.id,
                detected.ext,
                "original",
            );
            const previewKey = createObjectKey(
                post.id,
                "webp",
                "preview",
            );

            const preview = await createPreview(data.file);

            await minio.putObject(
                config.S3_BUCKET,
                originalKey,
                data.file,
                data.file.length,
                {
                    "Content-Type": detected.mime,
                },
            );

            await minio.putObject(
                config.S3_BUCKET,
                previewKey,
                preview,
                preview.length,
                {
                    "Content-Type": "image/webp",
                },
            );

            return prisma.post.update({
                where: {
                    id: post.id,
                },
                data: {
                    originalKey,
                    previewKey,
                },
            });
        },

        async update(
            id: string,
            data: Partial<Omit<Post, "id">>,
        ): Promise<Post> {
            return prisma.post.update({
                where: { id },
                data,
            });
        },

        async delete(id: string): Promise<Post> {
            return prisma.post.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
        },

        async restore(id: string): Promise<Post> {
            return prisma.post.update({
                where: { id },
                data: {
                    deletedAt: null,
                },
            });
        },

        async hardDelete(id: string) {
            return prisma.post.delete({
                where: { id },
            });
        },
    };
}
