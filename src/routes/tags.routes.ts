import type { FastifyPluginAsync } from "fastify";

import { createTagsService } from "../services/tags.services.js";
import {
    paramsSchema,
    tagSchema,
    tagsSearchQuerySchema,
    tagUpdateSchema,
} from "../types/tags.types.js";

const admin: FastifyPluginAsync = async (fastify) => {
    const tagsService = createTagsService(fastify.prisma, fastify.error);

    fastify.get("/tags", async (req, reply) => {
        const { q } = tagsSearchQuerySchema.parse(req.query);

        const data = await tagsService.search(q);

        return reply.code(200).send({
            content: {
                data,
            },
        });
    });

    fastify.post("/tags", async (req, reply) => {
        await fastify.authenticate(req);

        if (
            !req.user ||
            req.user.currentBan ||
            (req.user.role !== "MODERATOR" && req.user.role !== "ADMIN")
        )
            throw fastify.error("FORBIDDEN");

        const data = tagSchema.parse(req.body);

        const tag = await tagsService.create(data);

        return reply.code(201).send({ tag });
    });

    fastify.put("/tags/:id", async (req, reply) => {
        await fastify.authenticate(req);

        if (
            !req.user ||
            req.user.currentBan ||
            (req.user.role !== "MODERATOR" && req.user.role !== "ADMIN")
        )
            throw fastify.error("FORBIDDEN");

        const data = tagUpdateSchema.parse(req.body);

        const { id } = paramsSchema.parse(req.params);

        const tag = await tagsService.update(id, data);

        return reply.code(200).send({ tag });
    });

    fastify.delete("/tags/:id", async (req, reply) => {
        await fastify.authenticate(req);

        if (
            !req.user ||
            req.user.currentBan ||
            (req.user.role !== "MODERATOR" && req.user.role !== "ADMIN")
        )
            throw fastify.error("FORBIDDEN");

        const { id } = paramsSchema.parse(req.params);

        await tagsService.delete(id);

        return reply.code(200).send();
    });
};

export default admin;
