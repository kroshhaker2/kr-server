import type { PrismaClient, User } from "../generated/prisma/client.js";
import { createUserService } from "./user.service.js";
import { createSessionService } from "./session.service.js";
import {
    verifyPassword,
    hashPassword,
    validatePasswordStrength,
} from "../utils/password.js";
import { AuthResult } from "../types/auth.types.js";
import { createServices } from "./index.js";
import { error } from "../errors/error-factory.js";
import { hashToken } from "../utils/token.js";

export function createAuthService(prisma: PrismaClient) {
    const userService = createUserService(prisma);
    const sessionService = createSessionService(prisma);

    return {
        async register(data: {
            username: string;
            email: string;
            password: string;
        }): Promise<AuthResult> {
            validatePasswordStrength(data.password);

            const passwordHash = await hashPassword(data.password);

            const result = await prisma.$transaction(async (tx) => {
                const services = createServices(tx);

                const user = await services.users.create({
                    email: data.email,
                    username: data.username,
                    passwordHash,
                });

                const session = await services.sessions.create(user.id);

                return {
                    user,
                    session,
                };
            });

            return result.session;
        },

        async login(data: {
            email: string;
            password: string;
        }): Promise<AuthResult> {
            const user = await userService.getByEmail(data.email);

            if (!user) {
                throw error("INVALID_CREDENTIALS");
            }

            const valid = await verifyPassword(data.password, user.passwordHash);

            if (!valid) {
                throw error("INVALID_CREDENTIALS");
            }

            return sessionService.create(user.id);
        },

        async logout(token: string): Promise<void> {
            return sessionService.delete(token);
        },
    };
}
