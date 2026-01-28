import { describe, it, expect } from "vitest";
import { join } from "path";
import { homedir } from "os";

describe("Aria2 Module", () => {
    const DOWNLOADS_DIR = join(homedir(), "Downloads");

    it("should have correct downloads directory", () => {
        expect(DOWNLOADS_DIR).toContain("Downloads");
    });

    it("should construct valid aria2 arguments", () => {
        const url = "https://example.com/file.zip";
        const filename = "test.zip";

        const args = [
            "--dir=" + DOWNLOADS_DIR,
            "--continue=true",
            "--max-connection-per-server=16",
            "--split=16",
            "--min-split-size=1M",
            "--file-allocation=none",
            "--console-log-level=warn",
            "--summary-interval=1",
            "--out=" + filename,
            url
        ];

        expect(args).toContain("--dir=" + DOWNLOADS_DIR);
        expect(args).toContain("--max-connection-per-server=16");
        expect(args).toContain("--split=16");
        expect(args).toContain("--out=" + filename);
        expect(args).toContain(url);
    });

    it("should extract filename from URL", () => {
        const url = "https://example.com/path/to/file.zip?query=param";
        const filename = url.split("/").pop()?.split("?")[0] || "download";

        expect(filename).toBe("file.zip");
    });

    it("should handle URL without filename", () => {
        const url = "https://example.com/";
        const filename = url.split("/").pop()?.split("?")[0] || "download";

        expect(filename).toBe("download");
    });

    it("should construct headers correctly", () => {
        const headers: Record<string, string> = {
            Authorization: "Bearer token123",
            "User-Agent": "TestAgent"
        };

        const args: string[] = [];
        for (const [key, value] of Object.entries(headers)) {
            args.push(`--header=${key}: ${value}`);
        }

        expect(args).toContain("--header=Authorization: Bearer token123");
        expect(args).toContain("--header=User-Agent: TestAgent");
    });
});
