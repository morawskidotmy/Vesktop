/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "renderer/settings";

import { addPatch } from "./shared";

const DISCORD_FILE_LIMIT = 25 * 1024 * 1024;

addPatch({
    patches: [
        {
            find: "instantBatchUpload",
            replacement: {
                match: /(\i)\.instantBatchUpload=function\((\i)\)/,
                replace: "$1.instantBatchUpload=function($2){return $self.handleUpload($2,arguments)}"
            }
        }
    ],
    async handleUpload(files: any[], args: any[]) {
        if (!files || !Array.isArray(files)) return;
        if (Settings.store.transferNgEnabled === false) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file && file.size && file.size > DISCORD_FILE_LIMIT && file.path) {
                try {
                    const result = await VesktopNative.transferng.upload(file.path);
                    if (result.success && result.url) {
                        files.splice(i, 1);
                        i--;
                        const textArea = document.querySelector('[class*="textArea"]');
                        if (textArea) {
                            const input = textArea.querySelector('[class*="slateTextArea"]');
                            if (input) {
                                const event = new Event("input", { bubbles: true });
                                (input as any).textContent = ((input as any).textContent || "") + result.url + " ";
                                input.dispatchEvent(event);
                            }
                        }
                    }
                } catch {}
            }
        }
    }
});
