import type { FastifyInstance } from "fastify";

import type { PostUpdateRequest } from "../types/admin.types.js";

export function createAdminService(
    prisma: FastifyInstance["prisma"],
    error: FastifyInstance["error"],
) {
    return {
        async updatePosts(
            updates: PostUpdateRequest["updates"],
            moderatorId: string,
        ): Promise<void> {
            const moderatedAt = new Date();

            await prisma.$transaction(async (transaction) => {
                for (const { post } of updates) {
                    const { id, tags, ...data } = post;

                    const existingPost = await transaction.post.findUnique({
                        where: { id },
                        select: { id: true },
                    });

                    if (!existingPost) {
                        throw error("POST_NOT_FOUND");
                    }

                    await transaction.post.update({
                        where: { id },
                        data: {
                            ...data,
                            tags: {
                                set: tags.map((name) => ({ name })),
                            },
                            moderatedById: moderatorId,
                            moderatedAt,
                        },
                    });
                }
            });
        },
    };
}
