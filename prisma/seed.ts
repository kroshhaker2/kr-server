import "dotenv/config";
import crypto from "node:crypto";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

function getArg(name: string): string | undefined {
    const index = process.argv.indexOf(`--${name}`);

    if (index === -1) {
        return undefined;
    }

    return process.argv[index + 1];
}

function generatePassword(length = 20): string {
    return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

async function main() {
    const username = getArg("username") ?? "admin";
    const email = getArg("email") ?? `${username}@example.com`;

    const providedPassword = getArg("password");
    const password = providedPassword ?? generatePassword();

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
    });

    const user = await prisma.user.upsert({
        where: {
            email,
        },

        update: {
            username,
            passwordHash,
            role: "ADMIN",
        },

        create: {
            username,
            email,
            passwordHash,
            role: "ADMIN",
        },
    });

    console.log();
    console.log("Seed completed");
    console.log("-------------------------");
    console.log(`ID:       ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ${user.role}`);
    console.log("-------------------------");
    console.log();
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
