import crypto from "node:crypto";

export function generateToken(size: number = 32): string {
    return crypto.randomBytes(size).toString("base64url");
}

export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
