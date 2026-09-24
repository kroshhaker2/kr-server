import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["tests/**/*.test.ts"],
        env: {
            NODE_ENV: "test",
        },
        globals: false,
        testTimeout: 15000,
        hookTimeout: 15000,
        pool: "forks",
        fileParallelism: false,
    },
});
