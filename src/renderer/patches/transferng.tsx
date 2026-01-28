/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Settings } from "renderer/settings";

function createProgressBar(): HTMLElement {
    const container = document.querySelector('[class*="channelTextArea"]');
    if (!container) return document.createElement("div");

    const bar = document.createElement("div");
    bar.id = "vesktop-upload-progress";
    bar.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #5865f2 0%, #7289da 100%);
        width: 0%;
        transition: width 0.15s ease-out;
        pointer-events: none;
        border-radius: 3px 3px 0 0;
        z-index: 100;
    `;
    (container as HTMLElement).style.position = "relative";
    container.insertBefore(bar, container.firstChild);
    return bar;
}

function updateProgress(bar: HTMLElement, progress: number) {
    bar.style.width = `${progress}%`;
}

function removeProgressBar() {
    const bar = document.getElementById("vesktop-upload-progress");
    if (bar) bar.remove();
}

async function uploadFileToTransferNg(filePath: string): Promise<void> {
    let bar: HTMLElement | null = null;

    try {
        bar = createProgressBar();
        VesktopNative.transferng.onProgress(progress => {
            if (bar) updateProgress(bar, progress);
        });

        const result = await VesktopNative.transferng.upload(filePath);

        VesktopNative.transferng.offProgress();
        removeProgressBar();

        if (result.success && result.url) {
            const { ComponentDispatch } = Vencord.Webpack.Common;
            ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
                rawText: result.url + " ",
                plainText: result.url + " "
            });
        }
    } catch {
        VesktopNative.transferng.offProgress();
        removeProgressBar();
    }
}

async function openFilePicker(): Promise<void> {
    const result = await VesktopNative.fileManager.showOpenDialog({
        properties: ["openFile", "multiSelections"]
    });

    if (result.canceled || !result.filePaths?.length) return;

    for (const filePath of result.filePaths) {
        await uploadFileToTransferNg(filePath);
    }
}

function injectTransferNgButton(menu: Element) {
    if (menu.querySelector("#vesktop-transferng-btn")) return;

    const menuItems = menu.querySelectorAll('[role="menuitem"]');
    if (menuItems.length === 0) return;

    const firstItem = menuItems[0];
    const btn = firstItem.cloneNode(true) as HTMLElement;
    btn.id = "vesktop-transferng-btn";

    const label = btn.querySelector('[class*="label"]');
    if (label) label.textContent = "Upload to Transfer.ng";

    const icon = btn.querySelector("svg");
    if (icon) {
        icon.innerHTML = `<path fill="currentColor" d="M12 22a1 1 0 0 1-1-1v-8.586l-2.293 2.293a1 1 0 1 1-1.414-1.414l4-4a1 1 0 0 1 1.414 0l4 4a1 1 0 1 1-1.414 1.414L13 12.414V21a1 1 0 0 1-1 1zM5 4a1 1 0 1 0 0-2h14a1 1 0 1 0 0 2H5z"/>`;
    }

    btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        openFilePicker();
        const closeBtn = document.querySelector('[class*="layerContainer"]');
        if (closeBtn) (closeBtn as HTMLElement).click();
    });

    firstItem.parentElement?.insertBefore(btn, firstItem.nextSibling);
}

function tryInjectFromNode(node: HTMLElement) {
    const menu = node.querySelector('[class*="attachWrapper"], [class*="uploadModal"], [id*="channel-attach"]');
    if (menu) return injectTransferNgButton(menu);

    const popout = node.querySelector('[class*="popout"]');
    if (!popout) return;

    const hasUploadItem = Array.from(popout.querySelectorAll('[role="menuitem"]')).some(i =>
        i.textContent?.toLowerCase().includes("upload")
    );
    if (hasUploadItem) injectTransferNgButton(popout);
}

function observeAttachmentMenu() {
    const observer = new MutationObserver(mutations => {
        if (Settings.store.transferNgEnabled === false) return;

        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement) tryInjectFromNode(node);
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "complete") {
    observeAttachmentMenu();
} else {
    window.addEventListener("load", observeAttachmentMenu);
}
