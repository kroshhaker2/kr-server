import { error as getError } from "../errors/error-factory.js";
import {
    Prisma,
    type User,
    type UserRole,
} from "../generated/prisma/client.js";
import { PrismaDb } from "../types/db.types.js";

export function createUserService(prisma: PrismaDb) {
    return {
        async getById(id: string): Promise<User | null> {
            return prisma.user.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
        },

        async getByEmail(email: string): Promise<User | null> {
            return prisma.user.findFirst({
                where: {
                    email,
                    deletedAt: null,
                },
            });
        },

        async getAll(): Promise<User[]> {
            return prisma.user.findMany({
                where: {
                    deletedAt: null,
                },
                orderBy: {
                    id: "desc",
                },
            });
        },

        async getAllIncludingDeleted(): Promise<User[]> {
            return prisma.user.findMany({
                orderBy: {
                    id: "desc",
                },
            });
        },

        async create(data: {
            email: string;
            username: string;
            passwordHash: string;
        }): Promise<User> {
            try {
                return await prisma.user.create({
                    data,
                });
            } catch (error) {
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002"
                ) {
                    const target = error.meta?.target;
                    const constraintName =
                        error.meta?.driverAdapterError?.cause?.constraint?.index ??
                        (Array.isArray(target) ? target.join("_") : undefined);

                    if (constraintName?.includes("email")) {
                        throw getError("EMAIL_ALREADY_EXISTS");
                    }

                    if (constraintName?.includes("username")) {
                        throw getError("USERNAME_ALREADY_EXISTS");
                    }
                }

                throw error;
            }
        },

        async update(
            id: string,
            data: {
                name?: string;
                email?: string;
                passwordHash?: string;
                role?: UserRole;
            },
        ): Promise<User> {
            return prisma.user.update({
                where: { id },
                data,
            });
        },

        async delete(id: string): Promise<User> {
            return prisma.user.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
        },

        async restore(id: string): Promise<User> {
            return prisma.user.update({
                where: { id },
                data: {
                    deletedAt: null,
                },
            });
        },

        async hardDelete(id: string) {
            return prisma.user.delete({
                where: { id },
            });
        },
    };
}
