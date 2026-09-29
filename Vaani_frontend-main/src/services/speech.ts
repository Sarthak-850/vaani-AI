// Speech Recognition & Audio Analysis Service

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export class SpeechService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;

  public isSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public async startListening({
    language = 'en-IN',
    onTranscriptUpdate,
    onError,
    onAudioLevel
  }: {
    language?: 'en-IN' | 'hi-IN';
    onTranscriptUpdate: (fullTranscript: string, isFinal: boolean) => void;
    onError: (errorMessage: string) => void;
    onAudioLevel?: (volume: number) => void;
  }): Promise<void> {
    try {
      // 1. Initialize Microphone Audio Stream for visualizer & fallback recording
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.setupAudioVisualizer(this.micStream, onAudioLevel);
          this.setupMediaRecorder(this.micStream);
        } catch (mediaErr: any) {
          if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
            onError('Microphone permission denied. Please allow microphone access in your browser settings.');
            return;
          }
          console.warn('MediaStream setup warning:', mediaErr);
        }
      }

      // 2. Initialize Web Speech API
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        onError('Web Speech API is not supported in this browser. You can type the visit report manually.');
        return;
      }

      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = language;

      let completeTranscript = '';

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            completeTranscript += (completeTranscript ? ' ' : '') + transcriptChunk.trim();
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        const displayTranscript = completeTranscript + (interimTranscript ? ' ' + interimTranscript : '');
        onTranscriptUpdate(displayTranscript, false);
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          onError('Microphone access denied. Please click the lock icon in the address bar to enable.');
        } else if (event.error === 'no-speech') {
          // Normal silence, don't show blocking error
        } else if (event.error === 'network') {
          onError('Speech service network issue. You can still type manually or record audio.');
        } else {
          onError(`Voice input error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Auto restart if still marked as listening
          try {
            this.recognition?.start();
          } catch (e) {
            this.isListening = false;
          }
        }
      };

      this.recognition.start();
      this.isListening = true;
    } catch (err: any) {
      console.error('Error starting speech service:', err);
      onError(err.message || 'Failed to start speech recognition.');
    }
  }

  private setupAudioVisualizer(stream: MediaStream, onAudioLevel?: (volume: number) => void) {
    if (!onAudioLevel) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.isListening || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        onAudioLevel(normalized);
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.debug('AudioContext not allowed or not supported yet', e);
    }
  }

  private setupMediaRecorder(stream: MediaStream) {
    try {
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      this.mediaRecorder.start();
    } catch (e) {
      console.warn('MediaRecorder error:', e);
    }
  }

  public stopListening(): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.isListening = false;

      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {
          console.debug('Error stopping recognition', e);
        }
        this.recognition = null;
      }

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.cleanupStreams();
          resolve(audioBlob);
        };
        this.mediaRecorder.stop();
      } else {
        this.cleanupStreams();
        resolve(null);
      }
    });
  }

  private cleanupStreams() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
  }
}

export const speechService = new SpeechService();
