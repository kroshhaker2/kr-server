import z from "zod";

export const createUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email(),
});
