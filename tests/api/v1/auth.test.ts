import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/db.js";
import {
    registerUser,
    loginUser,
    getMe,
    logoutUser,
    extractSessionCookie,
    uniqueEmail,
    uniqueUsername,
} from "../../helpers/auth.js";

describe("Auth", () => {
    let app: Awaited<ReturnType<typeof buildApp>>;

    beforeAll(async () => {
        app = await buildApp();
    });

    afterAll(async () => {
        await app?.close();
    });

    beforeEach(async () => {
        await cleanDatabase(app.prisma);
    });

    // ================================================================
    // POST /api/v1/auth/register
    // ================================================================

    describe("POST /api/v1/auth/register", () => {
        const validPassword = "Str0ng!Pass#2024";

        it("registers a user and creates a session", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            const response = await registerUser(app, {
                username,
                email,
                password: validPassword,
            });

            expect(response.statusCode).toBe(204);

            const sessionCookie = response.cookies.find(
                (c) => c.name === "session",
            );

            expect(sessionCookie).toBeDefined();
            expect(sessionCookie!.httpOnly).toBe(true);
            expect(sessionCookie!.sameSite).toBe("Lax");
            expect(sessionCookie!.path).toBe("/");

            const me = await getMe(app, sessionCookie!.value);

            expect(me.statusCode).toBe(200);
            expect(me.json()).toMatchObject({
                username,
                email,
                role: "USER",
            });
            expect(me.json().id).toBeDefined();
            expect(me.json().createdAt).toBeDefined();
        });

        it("rejects duplicate email", async () => {
            const email = uniqueEmail();
            const username1 = uniqueUsername();
            const username2 = uniqueUsername();

            await registerUser(app, {
                username: username1,
                email,
                password: validPassword,
            });

            const response = await registerUser(app, {
                username: username2,
                email,
                password: validPassword,
            });

            expect(response.statusCode).toBe(409);
            expect(response.json()).toEqual({
                error: {
                    code: "EMAIL_ALREADY_EXISTS",
                    message: "Email is already registered",
                },
            });
        });

        it("rejects duplicate username", async () => {
            const username = uniqueUsername();

            await registerUser(app, {
                username,
                email: uniqueEmail(),
                password: validPassword,
            });

            const response = await registerUser(app, {
                username,
                email: uniqueEmail(),
                password: validPassword,
            });

            expect(response.statusCode).toBe(409);
            expect(response.json()).toEqual({
                error: {
                    code: "USERNAME_ALREADY_EXISTS",
                    message: "Username is already registered",
                },
            });
        });

        it("rejects invalid email format", async () => {
            const response = await registerUser(app, {
                username: uniqueUsername(),
                email: "not-an-email",
                password: validPassword,
            });

            expect(response.statusCode).toBe(400);
            const body = response.json();
            expect(body.error.code).toBe("VALIDATION_ERROR");
            expect(body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ path: "email" }),
                ]),
            );
        });

        it("rejects empty email", async () => {
            const response = await registerUser(app, {
                username: uniqueUsername(),
                email: "",
                password: validPassword,
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects username shorter than 4 characters", async () => {
            const response = await registerUser(app, {
                username: "ab",
                email: uniqueEmail(),
                password: validPassword,
            });

            expect(response.statusCode).toBe(400);
            const body = response.json();
            expect(body.error.code).toBe("VALIDATION_ERROR");
            expect(body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ path: "username" }),
                ]),
            );
        });

        it("accepts username with exactly 4 characters", async () => {
            const response = await registerUser(app, {
                username: "abcd",
                email: uniqueEmail(),
                password: validPassword,
            });

            expect(response.statusCode).toBe(204);
        });

        it("accepts username with exactly 20 characters", async () => {
            const response = await registerUser(app, {
                username: "a".repeat(20),
                email: uniqueEmail(),
                password: validPassword,
            });

            expect(response.statusCode).toBe(204);
        });

        it("rejects username longer than 20 characters", async () => {
            const response = await registerUser(app, {
                username: "a".repeat(21),
                email: uniqueEmail(),
                password: validPassword,
            });

            expect(response.statusCode).toBe(400);
            const body = response.json();
            expect(body.error.code).toBe("VALIDATION_ERROR");
            expect(body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ path: "username" }),
                ]),
            );
        });

        it("rejects username with invalid characters", async () => {
            const invalidUsernames = [
                "user name",
                "user@name",
                "user-name",
                "user.name",
                "user!name",
                "кириллица",
            ];

            for (const username of invalidUsernames) {
                const response = await registerUser(app, {
                    username,
                    email: uniqueEmail(),
                    password: validPassword,
                });

                expect(response.statusCode).toBe(400);
                expect(response.json().error.code).toBe("VALIDATION_ERROR");
            }
        });

        it("accepts username with underscores and digits", async () => {
            const response = await registerUser(app, {
                username: "user_123_test",
                email: uniqueEmail(),
                password: validPassword,
            });

            expect(response.statusCode).toBe(204);
        });

        it("rejects password shorter than 8 characters", async () => {
            const response = await registerUser(app, {
                username: uniqueUsername(),
                email: uniqueEmail(),
                password: "Short1!",
            });

            expect(response.statusCode).toBe(400);
            const body = response.json();
            expect(body.error.code).toBe("VALIDATION_ERROR");
            expect(body.error.details).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ path: "password" }),
                ]),
            );
        });

        it("rejects password with exactly 8 characters that is too weak", async () => {
            const response = await registerUser(app, {
                username: uniqueUsername(),
                email: uniqueEmail(),
                password: "Abcd1234!",
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error).toMatchObject({
                code: "PASSWORD_TOO_WEAK",
            });
        });

        it("rejects password longer than 128 characters", async () => {
            const response = await registerUser(app, {
                username: uniqueUsername(),
                email: uniqueEmail(),
                password: "A".repeat(127) + "1!",
            });

            expect(response.statusCode).toBe(400);
            const body = response.json();
            expect(body.error.code).toBe("VALIDATION_ERROR");
        });

        it("accepts password with exactly 128 characters", async () => {
            const response = await registerUser(app, {
                username: uniqueUsername(),
                email: uniqueEmail(),
                password: "Abcdef1!" + "A".repeat(119) + "2",
            });

            expect(response.statusCode).toBe(204);
        });

        it("rejects weak password", async () => {
            const weakPasswords = [
                "password",
                "12345678",
                "abcdefgh",
                "aaaaaaaa",
                "qwerty123",
            ];

            for (const password of weakPasswords) {
                const response = await registerUser(app, {
                    username: uniqueUsername(),
                    email: uniqueEmail(),
                    password,
                });

                expect(response.statusCode).toBe(400);
                expect(response.json().error).toMatchObject({
                    code: "PASSWORD_TOO_WEAK",
                    message: "This password is too weak",
                });
            }
        });

        it("rejects missing username", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                payload: {
                    email: uniqueEmail(),
                    password: validPassword,
                },
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects missing email", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                payload: {
                    username: uniqueUsername(),
                    password: validPassword,
                },
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects missing password", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                payload: {
                    username: uniqueUsername(),
                    email: uniqueEmail(),
                },
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects empty body", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                payload: {},
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects wrong types", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                payload: {
                    username: 123,
                    email: true,
                    password: [],
                },
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects null values", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                payload: {
                    username: null,
                    email: null,
                    password: null,
                },
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("ignores extra fields", async () => {
            const response = await registerUser(app, {
                username: uniqueUsername(),
                email: uniqueEmail(),
                password: validPassword,
            });

            const responseWithExtra = await app.inject({
                method: "POST",
                url: "/api/v1/auth/register",
                payload: {
                    username: uniqueUsername(),
                    email: uniqueEmail(),
                    password: validPassword,
                    role: "ADMIN",
                    extraField: "value",
                },
            });

            expect(responseWithExtra.statusCode).toBe(204);
        });

        it("creates user in database", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password: validPassword });

            const user = await app.prisma.user.findUnique({ where: { email } });

            expect(user).not.toBeNull();
            expect(user!.username).toBe(username);
            expect(user!.email).toBe(email);
            expect(user!.role).toBe("USER");
            expect(user!.deletedAt).toBeNull();
        });

        it("creates session in database", async () => {
            const response = await registerUser(app, {
                username: uniqueUsername(),
                email: uniqueEmail(),
                password: validPassword,
            });

            const cookie = extractSessionCookie(response)!;
            const sessionCount = await app.prisma.session.count();

            expect(sessionCount).toBe(1);
        });

        it("returns 404 for unknown register route", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/registration",
                payload: {
                    username: uniqueUsername(),
                    email: uniqueEmail(),
                    password: validPassword,
                },
            });

            expect(response.statusCode).toBe(404);
        });
    });

    // ================================================================
    // POST /api/v1/auth/login
    // ================================================================

    describe("POST /api/v1/auth/login", () => {
        const password = "Str0ng!Pass#2024";

        it("logs in with correct credentials", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const response = await loginUser(app, { email, password });

            expect(response.statusCode).toBe(204);

            const sessionCookie = response.cookies.find(
                (c) => c.name === "session",
            );

            expect(sessionCookie).toBeDefined();
            expect(sessionCookie!.httpOnly).toBe(true);
            expect(sessionCookie!.sameSite).toBe("Lax");
            expect(sessionCookie!.path).toBe("/");

            const me = await getMe(app, sessionCookie!.value);

            expect(me.statusCode).toBe(200);
            expect(me.json()).toMatchObject({
                username,
                email,
                role: "USER",
            });
        });

        it("rejects unknown email", async () => {
            const response = await loginUser(app, {
                email: "nonexistent@test.com",
                password,
            });

            expect(response.statusCode).toBe(401);
            expect(response.json()).toEqual({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                },
            });
        });

        it("rejects wrong password", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const response = await loginUser(app, {
                email,
                password: "WrongPassword1!",
            });

            expect(response.statusCode).toBe(401);
            expect(response.json()).toEqual({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                },
            });
        });

        it("does not reveal whether email exists", async () => {
            const response1 = await loginUser(app, {
                email: "nonexistent@test.com",
                password,
            });

            const email = uniqueEmail();
            await registerUser(app, {
                username: uniqueUsername(),
                email,
                password,
            });

            const response2 = await loginUser(app, {
                email,
                password: "WrongPassword1!",
            });

            expect(response1.json().error.code).toBe("INVALID_CREDENTIALS");
            expect(response2.json().error.code).toBe("INVALID_CREDENTIALS");
        });

        it("rejects invalid email format", async () => {
            const response = await loginUser(app, {
                email: "not-an-email",
                password,
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects missing email", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/login",
                payload: {
                    password,
                },
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects missing password", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/login",
                payload: {
                    email: uniqueEmail(),
                },
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects empty body", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/login",
                payload: {},
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects wrong types", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/login",
                payload: {
                    email: 123,
                    password: true,
                },
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("rejects password shorter than 8 characters", async () => {
            const response = await loginUser(app, {
                email: uniqueEmail(),
                password: "short",
            });

            expect(response.statusCode).toBe(400);
            expect(response.json().error.code).toBe("VALIDATION_ERROR");
        });

        it("creates new session on login", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const sessionCountBefore = await app.prisma.session.count();

            await loginUser(app, { email, password });

            const sessionCountAfter = await app.prisma.session.count();

            expect(sessionCountAfter).toBe(sessionCountBefore + 1);
        });

        it("login response has no body", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const response = await loginUser(app, { email, password });

            expect(response.statusCode).toBe(204);
            expect(response.body).toBe("");
        });
    });

    // ================================================================
    // POST /api/v1/auth/logout
    // ================================================================

    describe("POST /api/v1/auth/logout", () => {
        const password = "Str0ng!Pass#2024";

        it("logs out with valid session", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;

            const sessionCountBefore = await app.prisma.session.count();

            const response = await logoutUser(app, cookie);

            expect(response.statusCode).toBe(204);

            const sessionCountAfter = await app.prisma.session.count();
            expect(sessionCountAfter).toBe(sessionCountBefore - 1);
        });

        it("invalidates session - /me returns 401 after logout", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;

            await logoutUser(app, cookie);

            const me = await getMe(app, cookie);

            expect(me.statusCode).toBe(401);
            expect(me.json()).toEqual({
                error: {
                    code: "SESSION_NOT_FOUND",
                    message: "Session not found",
                },
            });
        });

        it("clears session cookie", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;

            const response = await logoutUser(app, cookie);

            expect(response.statusCode).toBe(204);

            const clearedCookie = response.cookies.find(
                (c) => c.name === "session",
            );

            expect(clearedCookie).toBeDefined();
            expect(clearedCookie!.value).toBe("");
        });

        it("returns 204 even without session cookie", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/logout",
            });

            expect(response.statusCode).toBe(204);
        });

        it("returns 204 with invalid session cookie", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/v1/auth/logout",
                cookies: { session: "invalid-token-value" },
            });

            expect(response.statusCode).toBe(204);
        });

        it("multiple logouts with same cookie are idempotent", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;

            const response1 = await logoutUser(app, cookie);
            expect(response1.statusCode).toBe(204);

            const response2 = await logoutUser(app, cookie);
            expect(response2.statusCode).toBe(204);
        });

        it("new login after logout works correctly", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse1 = await loginUser(app, { email, password });
            const cookie1 = extractSessionCookie(loginResponse1)!;

            await logoutUser(app, cookie1);

            const loginResponse2 = await loginUser(app, { email, password });
            const cookie2 = extractSessionCookie(loginResponse2)!;

            expect(cookie2).toBeDefined();

            const me = await getMe(app, cookie2!);
            expect(me.statusCode).toBe(200);
            expect(me.json()).toMatchObject({ email, username });
        });
    });

    // ================================================================
    // GET /api/v1/auth/me
    // ================================================================

    describe("GET /api/v1/auth/me", () => {
        const password = "Str0ng!Pass#2024";

        it("returns current user with valid session", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;

            const response = await getMe(app, cookie);

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual({
                id: expect.any(String),
                username,
                email,
                role: "USER",
                createdAt: expect.any(String),
                currentBan: null,
                uploadBan: null,
            });
        });

        it("returns active user restrictions", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;
            const user = await app.prisma.user.findUniqueOrThrow({
                where: { email },
            });

            await app.prisma.userRestriction.createMany({
                data: [
                    {
                        userId: user.id,
                        type: "BAN",
                        reason: "Test ban",
                        expiresAt,
                    },
                    {
                        userId: user.id,
                        type: "UPLOAD_BAN",
                        reason: "Test upload ban",
                        expiresAt: null,
                    },
                ],
            });

            const response = await getMe(app, cookie);

            expect(response.statusCode).toBe(200);
            expect(response.json()).toMatchObject({
                currentBan: {
                    reason: "Test ban",
                    expiresAt: expiresAt.toISOString(),
                },
                uploadBan: {
                    reason: "Test upload ban",
                    expiresAt: null,
                },
            });
        });

        it("ignores expired user restrictions", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;
            const user = await app.prisma.user.findUniqueOrThrow({
                where: { email },
            });

            await app.prisma.userRestriction.create({
                data: {
                    userId: user.id,
                    type: "BAN",
                    reason: "Expired ban",
                    expiresAt: new Date(Date.now() - 1000),
                },
            });

            const response = await getMe(app, cookie);

            expect(response.statusCode).toBe(200);
            expect(response.json()).toMatchObject({
                currentBan: null,
                uploadBan: null,
            });
        });

        it("returns 401 without session cookie", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/auth/me",
            });

            expect(response.statusCode).toBe(401);
            expect(response.json()).toEqual({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Unauthorized",
                },
            });
        });

        it("returns 401 with invalid session token", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/auth/me",
                cookies: { session: "invalid-token-value" },
            });

            expect(response.statusCode).toBe(401);
            expect(response.json()).toEqual({
                error: {
                    code: "SESSION_NOT_FOUND",
                    message: "Session not found",
                },
            });
        });

        it("returns 401 with empty session token", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/auth/me",
                cookies: { session: "" },
            });

            expect(response.statusCode).toBe(401);
        });

        it("returns 401 after session is deleted via logout", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;

            await logoutUser(app, cookie);

            const response = await getMe(app, cookie);

            expect(response.statusCode).toBe(401);
            expect(response.json()).toEqual({
                error: {
                    code: "SESSION_NOT_FOUND",
                    message: "Session not found",
                },
            });
        });

        it("returns 401 for deleted user", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;

            const user = await app.prisma.user.findUnique({ where: { email } });
            await app.prisma.user.update({
                where: { id: user!.id },
                data: { deletedAt: new Date() },
            });

            const response = await getMe(app, cookie);

            expect(response.statusCode).toBe(401);
            expect(response.json()).toEqual({
                error: {
                    code: "UNAUTHORIZED",
                    message: "Unauthorized",
                },
            });
        });

        it("does not expose sensitive fields", async () => {
            const email = uniqueEmail();
            const username = uniqueUsername();

            await registerUser(app, { username, email, password });

            const loginResponse = await loginUser(app, { email, password });
            const cookie = extractSessionCookie(loginResponse)!;

            const response = await getMe(app, cookie);
            const body = response.json();

            expect(body).not.toHaveProperty("passwordHash");
            expect(body).not.toHaveProperty("deletedAt");
            expect(body).not.toHaveProperty("updatedAt");
        });

        it("returns correct user when multiple users exist", async () => {
            const user1 = {
                username: uniqueUsername(),
                email: uniqueEmail(),
                password,
            };
            const user2 = {
                username: uniqueUsername(),
                email: uniqueEmail(),
                password,
            };

            await registerUser(app, user1);
            await registerUser(app, user2);

            const loginResponse1 = await loginUser(app, {
                email: user1.email,
                password,
            });
            const cookie1 = extractSessionCookie(loginResponse1)!;

            const loginResponse2 = await loginUser(app, {
                email: user2.email,
                password,
            });
            const cookie2 = extractSessionCookie(loginResponse2)!;

            const me1 = await getMe(app, cookie1);
            const me2 = await getMe(app, cookie2);

            expect(me1.json()).toMatchObject({
                username: user1.username,
                email: user1.email,
            });
            expect(me2.json()).toMatchObject({
                username: user2.username,
                email: user2.email,
            });
            expect(me1.json().id).not.toBe(me2.json().id);
        });
    });
});
