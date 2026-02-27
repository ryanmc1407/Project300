import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../common-ui/user-profile/user-profile';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, UserProfile],
  template: `
        <div class="container-fluid py-4 px-4 h-100">
            <app-user-profile></app-user-profile>
        </div>
    `,
  styles: [`
        :host {
            display: block;
            height: 100%;
        }
    `]
})
export class ProfileComponent { }
