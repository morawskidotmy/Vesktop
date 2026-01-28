/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { basename } from "path";

import { Settings } from "./settings";

const DEFAULT_TRANSFER_NG_SERVER = "https://transfer.morawski.my/";
const DISCORD_FILE_LIMIT = 25 * 1024 * 1024;

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

export async function getFileSize(filePath: string): Promise<number> {
    const stats = await stat(filePath);
    return stats.size;
}

export function isFileTooLargeForDiscord(fileSize: number): boolean {
    return fileSize > DISCORD_FILE_LIMIT;
}

export async function uploadToTransferNg(filePath: string): Promise<UploadResult> {
    try {
        const fileSize = await getFileSize(filePath);
        const fileName = basename(filePath);
        const fileStream = createReadStream(filePath);
        const server = getTransferServer();

        const chunks: Buffer[] = [];
        for await (const chunk of fileStream) {
            chunks.push(chunk as Buffer);
        }
        const fileBuffer = Buffer.concat(chunks);

        const serverUrl = server.endsWith("/") ? server : server + "/";
        const response = await fetch(serverUrl + fileName, {
            method: "PUT",
            body: fileBuffer,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Length": fileSize.toString()
            }
        });

        if (!response.ok) {
            return {
                success: false,
                error: `Upload failed: ${response.status} ${response.statusText}`
            };
        }

        const url = await response.text();
        return {
            success: true,
            url: url.trim()
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function shouldUploadToTransferNg(filePath: string): Promise<boolean> {
    try {
        const fileSize = await getFileSize(filePath);
        return isFileTooLargeForDiscord(fileSize);
    } catch {
        return false;
    }
}

export function getTransferNgServer(): string {
    return getTransferServer();
}

export function getDiscordFileLimit(): number {
    return DISCORD_FILE_LIMIT;
}
