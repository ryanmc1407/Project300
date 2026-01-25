// I created this component to display and manage the AI-generated draft tasks
// This is where managers can review, edit, and approve the tasks before they're created
// I'm using Angular 19's input signals and output events for component communication

import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraftTask } from '../../../models/draft-task.model';

@Component({
    selector: 'app-task-draft-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './task-draft-list.html',
    styleUrl: './task-draft-list.css'
})
export class TaskDraftListComponent {
    // I'm using Angular 19's input signal to receive the draft tasks from the parent
    // This is the new way instead of @Input() decorator
    draftTasks = input.required<DraftTask[]>();

    // I'm using output events to communicate back to the parent component
    // These emit when the user wants to confirm or edit tasks
    onConfirm = output<DraftTask[]>();
    onEdit = output<{ tempId: number, field: string, value: any }>();
    onRemove = output<number>();

    // I'm tracking which tasks are selected using a Set for efficient lookups
    // I'm using a signal so the UI updates automatically when selections change
    selectedTasks = signal<Set<number>>(new Set());

    // I created this method to toggle the selection of a task
    // This is called when the user clicks a checkbox
    toggleSelection(tempId: number) {
        // I'm getting the current set of selected tasks
        const current = new Set(this.selectedTasks());

        // I'm checking if this task is already selected
        if (current.has(tempId)) {
            // If it is, I'm removing it from the set
            current.delete(tempId);
        } else {
            // If it's not, I'm adding it to the set
            current.add(tempId);
        }

        // I'm updating the signal with the new set
        this.selectedTasks.set(current);
    }

    // I created this method to select all tasks at once
    // This is called when the user clicks "Select All"
    selectAll() {
        // I'm creating a new set with all task IDs
        const allIds = new Set(this.draftTasks().map(task => task.tempId));

        // I'm updating the signal with all IDs selected
        this.selectedTasks.set(allIds);
    }

    // I created this method to deselect all tasks
    // This is called when the user clicks "Deselect All"
    deselectAll() {
        // I'm clearing the selection by setting an empty set
        this.selectedTasks.set(new Set());
    }

    // I created this method to check if all tasks are selected
    // This helps me show the right button text (Select All vs Deselect All)
    areAllSelected(): boolean {
        return this.selectedTasks().size === this.draftTasks().length &&
            this.draftTasks().length > 0;
    }

    // I created this method to get the selected tasks
    // This filters the draft tasks to only include the selected ones
    getSelectedTasks(): DraftTask[] {
        const selectedIds = this.selectedTasks();
        return this.draftTasks().filter(task => selectedIds.has(task.tempId));
    }

    // I created this method to confirm the selected tasks
    // This emits the selected tasks to the parent component
    confirmSelected() {
        const selected = this.getSelectedTasks();

        // I'm only emitting if there are tasks selected
        if (selected.length > 0) {
            this.onConfirm.emit(selected);

            // I'm clearing the selection after confirmation
            this.deselectAll();
        }
    }

    // I created this method to confirm all tasks at once
    // This is called when the user clicks "Accept All"
    confirmAll() {
        // I'm emitting all draft tasks to the parent
        this.onConfirm.emit(this.draftTasks());

        // I'm clearing the selection
        this.deselectAll();
    }

    // I created this method to update a field in a draft task
    // This is called when the user edits a task property
    updateTask(tempId: number, field: keyof DraftTask, value: any) {
        // I'm emitting the change to the parent component
        // The parent will handle updating the actual data
        this.onEdit.emit({ tempId, field, value });
    }

    // I created this method to remove a draft task
    // This is called when the user clicks the delete button
    removeTask(tempId: number) {
        // I'm emitting the tempId to the parent so it can remove the task
        this.onRemove.emit(tempId);

        // I'm also removing it from the selection if it was selected
        const current = new Set(this.selectedTasks());
        current.delete(tempId);
        this.selectedTasks.set(current);
    }

    // I created this method to get a CSS class based on priority
    // This helps me color-code the priority badges
    getPriorityClass(priority: string): string {
        switch (priority) {
            case 'High':
                return 'priority-high';
            case 'Medium':
                return 'priority-medium';
            case 'Low':
                return 'priority-low';
            default:
                return 'priority-medium';
        }
    }

    // I created this method to get a display icon for each priority level
    // This makes the UI more visual and easier to scan
    getPriorityIcon(priority: string): string {
        switch (priority) {
            case 'High':
                return '🔴';
            case 'Medium':
                return '🟡';
            case 'Low':
                return '🟢';
            default:
                return '⚪';
        }
    }

    // I created this method to get a CSS class based on task type
    // This helps me style different task types differently
    getTypeClass(type: string): string {
        switch (type) {
            case 'Feature':
                return 'type-feature';
            case 'Bug':
                return 'type-bug';
            case 'Improvement':
                return 'type-improvement';
            default:
                return 'type-feature';
        }
    }

    // I created this method to format the estimated hours display
    // This makes the time estimate more readable
    formatEstimatedHours(hours: number): string {
        if (hours === 1) {
            return '1 hour';
        } else if (hours < 1) {
            return `${hours * 60} minutes`;
        } else {
            return `${hours} hours`;
        }
    }
}
