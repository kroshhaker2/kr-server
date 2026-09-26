import { TagType, type Tag } from "../generated/prisma/client.js";
import { PrismaDb } from "../types/db.types.js";
import { FastifyInstance } from "fastify";
import { TagSchema, TagUpdateSchema } from "../types/tags.types.js";

export function createTagsService(
    prisma: PrismaDb,
    error: FastifyInstance["error"],
) {
    return {
        async getById(id: number): Promise<Tag> {
            const tag = await prisma.tag.findUnique({
                where: {
                    id,
                },
            });

            if (!tag) {
                throw error("TAG_NOT_FOUND");
            }

            return tag;
        },

        async getByName(name: string): Promise<Tag> {
            const tag = await prisma.tag.findUnique({
                where: {
                    name,
                },
            });

            if (!tag) {
                throw error("TAG_NOT_FOUND");
            }

            return tag;
        },

        async getAll(type?: TagType): Promise<Tag[]> {
            return prisma.tag.findMany({
                where: {
                    type,
                },
                orderBy: {
                    id: "desc",
                },
            });
        },

        async search(startsWith: string): Promise<Tag[]> {
            return prisma.tag.findMany({
                where: {
                    name: {
                        startsWith,
                    },
                },
            });
        },

        async create(data: TagSchema): Promise<Tag> {
            return prisma.tag.create({
                data,
            });
        },

        async update(id: number, data: TagUpdateSchema): Promise<Tag> {
            await this.getById(id);

            return prisma.tag.update({
                where: { id },
                data,
            });
        },

        async delete(id: number): Promise<Tag> {
            await this.getById(id);

            return prisma.tag.delete({
                where: { id },
            });
        },
    };
}
