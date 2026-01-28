import { describe, it, expect, beforeEach } from "vitest";

interface ProfileEntry {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
}

class TestProfiler {
    private entries: Map<string, ProfileEntry> = new Map();
    private bootStart: number = Date.now();
    private bootEnd: number = 0;

    start(name: string): void {
        this.entries.set(name, {
            name,
            startTime: Date.now()
        });
    }

    end(name: string): number {
        const entry = this.entries.get(name);
        if (entry) {
            entry.endTime = Date.now();
            entry.duration = entry.endTime - entry.startTime;
            return entry.duration;
        }
        return 0;
    }

    markBootComplete(): void {
        this.bootEnd = Date.now();
    }

    getBootTime(): number {
        return this.bootEnd - this.bootStart;
    }

    getEntries(): ProfileEntry[] {
        return Array.from(this.entries.values());
    }

    clear(): void {
        this.entries.clear();
    }

    getSlowComponents(thresholdMs: number = 100): ProfileEntry[] {
        return Array.from(this.entries.values())
            .filter(e => e.duration !== undefined && e.duration > thresholdMs)
            .sort((a, b) => (b.duration || 0) - (a.duration || 0));
    }
}

describe("PerformanceProfiler", () => {
    let profiler: TestProfiler;

    beforeEach(() => {
        profiler = new TestProfiler();
    });

    it("should track component start and end times", () => {
        profiler.start("test-component");
        profiler.end("test-component");

        const entries = profiler.getEntries();
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("test-component");
        expect(entries[0].duration).toBeDefined();
        expect(entries[0].duration).toBeGreaterThanOrEqual(0);
    });

    it("should track multiple components", () => {
        profiler.start("component-1");
        profiler.end("component-1");
        profiler.start("component-2");
        profiler.end("component-2");

        const entries = profiler.getEntries();
        expect(entries).toHaveLength(2);
    });

    it("should return 0 for non-existent component", () => {
        const duration = profiler.end("non-existent");
        expect(duration).toBe(0);
    });

    it("should calculate boot time", async () => {
        await new Promise(r => setTimeout(r, 10));
        profiler.markBootComplete();

        const bootTime = profiler.getBootTime();
        expect(bootTime).toBeGreaterThanOrEqual(10);
    });

    it("should identify slow components", async () => {
        profiler.start("slow-component");
        await new Promise(r => setTimeout(r, 150));
        profiler.end("slow-component");

        profiler.start("fast-component");
        profiler.end("fast-component");

        const slowComponents = profiler.getSlowComponents(100);
        expect(slowComponents).toHaveLength(1);
        expect(slowComponents[0].name).toBe("slow-component");
    });

    it("should clear entries", () => {
        profiler.start("test");
        profiler.end("test");
        expect(profiler.getEntries()).toHaveLength(1);

        profiler.clear();
        expect(profiler.getEntries()).toHaveLength(0);
    });
});
