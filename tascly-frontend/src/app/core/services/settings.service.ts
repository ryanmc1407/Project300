import { Injectable, signal } from '@angular/core';

// Interface for user settings
export interface UserSettings {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
        email: boolean;
        push: boolean;
        taskReminders: boolean;
        teamUpdates: boolean;
    };
    preferences: {
        defaultView: 'business' | 'project';
        startOfWeek: 'sunday' | 'monday';
        timeFormat: '12h' | '24h';
        dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    };
    account: {
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

// Service for managing application settings
// Handles user preferences, theme, notifications, etc.
@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    // Default settings
    private defaultSettings: UserSettings = {
        theme: 'auto',
        notifications: {
            email: true,
            push: true,
            taskReminders: true,
            teamUpdates: true
        },
        preferences: {
            defaultView: 'business',
            startOfWeek: 'monday',
            timeFormat: '12h',
            dateFormat: 'MM/DD/YYYY'
        },
        account: {
            name: '',
            email: ''
        }
    };

    // Signal to hold current settings
    settings = signal<UserSettings>(this.defaultSettings);

    constructor() {
        // Load settings from localStorage on init
        this.loadSettings();
    }

    // Load settings from localStorage
    loadSettings(): void {
        const savedSettings = localStorage.getItem('tascly_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                this.settings.set({ ...this.defaultSettings, ...parsed });
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
    }

    // Save settings to localStorage
    saveSettings(settings: Partial<UserSettings>): void {
        const currentSettings = this.settings();
        const updatedSettings = { ...currentSettings, ...settings };
        this.settings.set(updatedSettings);
        localStorage.setItem('tascly_settings', JSON.stringify(updatedSettings));
    }

    // Update theme
    updateTheme(theme: 'light' | 'dark' | 'auto'): void {
        this.saveSettings({ theme });
        this.applyTheme(theme);
    }

    // Apply theme to document
    private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
        const root = document.documentElement;
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', theme);
        }
    }

    // Update notifications
    updateNotifications(notifications: Partial<UserSettings['notifications']>): void {
        const current = this.settings();
        this.saveSettings({
            notifications: { ...current.notifications, ...notifications }
        });
    }

    // Update preferences
    updatePreferences(preferences: Partial<UserSettings['preferences']>): void {
        const current = this.settings();
        this.saveSettings({
            preferences: { ...current.preferences, ...preferences }
        });
    }

    // Update account info
    updateAccount(account: Partial<UserSettings['account']>): void {
        const current = this.settings();
        this.saveSettings({
            account: { ...current.account, ...account }
        });
    }

    // Reset settings to default
    resetSettings(): void {
        this.settings.set(this.defaultSettings);
        localStorage.removeItem('tascly_settings');
    }
}
