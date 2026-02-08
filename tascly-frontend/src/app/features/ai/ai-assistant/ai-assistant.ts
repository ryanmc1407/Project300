import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AIPromptComponent } from '../ai-prompt/ai-prompt';
import { AIInstructionsComponent } from '../ai-instructions/ai-instructions';

@Component({
    selector: 'app-ai-assistant',
    standalone: true,
    imports: [CommonModule, AIPromptComponent, AIInstructionsComponent],
    templateUrl: './ai-assistant.html',
    styleUrl: './ai-assistant.css'
})
export class AIAssistantComponent {
    // Signal to track the active tab
    activeTab = signal<'generator' | 'instructions'>('generator');

    // Method to switch tabs
    setActiveTab(tab: 'generator' | 'instructions') {
        this.activeTab.set(tab);
    }
}
