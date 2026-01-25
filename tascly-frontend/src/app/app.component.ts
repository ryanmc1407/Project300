import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar';

// This is my root component - it's the entry point of the app
// I'm adding the sidebar for navigation
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="app-container">
      <app-sidebar />
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
      .app-container {
        display: flex;
        min-height: 100vh;
      }
      
      .main-content {
        flex: 1;
        margin-left: 280px;
        background-color: #F9FAFB;
      }
    `]
})
export class AppComponent {
  title = 'Tascly';
}
