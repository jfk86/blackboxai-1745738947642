const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('./auth');
const crypto = require('crypto');

// In-memory storage for recordings
const recordings = new Map();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Helper function to calculate accuracy score
const calculateAccuracy = (original, transcribed) => {
    // Simple word matching algorithm (can be enhanced with more sophisticated comparison)
    const originalWords = original.split(' ');
    const transcribedWords = transcribed.split(' ');
    
    let matches = 0;
    transcribedWords.forEach(word => {
        if (originalWords.includes(word)) matches++;
    });
    
    return Math.round((matches / originalWords.length) * 100);
};

// Helper function to calculate fluency score
const calculateFluency = (duration, wordCount, gaps) => {
    // Basic fluency calculation (can be enhanced with more sophisticated metrics)
    const wordsPerMinute = (wordCount / duration) * 60;
    const gapPenalty = gaps * 2;
    const baseScore = Math.min(100, (wordsPerMinute / 150) * 100); // 150 WPM as ideal
    
    return Math.max(0, Math.round(baseScore - gapPenalty));
};

// Upload and process recording
router.post('/upload', authenticateToken, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file provided' });
        }

        // For demo purposes, we'll simulate speech-to-text processing
        const transcription = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
        const originalText = req.body.originalText || transcription;
        
        // Calculate mock scores
        const accuracyScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
        const fluencyScore = Math.floor(Math.random() * 30) + 70;

        // Create recording entry
        const recordingId = crypto.randomUUID();
        const recording = {
            id: recordingId,
            userId: req.user.id,
            transcription: transcription,
            accuracyScore: accuracyScore,
            fluencyScore: fluencyScore,
            metadata: {
                duration: 5.5, // Mock duration
                wordCount: transcription.split(' ').length,
                recordingQuality: 'high'
            },
            createdAt: new Date()
        };

        // Store recording
        recordings.set(recordingId, recording);

        res.json({
            message: 'Recording processed successfully',
            recording: {
                id: recording._id,
                audioUrl: url,
                transcription: transcription,
                accuracyScore: accuracyScore,
                fluencyScore: fluencyScore
            }
        });

    } catch (error) {
        console.error('Recording processing error:', error);
        res.status(500).json({ message: 'Error processing recording' });
    }
});

// Get user's recordings
router.get('/list', authenticateToken, async (req, res) => {
    try {
        const userRecordings = Array.from(recordings.values())
            .filter(rec => rec.userId === req.user.id)
            .sort((a, b) => b.createdAt - a.createdAt);
        
        res.json(userRecordings);
    } catch (error) {
        console.error('Error fetching recordings:', error);
        res.status(500).json({ message: 'Error fetching recordings' });
    }
});

// Get specific recording
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const recording = recordings.get(req.params.id);

        if (!recording) {
            return res.status(404).json({ message: 'Recording not found' });
        }

        res.json(recording);
    } catch (error) {
        console.error('Error fetching recording:', error);
        res.status(500).json({ message: 'Error fetching recording' });
    }
});

module.exports = router;
