import fp from "fastify-plugin";
import { createSessionService } from "../services/session.service.js";

export default fp(async (fastify) => {
    const sessions = createSessionService(fastify.prisma);

    fastify.decorateRequest("user", null);

    fastify.decorate("authenticate", async (request) => {
        const token = request.cookies.session;

        if (!token) {
            throw fastify.error("UNAUTHORIZED");
        }

        const user = await sessions.getUserBySession(token);

        request.user = user ?? null;
    });
});
