import type { FastifyPluginAsync } from "fastify";

const health: FastifyPluginAsync = async (fastify) => {
    fastify.get("/health", async () => {
        return {
            status: "ok",
        };
    });
};

export default health;