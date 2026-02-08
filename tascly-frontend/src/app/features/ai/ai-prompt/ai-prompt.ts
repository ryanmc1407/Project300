// I created this component to be the main interface for AI task generation
// This is where managers can type or speak their task requests
// I'm using Angular 19's standalone components and signals for reactive state

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiTaskGeneratorService } from '../../../core/services/ai-task-generator.service';
import { VoiceInputService } from '../../../core/services/voice-input.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

import { TaskDraftListComponent } from '../task-draft-list/task-draft-list';

@Component({
    selector: 'app-ai-prompt',
    standalone: true,
    imports: [CommonModule, TaskDraftListComponent],
    templateUrl: './ai-prompt.html',
    styleUrl: './ai-prompt.css'
})
export class AIPromptComponent implements OnInit, OnDestroy {
    // I'm injecting the AI service to handle task generation
    // I'm making this public so the template can access it
    aiService = inject(AiTaskGeneratorService);
    public voiceService = inject(VoiceInputService); // Must be public for template access
    private authService = inject(AuthService);

    // I'm using signals to manage the component's reactive state
    // This is the Angular 19 way instead of using traditional properties
    promptSignal = signal<string>('');

    // I'm tracking whether the AI is currently processing
    // I get this from the service so it's shared across components
    isProcessing = this.aiService.isProcessing;

    // I'm tracking any errors that occur
    errorMessage = this.aiService.errorSignal;

    // I'm tracking whether voice input is active
    isListeningSignal = signal<boolean>(false);

    // I'm storing the current project ID
    // In a real app, I'd get this from a route parameter or state management
    currentProjectId = signal<number>(1);

    // I'm storing example prompts to help users get started
    // These show up as suggestions in the UI
    examplePrompts = [
        'Build a user authentication system with email verification and password reset',
        'Create a dashboard with charts showing sales data for the last 30 days',
        'Implement a file upload feature with drag-and-drop and progress tracking',
        'Add a notification system with real-time updates and email alerts'
    ];

    // I'm storing a subscription to the voice input observable
    // I need to track this so I can unsubscribe when the component is destroyed
    private voiceSubscription?: Subscription;

    ngOnInit() {
        // I'm checking if voice input is supported in this browser
        // If not, I'll hide the voice button in the UI
        if (!this.voiceService.isSupported()) {
            console.warn('Voice input is not supported in this browser');
        }
    }

    ngOnDestroy() {
        // I'm cleaning up the voice subscription to prevent memory leaks
        if (this.voiceSubscription) {
            this.voiceSubscription.unsubscribe();
        }
    }

    // I created this method to handle the "Generate Tasks" button click
    // This is where I send the prompt to the AI service
    async generateTasks() {
        // I'm getting the current prompt text
        const prompt = this.promptSignal();

        // I'm validating that the prompt isn't empty
        if (!prompt || prompt.trim().length === 0) {
            this.errorMessage.set('Please enter a description of what you need');
            return;
        }

        // I'm getting the current user ID from the auth service
        const userId = this.authService.currentUser()?.id;

        if (!userId) {
            this.errorMessage.set('You must be logged in to generate tasks');
            return;
        }

        // I'm calling the AI service to generate tasks
        // This is an async operation, so I'm using await
        await this.aiService.generateTasks(
            prompt,
            this.currentProjectId(),
            userId
        );

        // I'm clearing the prompt after successful generation
        // This prepares the input for the next request
        if (this.aiService.getDraftTaskCount() > 0) {
            this.promptSignal.set('');
        }
    }

    // I created this method to handle voice input
    // This is called when the user clicks the microphone button
    startVoiceInput() {
        // I'm checking if voice input is supported
        if (!this.voiceService.isSupported()) {
            this.errorMessage.set('Voice input is not supported in your browser');
            return;
        }

        // I'm setting the listening state to true
        // This will show a visual indicator in the UI
        this.isListeningSignal.set(true);

        // I'm starting the voice recognition and subscribing to the results
        this.voiceSubscription = this.voiceService.startListening().subscribe({
            next: (transcript) => {
                // I'm adding the transcribed text to the prompt
                // I'm appending it to any existing text rather than replacing it
                const currentPrompt = this.promptSignal();
                const newPrompt = currentPrompt
                    ? `${currentPrompt} ${transcript}`
                    : transcript;

                this.promptSignal.set(newPrompt);

                // I'm resetting the listening state
                this.isListeningSignal.set(false);
            },
            error: (error) => {
                // I'm handling any errors that occur during voice recognition
                console.error('Voice input error:', error);
                this.errorMessage.set('Voice input failed. Please try again.');
                this.isListeningSignal.set(false);
            }
        });
    }

    // I created this method to stop voice input if the user cancels
    stopVoiceInput() {
        this.voiceService.stopListening();
        this.isListeningSignal.set(false);
    }

    // I created this method to insert an example prompt
    // This is called when the user clicks on one of the example suggestions
    useExamplePrompt(example: string) {
        this.promptSignal.set(example);
    }

    // I created this method to clear the prompt and any errors
    // This gives the user a fresh start
    clearPrompt() {
        this.promptSignal.set('');
        this.errorMessage.set(null);
    }

    // I created this computed property to check if the generate button should be disabled
    // I'm disabling it when the prompt is empty or the AI is processing
    isGenerateDisabled(): boolean {
        return !this.promptSignal() ||
            this.promptSignal().trim().length === 0 ||
            this.isProcessing();
    }

    // I created this method to get the character count of the prompt
    // This helps users know how much they've written
    getCharacterCount(): number {
        return this.promptSignal().length;
    }

    // Save all draft tasks to the backend
    async saveDraftTasks() {
        await this.aiService.saveDraftTasks();
    }

    // Clear all draft tasks
    clearDrafts() {
        this.aiService.clearDraftTasks();
    }
}
