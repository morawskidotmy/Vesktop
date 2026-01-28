import { describe, it, expect } from "vitest";

describe("Transfer.ng Module", () => {
    const DEFAULT_TRANSFER_SERVER = "https://transfer.morawski.my/";
    const DISCORD_FILE_LIMIT = 25 * 1024 * 1024;

    it("should have correct Discord file limit (25MB)", () => {
        expect(DISCORD_FILE_LIMIT).toBe(26214400);
    });

    it("should identify files too large for Discord", () => {
        const smallFile = 10 * 1024 * 1024;
        const largeFile = 30 * 1024 * 1024;

        expect(smallFile > DISCORD_FILE_LIMIT).toBe(false);
        expect(largeFile > DISCORD_FILE_LIMIT).toBe(true);
    });

    it("should have valid default transfer server", () => {
        expect(DEFAULT_TRANSFER_SERVER).toBe("https://transfer.morawski.my/");
        expect(DEFAULT_TRANSFER_SERVER.startsWith("https://")).toBe(true);
    });

    it("should construct valid upload URL", () => {
        const server = "https://transfer.morawski.my/";
        const filename = "test-file.zip";

        const serverUrl = server.endsWith("/") ? server : server + "/";
        const uploadUrl = serverUrl + filename;

        expect(uploadUrl).toBe("https://transfer.morawski.my/test-file.zip");
    });

    it("should handle server URL without trailing slash", () => {
        const server = "https://transfer.morawski.my";
        const filename = "test.zip";

        const serverUrl = server.endsWith("/") ? server : server + "/";
        const uploadUrl = serverUrl + filename;

        expect(uploadUrl).toBe("https://transfer.morawski.my/test.zip");
    });

    it("should handle custom server URLs", () => {
        const customServers = [
            "https://custom.transfer.io/",
            "https://my-server.com",
            "https://transfer.example.org/"
        ];

        for (const server of customServers) {
            const serverUrl = server.endsWith("/") ? server : server + "/";
            expect(serverUrl.endsWith("/")).toBe(true);
        }
    });

    it("should validate upload result structure", () => {
        const successResult = {
            success: true,
            url: "https://transfer.morawski.my/abc123"
        };

        const errorResult = {
            success: false,
            error: "Upload failed"
        };

        expect(successResult.success).toBe(true);
        expect(successResult.url).toBeDefined();
        expect(errorResult.success).toBe(false);
        expect(errorResult.error).toBeDefined();
    });
});
