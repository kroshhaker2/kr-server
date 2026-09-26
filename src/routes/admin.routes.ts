import type { FastifyPluginAsync } from "fastify";

import { createAdminService } from "../services/admin.service.js";
import { createPostsService } from "../services/posts.service.js";
import { config } from "../config/config.js";
import {
    postModerationQuerySchema,
    postUpdateRequestSchema,
} from "../types/admin.types.js";

const admin: FastifyPluginAsync = async (fastify) => {
    const postsService = createPostsService(
        fastify.prisma,
        fastify.error,
        fastify.minio,
    );
    const adminService = createAdminService(fastify.prisma, fastify.error);

    fastify.get("/admin/mod/posts", async (req, reply) => {
        await fastify.authenticate(req);

        if (
            !req.user ||
            req.user.currentBan ||
            (req.user.role !== "MODERATOR" && req.user.role !== "ADMIN")
        )
            throw fastify.error("FORBIDDEN");

        const { status, order } = postModerationQuerySchema.parse(req.query);

        const data = await postsService.getPostForModeration(status, order);

        return reply.code(200).send({
            content: {
                post: {
                    ...data.post,
                    size: data.post.size.toString(),
                },

                count: data.postCount,

                file: `${config.STORAGE_URL}/posts/${data.post.originalKey}`,
                preview: `${config.STORAGE_URL}/posts/${data.post.previewKey}`,
            },
        });
    });

    fastify.put("/admin/posts", async (req, reply) => {
        await fastify.authenticate(req);

        if (
            !req.user ||
            req.user.currentBan ||
            (req.user.role !== "MODERATOR" && req.user.role !== "ADMIN")
        )
            throw fastify.error("FORBIDDEN");

        const data = postUpdateRequestSchema.parse(req.body);

        await adminService.updatePosts(data.updates, req.user.id);

        return reply.code(200).send();
    });
};

export default admin;
