import { Prisma, PrismaClient } from "../generated/prisma/client.js";

export type PrismaDb = PrismaClient | Prisma.TransactionClient;
