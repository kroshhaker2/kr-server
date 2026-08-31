import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import prismaPlugin from "./plugins/prisma.js";
import errorHandler from "./errors/error-handler.js";
import errorPlugin from "./errors/error.plugin.js";
import authPlugin from "./plugins/auth.js";
import healthRoute from "./routes/health.routes.js";
import postsRoute from "./routes/posts.routes.js";
import authRoute from "./routes/auth.routes.js";

const app = Fastify({
    logger: true,
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

const port = Number(process.env.PORT) || 3000;

try {
    await app.listen({
        host: "0.0.0.0",
        port,
    });
} catch (error) {
    app.log.error(error);
    process.exit(1);
}
