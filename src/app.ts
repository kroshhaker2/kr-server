import Fastify from "fastify";

import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import prismaPlugin from "./plugins/prisma.js";
import errorPlugin from "./errors/error.plugin.js";
import errorHandler from "./errors/error-handler.js";
import authPlugin from "./plugins/auth.js";

import healthRoute from "./routes/health.routes.js";
import postsRoute from "./routes/posts.routes.js";
import authRoute from "./routes/auth.routes.js";
import { config } from "./config/config.js";

export async function buildApp() {
    const app = Fastify({
        logger:
            config.NODE_ENV !== "production"
                ? {
                      transport: {
                          target: "pino-pretty",
                          options: {
                              colorize: true,
                              translateTime: "HH:MM:ss",
                              ignore: "pid,hostname",
                              singleLine: true,
                          },
                      },
                  }
                : true,
    });

    await app.register(cookie);

    await app.register(cors, {
        origin: true,
    });

    await app.register(prismaPlugin);

    await app.register(errorPlugin);

    await app.register(errorHandler);

    await app.register(authPlugin);

    await app.register(healthRoute, {
        prefix: "/api/v1",
    });

    await app.register(postsRoute, {
        prefix: "/api/v1",
    });

    await app.register(authRoute, {
        prefix: "/api/v1",
    });

    return app;
}
