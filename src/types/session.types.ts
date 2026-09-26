import type { User, UserRestriction } from "../generated/prisma/client.js";

export type CreatedSession = {
    token: string;
    expiresAt: Date;
};

export type AuthenticatedUser = User & {
    currentBan: UserRestriction | null;
    uploadBan: UserRestriction | null;
};
