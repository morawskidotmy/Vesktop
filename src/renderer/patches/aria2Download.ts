/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "renderer/settings";

import { addPatch } from "./shared";

const isAria2Available = VesktopNative.aria2?.isAvailable?.() ?? false;

if (isAria2Available) {
    addPatch({
        patches: [
            {
                find: "downloadURL:",
                replacement: {
                    match: /downloadURL:function\((\i)\)/,
                    replace: "downloadURL:function($1){return $self.downloadWithAria2($1)}"
                }
            }
        ],
        async downloadWithAria2(url: string) {
            if (Settings.store.aria2Enabled === false) {
                window.open(url);
                return;
            }
            try {
                const filename = url.split("/").pop()?.split("?")[0] || "download";
                await VesktopNative.aria2.download(url, filename);
            } catch {
                window.open(url);
            }
        }
    });
}
