import type { FastifyPluginAsync } from "fastify";
import { querySchema } from "../types/posts.types.js";

const posts: FastifyPluginAsync = async (fastify) => {
    fastify.get("/posts", async (req, reply) => {
        const { tags, limit, page } = querySchema.parse(req.query);
    });
};

export default posts;
