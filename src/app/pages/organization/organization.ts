import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationOverview } from '../../common-ui/organization-overview/organization-overview';

@Component({
  selector: 'app-organization-page',
  standalone: true,
  imports: [CommonModule, OrganizationOverview],
  template: `
        <div class="container-fluid py-4 px-4 h-100">
            <app-organization-overview></app-organization-overview>
        </div>
    `,
  styles: [`
        :host {
            display: block;
            height: 100%;
        }
    `]
})
export class OrganizationComponent { }
