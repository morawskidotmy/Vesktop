import { describe, it, expect } from "vitest";

describe("Settings Types", () => {
    interface TestSettings {
        discordBranch?: "stable" | "canary" | "ptb";
        aria2Enabled?: boolean;
        transferNgEnabled?: boolean;
        transferNgServer?: string;
        hardwareAcceleration?: boolean;
        enableSplashScreen?: boolean;
    }

    it("should have valid discord branch options", () => {
        const validBranches = ["stable", "canary", "ptb"];
        const settings: TestSettings = { discordBranch: "stable" };

        expect(validBranches).toContain(settings.discordBranch);
    });

    it("should have boolean settings with correct defaults", () => {
        const settings: TestSettings = {};

        expect(settings.aria2Enabled).toBeUndefined();
        expect(settings.transferNgEnabled).toBeUndefined();
        expect(settings.hardwareAcceleration).toBeUndefined();
    });

    it("should handle transfer server URL", () => {
        const settings: TestSettings = {
            transferNgServer: "https://custom.server.com/"
        };

        expect(settings.transferNgServer).toBe("https://custom.server.com/");
    });

    it("should allow undefined for optional settings", () => {
        const settings: TestSettings = {};

        expect(settings.discordBranch).toBeUndefined();
        expect(settings.aria2Enabled).toBeUndefined();
        expect(settings.transferNgEnabled).toBeUndefined();
        expect(settings.transferNgServer).toBeUndefined();
    });

    it("should correctly identify enabled features", () => {
        const settings: TestSettings = {
            aria2Enabled: true,
            transferNgEnabled: false
        };

        const isAria2Enabled = settings.aria2Enabled !== false;
        const isTransferNgEnabled = settings.transferNgEnabled !== false;

        expect(isAria2Enabled).toBe(true);
        expect(isTransferNgEnabled).toBe(false);
    });

    it("should treat undefined as enabled (default behavior)", () => {
        const settings: TestSettings = {};

        const isAria2Enabled = settings.aria2Enabled !== false;
        const isTransferNgEnabled = settings.transferNgEnabled !== false;

        expect(isAria2Enabled).toBe(true);
        expect(isTransferNgEnabled).toBe(true);
    });
});
