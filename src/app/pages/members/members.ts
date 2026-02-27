import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceMembers } from '../../common-ui/workspace-members/workspace-members';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [CommonModule, WorkspaceMembers],
  template: `
        <div class="container-fluid py-4 px-4 h-100">
            <app-workspace-members></app-workspace-members>
        </div>
    `,
  styles: [`
        :host {
            display: block;
            height: 100%;
        }
    `]
})
export class MembersComponent { }
