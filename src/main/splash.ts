/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BrowserWindow } from "electron";
import { join } from "path";
import { SplashProps } from "shared/browserWinProperties";

import { Settings } from "./settings";
import { loadView } from "./vesktopStatic";

let splash: BrowserWindow | undefined;

export function createSplashWindow(startMinimized = false) {
    splash = new BrowserWindow({
        ...SplashProps,
        show: !startMinimized,
        webPreferences: {
            preload: join(__dirname, "splashPreload.js")
        }
    });

    loadView(splash, "splash.html");

    const { splashBackground, splashColor, splashTheming, splashPixelated } = Settings.store;

    const cssRules: string[] = [];

    if (splashTheming !== false) {
        if (splashColor) {
            const semiTransparentSplashColor = splashColor.replace("rgb(", "rgba(").replace(")", ", 0.2)");
            cssRules.push(
                `body { --fg: ${splashColor} !important; --fg-semi-trans: ${semiTransparentSplashColor} !important }`
            );
        }
        if (splashBackground) {
            cssRules.push(`body { --bg: ${splashBackground} !important }`);
        }
    }

    if (splashPixelated) {
        cssRules.push(`img { image-rendering: pixelated }`);
    }

    if (cssRules.length > 0) {
        splash.webContents.insertCSS(cssRules.join("\n"));
    }

    return splash;
}

export function updateSplashMessage(message: string) {
    if (splash && !splash.isDestroyed()) splash.webContents.send("update-splash-message", message);
}
