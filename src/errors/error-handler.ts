import type { FastifyPluginAsync } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./app-error.js";

const errorHandler: FastifyPluginAsync = async (fastify) => {
    fastify.setErrorHandler((error, request, reply) => {
        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({
                error: {
                    code: error.code,
                    message: error.message,
                },
            });
        }

        if (error instanceof ZodError) {
            const issues = error.issues.map((issue) => ({
                code: issue.code,
                message: issue.message,
                path: issue.path.join("."),
            }));

            return reply.code(400).send({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation failed",
                    details: issues,
                },
            });
        }

        request.log.error(error);

        return reply.code(500).send({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
            },
        });
    });
};

export default errorHandler;
