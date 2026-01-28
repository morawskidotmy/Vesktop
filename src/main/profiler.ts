/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

interface ProfileEntry {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
}

interface ProfileReport {
    bootTime: number;
    entries: ProfileEntry[];
    memoryUsage: NodeJS.MemoryUsage;
    timestamp: string;
}

class PerformanceProfiler {
    private entries: Map<string, ProfileEntry> = new Map();
    private bootStart: number = Date.now();
    private bootEnd: number = 0;
    private enabled: boolean = true;

    start(name: string): void {
        if (!this.enabled) return;
        this.entries.set(name, {
            name,
            startTime: Date.now()
        });
    }

    end(name: string): number {
        if (!this.enabled) return 0;
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

    getReport(): ProfileReport {
        return {
            bootTime: this.getBootTime(),
            entries: Array.from(this.entries.values()),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    }

    printReport(): void {
        const report = this.getReport();
        console.log("\n=== PERFORMANCE REPORT ===");
        console.log(`Boot Time: ${report.bootTime}ms`);
        console.log("\nComponent Timings:");

        const sortedEntries = report.entries
            .filter(e => e.duration !== undefined)
            .sort((a, b) => (b.duration || 0) - (a.duration || 0));

        for (const entry of sortedEntries) {
            console.log(`  ${entry.name}: ${entry.duration}ms`);
        }

        console.log("\nMemory Usage:");
        console.log(`  Heap Used: ${Math.round(report.memoryUsage.heapUsed / 1024 / 1024)}MB`);
        console.log(`  Heap Total: ${Math.round(report.memoryUsage.heapTotal / 1024 / 1024)}MB`);
        console.log(`  RSS: ${Math.round(report.memoryUsage.rss / 1024 / 1024)}MB`);
        console.log("========================\n");
    }

    disable(): void {
        this.enabled = false;
    }

    enable(): void {
        this.enabled = true;
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

export const profiler = new PerformanceProfiler();
