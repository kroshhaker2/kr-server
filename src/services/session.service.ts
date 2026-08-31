import { User } from "../generated/prisma/client.js";
import { PrismaDb } from "../types/db.types.js";
import type { CreatedSession } from "../types/session.types.js";
import { generateToken, hashToken } from "../utils/token.js";
import { error } from "../errors/error-factory.js";

export function createSessionService(prisma: PrismaDb) {
    return {
        async create(userId: string): Promise<CreatedSession> {
            const token = generateToken();

            const tokenHash = hashToken(token);

            const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

            await prisma.session.create({
                data: {
                    tokenHash,
                    userId: userId,
                    expiresAt,
                },
            });

            return {
                token,
                expiresAt,
            };
        },

        async delete(token: string): Promise<void> {
            const tokenHash = hashToken(token);

            await prisma.session.deleteMany({ where: { tokenHash } });
        },

        async getUserBySession(token: string): Promise<User> {
            const tokenHash = hashToken(token);

            const session = await prisma.session.findUnique({
                where: {
                    tokenHash,
                },
                include: {
                    user: true,
                },
            });

            if (!session) {
                throw error("SESSION_NOT_FOUND");
            }

            if (session.expiresAt <= new Date()) {
                await prisma.session.delete({
                    where: {
                        id: session.id,
                    },
                });

                throw error("SESSION_EXPIRED");
            }

            if (session.user.deletedAt) {
                throw error("UNAUTHORIZED");
            }

            return session.user;
        },
    };
}
