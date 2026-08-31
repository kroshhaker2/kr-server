import z from "zod";
import { ErrorCode } from "../errors/error-codes.js";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(128),
});

export const registerSchema = z.object({
    email: z.email(),
    username: z
        .string()
        .min(4, ErrorCode.USERNAME_TOO_SHORT)
        .max(20, ErrorCode.USERNAME_TOO_LONG)
        .regex(/^[a-zA-Z0-9_]+$/, ErrorCode.USERNAME_INVALID_CHARACTERS),
    password: z
        .string()
        .min(8, ErrorCode.PASSWORD_TOO_SHORT)
        .max(128, ErrorCode.PASSWORD_TOO_LONG),
});

export type AuthResult = {
    token: string;
    expiresAt: Date;
};
