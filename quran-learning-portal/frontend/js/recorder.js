class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.visualizerCanvas = document.getElementById('audio-visualizer');
        this.canvasCtx = this.visualizerCanvas.getContext('2d');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');

        startBtn.addEventListener('click', () => this.startRecording());
        stopBtn.addEventListener('click', () => this.stopRecording());
    }

    async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

            this.mediaRecorder.addEventListener('dataavailable', (event) => {
                this.audioChunks.push(event.data);
            });

            this.mediaRecorder.addEventListener('stop', () => this.processRecording());

            // Setup audio visualization
            this.setupAudioVisualization();

            // Start recording
            this.mediaRecorder.start();
            this.isRecording = true;

            // Update UI
            document.getElementById('start-recording').classList.add('hidden');
            document.getElementById('stop-recording').classList.remove('hidden');
            document.getElementById('start-recording').classList.add('recording-pulse');

            // Start visualization
            this.visualize();
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Error accessing microphone. Please ensure microphone permissions are granted.');
        }
    }

    setupAudioVisualization() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        source.connect(this.analyser);
        
        this.analyser.fftSize = 256;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }

    visualize() {
        if (!this.isRecording) return;

        const width = this.visualizerCanvas.width;
        const height = this.visualizerCanvas.height;
        const barWidth = (width / this.bufferLength) * 2.5;

        this.analyser.getByteFrequencyData(this.dataArray);

        this.canvasCtx.fillStyle = '#f3f4f6';
        this.canvasCtx.fillRect(0, 0, width, height);

        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * height;
            
            const gradient = this.canvasCtx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#16a34a');
            gradient.addColorStop(1, '#22c55e');
            
            this.canvasCtx.fillStyle = gradient;
            this.canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        requestAnimationFrame(() => this.visualize());
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stream.getTracks().forEach(track => track.stop());
            
            // Update UI
            document.getElementById('start-recording').classList.remove('hidden');
            document.getElementById('stop-recording').classList.add('hidden');
            document.getElementById('start-recording').classList.remove('recording-pulse');

            // Clear visualization
            this.canvasCtx.clearRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);
        }
    }

    async processRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
            const response = await fetch('http://localhost:3000/api/recording/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                this.displayResults(data);
            } else {
                alert(data.message || 'Error processing recording');
            }
        } catch (error) {
            console.error('Error uploading recording:', error);
            alert('Error uploading recording. Please try again.');
        }
    }

    displayResults(data) {
        const resultsSection = document.getElementById('results-section');
        const accuracyScore = document.getElementById('accuracy-score');
        const fluencyScore = document.getElementById('fluency-score');
        const transcribedText = document.getElementById('transcribed-text');

        // Update scores and text
        accuracyScore.textContent = `${data.accuracyScore}%`;
        fluencyScore.textContent = `${data.fluencyScore}%`;
        transcribedText.textContent = data.transcription;

        // Show results section
        resultsSection.classList.remove('hidden');
    }
}

// Initialize audio recorder
const audioRecorder = new AudioRecorder();

// Handle canvas resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('audio-visualizer');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
});

// Initial canvas size
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('audio-visualizer');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
});
