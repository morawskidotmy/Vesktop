/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

import { Settings } from "./settings";

const DOWNLOADS_DIR = join(homedir(), "Downloads");

if (!existsSync(DOWNLOADS_DIR)) {
    mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

export function isAria2Enabled(): boolean {
    return Settings.store.aria2Enabled !== false;
}

export interface Aria2DownloadOptions {
    url: string;
    filename?: string;
    headers?: Record<string, string>;
    onProgress?: (percent: number) => void;
    onComplete?: (filePath: string) => void;
    onError?: (error: string) => void;
}

export function downloadWithAria2(options: Aria2DownloadOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        const { url, filename, headers, onProgress, onComplete, onError } = options;

        const args = [
            "--dir=" + DOWNLOADS_DIR,
            "--continue=true",
            "--max-connection-per-server=16",
            "--split=16",
            "--min-split-size=1M",
            "--file-allocation=none",
            "--console-log-level=warn",
            "--summary-interval=1"
        ];

        if (filename) {
            args.push("--out=" + filename);
        }

        if (headers) {
            for (const [key, value] of Object.entries(headers)) {
                args.push(`--header=${key}: ${value}`);
            }
        }

        args.push(url);

        const aria2 = spawn("aria2c", args);
        let outputPath = "";

        aria2.stdout.on("data", (data: Buffer) => {
            const output = data.toString();
            const progressMatch = output.match(/\((\d+)%\)/);
            if (progressMatch && onProgress) {
                onProgress(parseInt(progressMatch[1], 10));
            }
            const pathMatch = output.match(/\|(.+)\|/);
            if (pathMatch) {
                outputPath = pathMatch[1].trim();
            }
        });

        aria2.stderr.on("data", (data: Buffer) => {
            console.error("aria2 stderr:", data.toString());
        });

        aria2.on("close", (code: number) => {
            if (code === 0) {
                const finalPath = outputPath || join(DOWNLOADS_DIR, filename || url.split("/").pop() || "download");
                if (onComplete) onComplete(finalPath);
                resolve(finalPath);
            } else {
                const error = `aria2c exited with code ${code}`;
                if (onError) onError(error);
                reject(new Error(error));
            }
        });

        aria2.on("error", (err: Error) => {
            const error = `Failed to start aria2c: ${err.message}`;
            if (onError) onError(error);
            reject(new Error(error));
        });
    });
}

export function isAria2Available(): boolean {
    try {
        const result = spawn("aria2c", ["--version"], { stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
}

export function getDownloadsDir(): string {
    return DOWNLOADS_DIR;
}
