import type { FastifyPluginAsync } from "fastify";
import { createErrorFactory } from "./error-factory.js";
import { errorConfig } from "./error-codes.js";

const errorPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.decorate("error", createErrorFactory(errorConfig));
};

export default errorPlugin;
