// I created this service to handle voice input using the Web Speech API
// This allows managers to speak their task requests instead of typing them
// I'm making this a separate service so I can reuse it in other parts of the app

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root' // I'm making this available throughout my app
})
export class VoiceInputService {
    // I'm storing a reference to the speech recognition object
    // I'm using 'any' type because the Web Speech API isn't fully typed in TypeScript
    private recognition: any;

    // I'm using a Subject to emit the transcribed text
    // This allows multiple components to subscribe to voice input events
    private transcriptSubject = new Subject<string>();

    // I'm tracking whether voice input is currently active
    private isListening = false;

    constructor() {
        // I'm checking if the browser supports the Web Speech API
        // Different browsers use different property names, so I check both
        const SpeechRecognition = (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            // I'm creating a new speech recognition instance
            this.recognition = new SpeechRecognition();

            // I'm setting continuous to false because I want one complete sentence at a time
            // If I set this to true, it would keep listening until I manually stop it
            this.recognition.continuous = false;

            // I'm setting the language to US English
            // I could make this configurable based on user preferences later
            this.recognition.lang = 'en-US';

            // I'm setting interim results to false because I only want the final transcript
            // If I set this to true, I'd get partial results as the user speaks
            this.recognition.interimResults = false;

            // I'm setting up the event handler for when speech is recognized
            this.recognition.onresult = (event: any) => {
                // I'm getting the transcript from the first result
                // The API can return multiple results, but I'm just using the first one
                const transcript = event.results[0][0].transcript;

                // I'm emitting the transcript through my Subject
                // This notifies any subscribers that new text is available
                this.transcriptSubject.next(transcript);

                // I'm updating my listening state
                this.isListening = false;
            };

            // I'm setting up the error handler
            this.recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);

                // I'm emitting an error through the Subject
                this.transcriptSubject.error(event.error);

                // I'm updating my listening state
                this.isListening = false;
            };

            // I'm setting up a handler for when recognition ends
            this.recognition.onend = () => {
                this.isListening = false;
            };
        } else {
            // I'm logging a warning if the browser doesn't support speech recognition
            console.warn('Speech recognition is not supported in this browser');
        }
    }

    // I created this method to start listening for voice input
    // It returns an Observable that components can subscribe to
    startListening(): Observable<string> {
        // I'm checking if speech recognition is available
        if (!this.recognition) {
            // I'm throwing an error if it's not supported
            throw new Error('Speech recognition is not supported in this browser');
        }

        // I'm checking if we're already listening
        if (this.isListening) {
            // I'm stopping the current session before starting a new one
            this.recognition.stop();
        }

        try {
            // I'm starting the speech recognition
            this.recognition.start();

            // I'm updating my listening state
            this.isListening = true;

        } catch (error) {
            console.error('Failed to start speech recognition:', error);
        }

        // I'm returning the Subject as an Observable
        // This allows components to subscribe and receive the transcript
        return this.transcriptSubject.asObservable();
    }

    // I created this method to stop listening for voice input
    stopListening(): void {
        if (this.recognition && this.isListening) {
            // I'm stopping the speech recognition
            this.recognition.stop();

            // I'm updating my listening state
            this.isListening = false;
        }
    }

    // I created this method to check if voice input is currently active
    // This is useful for showing a "listening" indicator in the UI
    isCurrentlyListening(): boolean {
        return this.isListening;
    }

    // I created this method to check if the browser supports voice input
    // This is useful for conditionally showing the voice input button
    isSupported(): boolean {
        return !!this.recognition;
    }
}
