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
    async function buildWhere(
        filters: PostFilters,
    ): Promise<Prisma.PostWhereInput> {
        const { rating, mimeType, tags } = filters;
        const tagConditions: Prisma.PostWhereInput[] = [];

        if (tags?.length) {
            const existingTags = await prisma.tag.findMany({
                where: {
                    name: {
                        in: tags,
                    },
                },
                select: {
                    name: true,
                },
            });

            const existingTagNames = new Set(
                existingTags.map((tag) => tag.name),
            );

            for (const name of tags) {
                if (existingTagNames.has(name)) {
                    tagConditions.push({
                        tags: {
                            some: { name },
                        },
                    });
                } else {
                    tagConditions.push({
                        suggestedTags: {
                            contains: name,
                            mode: "insensitive",
                        },
                    });
                }
            }
        }

        return {
            deletedAt: null,
            ...(rating !== undefined && { rating }),
            ...(mimeType !== undefined && { mimeType }),
            ...(tagConditions.length > 0 && { AND: tagConditions }),
        };
    }

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
            const where = await buildWhere(filters);

            return prisma.post.findMany({
                where,
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

            const where = await buildWhere({ rating, mimeType, tags });

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

            const preview = await createPreview(data.file);
            let post: Post | undefined;
            let originalKey: string | undefined;
            let previewKey: string | undefined;

            try {
                post = await prisma.post.create({
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

                originalKey = createObjectKey(
                    post.id,
                    detected.ext,
                    "original",
                );
                previewKey = createObjectKey(
                    post.id,
                    "webp",
                    "preview",
                );

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

                return await prisma.post.update({
                    where: {
                        id: post.id,
                    },
                    data: {
                        originalKey,
                        previewKey,
                    },
                });
            } catch (creationError) {
                const cleanupTasks: PromiseLike<unknown>[] = [];

                if (originalKey) {
                    cleanupTasks.push(
                        minio.removeObject(config.S3_BUCKET, originalKey),
                    );
                }

                if (previewKey) {
                    cleanupTasks.push(
                        minio.removeObject(config.S3_BUCKET, previewKey),
                    );
                }

                if (post) {
                    cleanupTasks.push(
                        prisma.post.deleteMany({
                            where: { id: post.id },
                        }),
                    );
                }

                const cleanupResults = await Promise.allSettled(cleanupTasks);
                const cleanupErrors = cleanupResults.flatMap((result) =>
                    result.status === "rejected" ? [result.reason] : [],
                );

                if (cleanupErrors.length > 0) {
                    throw new AggregateError(
                        [creationError, ...cleanupErrors],
                        "Post creation failed and cleanup was incomplete",
                    );
                }

                throw creationError;
            }
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
