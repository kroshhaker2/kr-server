import type { PrismaClient } from "../generated/prisma/client.js";
import type { AuthenticatedUser } from "./session.types.js";

declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient;
        error: (
            code: import("../errors/error-codes.js").ErrorCode,
        ) => import("../errors/app-error.js").AppError;
        authenticate: (request: FastifyRequest) => Promise<void>;
    }

    interface FastifyRequest {
        user?: AuthenticatedUser | null;
    }

    interface FastifyInstance {
        minio: Minio.Client;
        minioBucket: string;
    }
}
