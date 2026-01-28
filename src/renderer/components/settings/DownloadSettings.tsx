/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText, Paragraph } from "@vencord/types/components";
import { Settings, useSettings } from "renderer/settings";

import { cl, SettingsComponent } from "./Settings";
import { VesktopSettingsSwitch } from "./VesktopSettingsSwitch";

const DEFAULT_TRANSFER_SERVER = "https://transfer.morawski.my/";

export const DownloadSettings: SettingsComponent = () => {
    const settings = useSettings();

    const aria2Available = VesktopNative.aria2?.isAvailable?.() ?? false;

    return (
        <div className={cl("category-content")}>
            <Paragraph>
                Configure aria2 for fast multi-threaded downloads and transfer.ng for large file uploads.
            </Paragraph>

            <VesktopSettingsSwitch
                title="Enable Aria2 Downloads"
                description={
                    aria2Available
                        ? "Use aria2c for faster downloads with 16 parallel connections. Files save to ~/Downloads."
                        : "aria2c is not installed. Install aria2 to enable this feature."
                }
                value={aria2Available && settings.aria2Enabled !== false}
                onChange={v => (Settings.store.aria2Enabled = v)}
                disabled={!aria2Available}
            />

            <VesktopSettingsSwitch
                title="Enable Transfer.ng Upload"
                description="Automatically upload files larger than 10MB to transfer.ng and share the link instead."
                value={settings.transferNgEnabled !== false}
                onChange={v => (Settings.store.transferNgEnabled = v)}
            />

            {settings.transferNgEnabled !== false && (
                <div style={{ marginTop: "12px" }}>
                    <BaseText size="md" weight="semibold" style={{ marginBottom: "4px" }}>
                        Transfer Server URL
                    </BaseText>
                    <Paragraph style={{ marginBottom: "8px", fontSize: "12px" }}>
                        The transfer.ng instance to use for large file uploads
                    </Paragraph>
                    <input
                        type="text"
                        value={settings.transferNgServer ?? DEFAULT_TRANSFER_SERVER}
                        onChange={e => (Settings.store.transferNgServer = e.target.value)}
                        placeholder={DEFAULT_TRANSFER_SERVER}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            border: "1px solid var(--background-tertiary)",
                            backgroundColor: "var(--background-secondary)",
                            color: "var(--text-normal)",
                            fontSize: "14px"
                        }}
                    />
                </div>
            )}
        </div>
    );
};
