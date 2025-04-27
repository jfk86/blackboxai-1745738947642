class QuranLearningApp {
    constructor() {
        this.currentSurah = {
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾',
            translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds.',
            surahNumber: 1,
            ayahNumbers: [1, 2]
        };

        this.init();
    }

    init() {
        this.updateQuranText();
        this.setupEventListeners();
        this.checkDeviceSupport();
    }

    updateQuranText() {
        const quranTextElement = document.getElementById('quran-text');
        quranTextElement.textContent = this.currentSurah.text;
    }

    setupEventListeners() {
        // Add any additional event listeners here
        window.addEventListener('error', this.handleError.bind(this));
    }

    checkDeviceSupport() {
        // Check for necessary browser features
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('Your browser does not support audio recording. Please use a modern browser like Chrome or Firefox.');
            document.getElementById('start-recording').disabled = true;
            return false;
        }

        // Check for Web Audio API support
        if (!window.AudioContext && !window.webkitAudioContext) {
            this.showError('Your browser does not support audio visualization. Please use a modern browser.');
            return false;
        }

        return true;
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    handleError(error) {
        console.error('Application error:', error);
        this.showError('An error occurred. Please try again.');
    }

    // Method to update progress (can be expanded based on backend implementation)
    updateProgress(data) {
        const resultsSection = document.getElementById('results-section');
        
        if (data.completed) {
            resultsSection.classList.remove('hidden');
            // Update scores and feedback
            document.getElementById('accuracy-score').textContent = `${data.accuracyScore}%`;
            document.getElementById('fluency-score').textContent = `${data.fluencyScore}%`;
        }
    }

    // Method to change current Surah (can be implemented with backend integration)
    async changeSurah(surahNumber, ayahNumber) {
        try {
            const response = await fetch(`http://localhost:3000/api/quran/surah/${surahNumber}/ayah/${ayahNumber}`, {
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentSurah = data;
                this.updateQuranText();
            } else {
                this.showError('Error loading Quran text. Please try again.');
            }
        } catch (error) {
            console.error('Error changing surah:', error);
            this.showError('Error loading Quran text. Please check your connection.');
        }
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quranApp = new QuranLearningApp();
});

// Handle service worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
