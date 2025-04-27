const speech = require('@google-cloud/speech');
const config = require('../config/config');

class SpeechToTextProcessor {
    constructor() {
        this.client = new speech.SpeechClient();
    }

    /**
     * Process audio file and convert to text
     * @param {Buffer} audioBuffer - The audio buffer to process
     * @param {Object} options - Additional options for speech recognition
     * @returns {Promise<Object>} The processing results
     */
    async processAudio(audioBuffer, options = {}) {
        try {
            const audioContent = {
                content: audioBuffer.toString('base64')
            };

            const request = {
                audio: audioContent,
                config: {
                    ...config.googleCloud.speech,
                    ...options,
                    enableWordTimeOffsets: true,
                    enableAutomaticPunctuation: true
                }
            };

            const [response] = await this.client.recognize(request);
            return this.formatResponse(response);
        } catch (error) {
            console.error('Speech-to-text processing error:', error);
            throw new Error('Failed to process audio');
        }
    }

    /**
     * Format the speech recognition response
     * @param {Object} response - The raw response from Google Speech-to-Text
     * @returns {Object} Formatted response with additional metrics
     */
    formatResponse(response) {
        const results = response.results[0];
        if (!results) {
            throw new Error('No recognition results received');
        }

        const alternative = results.alternatives[0];
        const words = alternative.words || [];

        // Calculate timing metrics
        const timing = this.calculateTimingMetrics(words);

        return {
            transcript: alternative.transcript,
            confidence: alternative.confidence,
            words: words.map(word => ({
                word: word.word,
                startTime: this.formatTime(word.startTime),
                endTime: this.formatTime(word.endTime),
                confidence: word.confidence
            })),
            metrics: {
                ...timing,
                totalWords: words.length,
                averageConfidence: alternative.confidence
            }
        };
    }

    /**
     * Calculate timing metrics from word data
     * @param {Array} words - Array of word objects with timing information
     * @returns {Object} Timing metrics
     */
    calculateTimingMetrics(words) {
        if (!words.length) return { duration: 0, wordsPerMinute: 0, gaps: [] };

        const gaps = [];
        let totalGapDuration = 0;
        
        // Calculate gaps between words
        for (let i = 1; i < words.length; i++) {
            const gap = this.getSeconds(words[i].startTime) - this.getSeconds(words[i-1].endTime);
            if (gap > 0.5) { // Consider gaps longer than 0.5 seconds
                gaps.push({
                    duration: gap,
                    position: i
                });
                totalGapDuration += gap;
            }
        }

        const duration = this.getSeconds(words[words.length - 1].endTime) - 
                        this.getSeconds(words[0].startTime);
        
        const effectiveDuration = duration - totalGapDuration;
        const wordsPerMinute = (words.length / effectiveDuration) * 60;

        return {
            duration,
            effectiveDuration,
            wordsPerMinute,
            gaps,
            totalGaps: gaps.length,
            totalGapDuration
        };
    }

    /**
     * Format protobuf duration to seconds
     * @param {Object} duration - Protobuf duration object
     * @returns {number} Time in seconds
     */
    formatTime(duration) {
        return (duration.seconds || 0) + (duration.nanos || 0) / 1e9;
    }

    /**
     * Convert protobuf duration to seconds
     * @param {Object} duration - Protobuf duration object
     * @returns {number} Time in seconds
     */
    getSeconds(duration) {
        return Number(duration.seconds || 0) + Number(duration.nanos || 0) / 1e9;
    }

    /**
     * Compare transcribed text with original text
     * @param {string} original - Original Quran text
     * @param {string} transcribed - Transcribed text from speech recognition
     * @returns {Object} Comparison results with metrics
     */
    compareTexts(original, transcribed) {
        const originalWords = original.split(' ');
        const transcribedWords = transcribed.split(' ');
        
        const matches = [];
        const errors = [];
        let totalMatches = 0;

        // Compare each transcribed word with original text
        transcribedWords.forEach((word, index) => {
            const normalizedWord = this.normalizeArabicText(word);
            const matchIndex = originalWords.findIndex(w => 
                this.normalizeArabicText(w) === normalizedWord
            );

            if (matchIndex !== -1) {
                totalMatches++;
                matches.push({
                    word,
                    position: index,
                    originalPosition: matchIndex
                });
            } else {
                errors.push({
                    word,
                    position: index,
                    suggestion: this.findClosestMatch(word, originalWords)
                });
            }
        });

        return {
            accuracy: (totalMatches / originalWords.length) * 100,
            matches,
            errors,
            metrics: {
                totalWords: originalWords.length,
                matchedWords: totalMatches,
                errorCount: errors.length
            }
        };
    }

    /**
     * Normalize Arabic text for comparison
     * @param {string} text - Text to normalize
     * @returns {string} Normalized text
     */
    normalizeArabicText(text) {
        return text
            .replace(/[ًٌٍَُِّْ]/g, '') // Remove tashkeel
            .replace(/[إأآ]/g, 'ا') // Normalize alef
            .replace(/[ىی]/g, 'ي') // Normalize ya
            .replace(/ة/g, 'ه') // Normalize ta marbuta
            .trim()
            .toLowerCase();
    }

    /**
     * Find the closest matching word using Levenshtein distance
     * @param {string} word - Word to find match for
     * @param {Array} wordList - List of words to search in
     * @returns {string} Closest matching word
     */
    findClosestMatch(word, wordList) {
        let minDistance = Infinity;
        let closestWord = '';

        wordList.forEach(w => {
            const distance = this.levenshteinDistance(
                this.normalizeArabicText(word),
                this.normalizeArabicText(w)
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestWord = w;
            }
        });

        return closestWord;
    }

    /**
     * Calculate Levenshtein distance between two strings
     * @param {string} a - First string
     * @param {string} b - Second string
     * @returns {number} Levenshtein distance
     */
    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }
}

module.exports = new SpeechToTextProcessor();
