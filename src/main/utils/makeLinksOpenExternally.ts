/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BrowserWindow, shell } from "electron";
import { downloadWithAria2, isAria2Available, isAria2Enabled } from "main/aria2";
import { DISCORD_HOSTNAMES } from "main/constants";

import { Settings } from "../settings";
import { createOrFocusPopup, setupPopout } from "./popout";
import { execSteamURL, isDeckGameMode, steamOpenURL } from "./steamOS";

const DOWNLOAD_HOSTNAMES = ["cdn.discordapp.com", "media.discordapp.net", "cdn.discord.com"];

function isDownloadUrl(url: string): boolean {
    try {
        const { hostname, pathname } = new URL(url);
        if (!DOWNLOAD_HOSTNAMES.includes(hostname)) return false;

        const ext = pathname.split(".").pop()?.toLowerCase();
        const downloadableExtensions = [
            "zip",
            "rar",
            "7z",
            "tar",
            "gz",
            "exe",
            "msi",
            "dmg",
            "pkg",
            "deb",
            "rpm",
            "appimage",
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "mp3",
            "mp4",
            "mkv",
            "avi",
            "mov",
            "wav",
            "flac",
            "png",
            "jpg",
            "jpeg",
            "gif",
            "webp",
            "webm",
            "svg",
            "ico",
            "apk",
            "iso",
            "txt",
            "json",
            "xml",
            "csv"
        ];
        return ext ? downloadableExtensions.includes(ext) : false;
    } catch {
        return false;
    }
}

async function handleDownloadWithAria2(url: string): Promise<boolean> {
    if (!isAria2Available() || !isAria2Enabled()) return false;

    try {
        const filename = url.split("/").pop()?.split("?")[0] || "download";
        await downloadWithAria2({ url, filename });
        return true;
    } catch (err) {
        console.error("aria2 download failed:", err);
        return false;
    }
}

export function handleExternalUrl(url: string, protocol?: string): { action: "deny" | "allow" } {
    if (protocol == null) {
        try {
            protocol = new URL(url).protocol;
        } catch {
            return { action: "deny" };
        }
    }

    switch (protocol) {
        case "http:":
        case "https:":
            if (isDownloadUrl(url)) {
                handleDownloadWithAria2(url).then(success => {
                    if (!success) {
                        if (isDeckGameMode) {
                            steamOpenURL(url);
                        } else {
                            shell.openExternal(url);
                        }
                    }
                });
                return { action: "deny" };
            }
            if (Settings.store.openLinksWithElectron) {
                return { action: "allow" };
            }
        // eslint-disable-next-line no-fallthrough
        case "mailto:":
        case "spotify:":
            if (isDeckGameMode) {
                steamOpenURL(url);
            } else {
                shell.openExternal(url);
            }
            break;
        case "steam:":
            if (isDeckGameMode) {
                execSteamURL(url);
            } else {
                shell.openExternal(url);
            }
            break;
    }

    return { action: "deny" };
}

export function makeLinksOpenExternally(win: BrowserWindow) {
    win.webContents.setWindowOpenHandler(({ url, frameName, features }) => {
        try {
            var { protocol, hostname, pathname, searchParams } = new URL(url);
        } catch {
            return { action: "deny" };
        }

        if (frameName.startsWith("DISCORD_") && pathname === "/popout" && DISCORD_HOSTNAMES.includes(hostname)) {
            return createOrFocusPopup(frameName, features);
        }

        if (url === "about:blank") return { action: "allow" };

        // Drop the static temp page Discord web loads for the connections popout
        if (frameName === "authorize" && searchParams.get("loading") === "true") return { action: "deny" };

        return handleExternalUrl(url, protocol);
    });

    win.webContents.on("did-create-window", (win, { frameName }) => {
        if (frameName.startsWith("DISCORD_")) setupPopout(win, frameName);
    });
}
