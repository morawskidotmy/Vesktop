import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["tests/**/*.test.ts"],
        coverage: {
            reporter: ["text", "json", "html"]
        }
    },
    resolve: {
        alias: {
            shared: "/src/shared",
            main: "/src/main",
            renderer: "/src/renderer"
        }
    }
});
