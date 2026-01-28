/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createReadStream, stat as fsStat } from "fs";
import { stat } from "fs/promises";
import http from "http";
import https from "https";
import { basename } from "path";

import { Settings } from "./settings";

const DEFAULT_TRANSFER_NG_SERVER = "https://transfer.morawski.my/";
const TRANSFER_NG_THRESHOLD = 10 * 1024 * 1024;

function getTransferServer(): string {
    return Settings.store.transferNgServer || DEFAULT_TRANSFER_NG_SERVER;
}

export function isTransferNgEnabled(): boolean {
    return Settings.store.transferNgEnabled !== false;
}

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export type ProgressCallback = (progress: number) => void;

export async function getFileSize(filePath: string): Promise<number> {
    const stats = await stat(filePath);
    return stats.size;
}

export function shouldUseTransferNg(fileSize: number): boolean {
    return fileSize > TRANSFER_NG_THRESHOLD;
}

export async function uploadToTransferNg(filePath: string, onProgress?: ProgressCallback): Promise<UploadResult> {
    return new Promise(resolve => {
        fsStat(filePath, (err, stats) => {
            if (err) {
                resolve({ success: false, error: err.message });
                return;
            }

            const fileSize = stats.size;
            const fileName = basename(filePath);
            const server = getTransferServer();
            const serverUrl = server.endsWith("/") ? server : server + "/";
            const url = new URL(serverUrl + encodeURIComponent(fileName));

            const isHttps = url.protocol === "https:";
            const lib = isHttps ? https : http;

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname,
                method: "PUT",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Length": fileSize
                }
            };

            const req = lib.request(options, res => {
                let data = "";
                res.on("data", chunk => (data += chunk));
                res.on("end", () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ success: true, url: data.trim() });
                    } else {
                        resolve({
                            success: false,
                            error: `Upload failed: ${res.statusCode} ${res.statusMessage}`
                        });
                    }
                });
            });

            req.on("error", error => {
                resolve({ success: false, error: error.message });
            });

            const fileStream = createReadStream(filePath);
            let uploaded = 0;

            fileStream.on("data", chunk => {
                uploaded += chunk.length;
                const progress = Math.round((uploaded / fileSize) * 100);
                onProgress?.(progress);
            });

            fileStream.pipe(req);
        });
    });
}

export async function shouldUploadToTransferNg(filePath: string): Promise<boolean> {
    try {
        const fileSize = await getFileSize(filePath);
        return shouldUseTransferNg(fileSize);
    } catch {
        return false;
    }
}

export function getTransferNgServer(): string {
    return getTransferServer();
}

export function getTransferNgThreshold(): number {
    return TRANSFER_NG_THRESHOLD;
}
