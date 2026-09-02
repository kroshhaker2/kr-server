import type { FastifyPluginAsync } from "fastify";
import { createAuthService } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../types/auth.types.js";
import { config } from "../config/config.js";

const auth: FastifyPluginAsync = async (fastify) => {
    const authService = createAuthService(fastify.prisma);

    fastify.post("/auth/login", async (req, reply) => {
        const data = loginSchema.parse(req.body);

        const session = await authService.login(data);

        reply.setCookie("session", session.token, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: session.expiresAt,
        });

        return reply.code(204).send();
    });

    fastify.post("/auth/register", async (req, reply) => {
        const data = registerSchema.parse(req.body);

        const session = await authService.register(data);

        reply.setCookie("session", session.token, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: session.expiresAt,
        });

        return reply.code(204).send();
    });

    fastify.post("/auth/logout", async (req, reply) => {
        const token = req.cookies.session;

        if (token) {
            await authService.logout(token);
        }

        reply.clearCookie("session", {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax",
            path: "",
        });

        return reply.code(204).send();
    });

    fastify.get("/auth/me", async (req, reply) => {
        await fastify.authenticate(req);

        const user = req.user!;

        return reply.code(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    });
};

export default auth;
