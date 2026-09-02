import type { PrismaClient } from "../../src/generated/prisma/client.js";

export async function cleanDatabase(prisma: PrismaClient) {
    await prisma.$transaction([
        prisma.moderationAction.deleteMany(),
        prisma.userRestriction.deleteMany(),
        prisma.session.deleteMany(),
        prisma.post.deleteMany(),
        prisma.tag.deleteMany(),
        prisma.user.deleteMany(),
    ]);
}
