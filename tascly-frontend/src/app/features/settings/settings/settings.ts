import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, UserSettings } from '../../../core/services/settings.service';

// Settings Component
// Manage user preferences, notifications, and account settings
@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './settings.html',
    styleUrl: './settings.css'
})
export class SettingsComponent {
    private settingsService = inject(SettingsService);

    // Get current settings
    settings = this.settingsService.settings;

    // Active tab
    activeTab: 'general' | 'notifications' | 'account' = 'general';

    updateTheme(theme: 'light' | 'dark' | 'auto') {
        this.settingsService.updateTheme(theme);
    }

    updateNotification(key: keyof UserSettings['notifications'], value: boolean) {
        this.settingsService.updateNotifications({ [key]: value });
    }

    updatePreference(key: keyof UserSettings['preferences'], value: any) {
        this.settingsService.updatePreferences({ [key]: value });
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            this.settingsService.resetSettings();
        }
    }
}
