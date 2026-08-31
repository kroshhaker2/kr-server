import { PrismaDb } from "../types/db.types.js";

import { createUserService } from "./user.service.js";
import { createSessionService } from "./session.service.js";

export function createServices(prisma: PrismaDb) {
    return {
        users: createUserService(prisma),
        sessions: createSessionService(prisma),
    };
}
