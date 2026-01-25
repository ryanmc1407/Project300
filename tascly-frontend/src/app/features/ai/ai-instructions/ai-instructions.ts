import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// AI Instructions Component
// Interface for managing AI-powered task automation and suggestions
@Component({
    selector: 'app-ai-instructions',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ai-instructions.html',
    styleUrl: './ai-instructions.css'
})
export class AIInstructionsComponent {
    // Saved AI instruction templates
    savedInstructions = [
        {
            id: 1,
            name: 'Daily Task Prioritization',
            description: 'Automatically prioritize tasks based on deadlines and importance',
            enabled: true,
            lastRun: new Date('2026-01-25T08:00:00')
        },
        {
            id: 2,
            name: 'Team Workload Balancing',
            description: 'Suggest task reassignments to balance team workload',
            enabled: true,
            lastRun: new Date('2026-01-24T16:00:00')
        },
        {
            id: 3,
            name: 'Sprint Planning Assistant',
            description: 'Generate sprint plans based on team capacity and priorities',
            enabled: false,
            lastRun: null
        }
    ];

    // Current instruction being edited
    currentInstruction = '';

    // AI suggestions
    aiSuggestions = [
        'Consider breaking down large tasks into smaller subtasks',
        'Task "Client presentation prep" has high priority but no assignee',
        'Your weekly workload is at 95% capacity - consider delegating'
    ];
}
