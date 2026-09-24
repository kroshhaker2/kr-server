import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/db.js";
import {
    registerUser,
    loginUser,
    extractSessionCookie,
    uniqueEmail,
    uniqueUsername,
} from "../../helpers/auth.js";

describe("GET /api/v1/posts", () => {
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

    it("returns response with default query params", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts",
        });

        expect(response.statusCode).toBe(200);
    });

    it("accepts limit parameter", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?limit=5",
        });

        expect(response.statusCode).toBe(200);
    });

    it("accepts page parameter", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?page=2",
        });

        expect(response.statusCode).toBe(200);
    });

    it("accepts tags parameter", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?tags=cat+dog",
        });

        expect(response.statusCode).toBe(200);
    });

    it("accepts combined query parameters", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?tags=cat&limit=5&page=2",
        });

        expect(response.statusCode).toBe(200);
    });

    it("rejects limit below minimum", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?limit=0",
        });

        expect(response.statusCode).toBe(400);
        expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects page below minimum", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?page=0",
        });

        expect(response.statusCode).toBe(400);
        expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects negative limit", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?limit=-1",
        });

        expect(response.statusCode).toBe(400);
        expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects negative page", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?page=-5",
        });

        expect(response.statusCode).toBe(400);
        expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("accepts large limit values", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?limit=100",
        });

        expect(response.statusCode).toBe(200);
    });

    it("accepts large page values", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?page=1000",
        });

        expect(response.statusCode).toBe(200);
    });

    it("handles single tag", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?tags=nature",
        });

        expect(response.statusCode).toBe(200);
    });

    it("handles multiple tags with + separator", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/posts?tags=nature+animals+landscape",
        });

        expect(response.statusCode).toBe(200);
    });
});
