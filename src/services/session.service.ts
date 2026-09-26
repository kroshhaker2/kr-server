import { PrismaDb } from "../types/db.types.js";
import type {
    AuthenticatedUser,
    CreatedSession,
} from "../types/session.types.js";
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

        async getUserBySession(token: string): Promise<AuthenticatedUser> {
            const tokenHash = hashToken(token);
            const now = new Date();

            const session = await prisma.session.findUnique({
                where: {
                    tokenHash,
                },
                include: {
                    user: {
                        include: {
                            restrictions: {
                                where: {
                                    OR: [
                                        {
                                            expiresAt: null,
                                        },
                                        {
                                            expiresAt: { gt: now },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            });

            if (!session) {
                throw error("SESSION_NOT_FOUND");
            }

            if (session.expiresAt <= now) {
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

            const currentBan =
                session.user.restrictions.find(
                    (restriction) => restriction.type === "BAN",
                ) ?? null;

            const uploadBan =
                session.user.restrictions.find(
                    (restriction) => restriction.type === "UPLOAD_BAN",
                ) ?? null;

            return {
                id: session.user.id,
                username: session.user.username,
                email: session.user.email,
                passwordHash: session.user.passwordHash,
                role: session.user.role,
                deletedAt: session.user.deletedAt,
                createdAt: session.user.createdAt,
                updatedAt: session.user.updatedAt,
                currentBan,
                uploadBan,
            };
        },
    };
}
