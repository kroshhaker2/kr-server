import fp from "fastify-plugin";
import { createErrorFactory } from "./error-factory.js";
import { errorConfig } from "./error-codes.js";

export default fp(async (fastify) => {
    fastify.decorate("error", createErrorFactory(errorConfig));
});
