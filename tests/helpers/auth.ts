import type { FastifyInstance } from "fastify";

export async function registerUser(
    app: FastifyInstance,
    data: { username: string; email: string; password: string },
) {
    return app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: data,
    });
}

export async function loginUser(
    app: FastifyInstance,
    data: { email: string; password: string },
) {
    return app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: data,
    });
}

export async function getMe(app: FastifyInstance, cookie: string) {
    return app.inject({
        method: "GET",
        url: "/api/v1/auth/me",
        cookies: { session: cookie },
    });
}

export async function logoutUser(app: FastifyInstance, cookie: string) {
    return app.inject({
        method: "POST",
        url: "/api/v1/auth/logout",
        cookies: { session: cookie },
    });
}

export function extractSessionCookie(response: {
    cookies: Array<{ name: string; value: string }>;
}): string | undefined {
    return response.cookies.find((c) => c.name === "session")?.value;
}

export function uniqueEmail(prefix = "user") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
}

let counter = 0;
export function uniqueUsername() {
    counter++;
    const ts = Date.now().toString(36);
    return `u${ts.slice(-4)}${counter}`.slice(0, 20);
}
