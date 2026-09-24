import { beforeAll, afterAll, describe, expect, it } from "vitest";

import { buildApp } from "../../../src/app.js";

describe("GET /api/v1/health", () => {
    let app: Awaited<ReturnType<typeof buildApp>>;

    beforeAll(async () => {
        app = await buildApp();
    });

    afterAll(async () => {
        await app?.close();
    });

    it("returns 200 with status ok", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/health",
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: "ok" });
    });

    it("returns JSON content type", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/health",
        });

        expect(response.headers["content-type"]).toContain("application/json");
    });

    it("returns 404 for unknown route", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/unknown",
        });

        expect(response.statusCode).toBe(404);
    });

    it("POST to health returns 404 (method not allowed)", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/health",
        });

        expect(response.statusCode).toBe(404);
    });
});
