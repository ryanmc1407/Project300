import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../auth/auth';
import { inject } from '@angular/core';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settings.html',
    styleUrl: './settings.css'
})
export class SettingsComponent {
    private authService = inject(Auth);

    username = this.authService.username;
    userId = this.authService.userId;

    // Settings state
    notificationsEnabled = true;
    emailNotifications = true;
    darkMode = false;
    language = 'en';

    saveSettings() {
        // Future: call API to save preferences
        console.log('Settings saved');
    }

    logout() {
        this.authService.logout();
    }
}
