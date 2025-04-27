const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    transcription: {
        type: String,
        required: true
    },
    originalText: {
        type: String,
        required: true
    },
    accuracyScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    fluencyScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    metadata: {
        duration: Number,
        wordCount: Number,
        surahNumber: Number,
        ayahNumbers: [Number],
        recordingQuality: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        }
    },
    feedback: [{
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    analysis: {
        errors: [{
            type: {
                type: String,
                enum: ['pronunciation', 'tajweed', 'pause', 'other']
            },
            description: String,
            wordIndex: Number,
            suggestion: String
        }],
        strengths: [{
            type: String,
            description: String
        }],
        improvements: [{
            type: String,
            description: String
        }]
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'reviewed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index for efficient queries
recordingSchema.index({ userId: 1, createdAt: -1 });
recordingSchema.index({ status: 1 });

// Virtual for overall score
recordingSchema.virtual('overallScore').get(function() {
    return Math.round((this.accuracyScore + this.fluencyScore) / 2);
});

// Method to add teacher feedback
recordingSchema.methods.addFeedback = async function(teacherId, comment, rating) {
    this.feedback.push({
        teacherId,
        comment,
        rating
    });
    this.status = 'reviewed';
    return this.save();
};

// Method to update analysis
recordingSchema.methods.updateAnalysis = function(analysisData) {
    this.analysis = {
        ...this.analysis,
        ...analysisData
    };
    return this.save();
};

// Static method to get student progress
recordingSchema.statics.getStudentProgress = async function(userId) {
    const recordings = await this.find({ userId }).sort({ createdAt: -1 });
    
    return {
        totalRecordings: recordings.length,
        averageAccuracy: recordings.reduce((acc, rec) => acc + rec.accuracyScore, 0) / recordings.length,
        averageFluency: recordings.reduce((acc, rec) => acc + rec.fluencyScore, 0) / recordings.length,
        recentRecordings: recordings.slice(0, 5),
        improvementTrend: recordings.length > 1 ? 
            recordings[0].overallScore - recordings[recordings.length - 1].overallScore : 
            0
    };
};

// Pre-save middleware
recordingSchema.pre('save', function(next) {
    // Calculate metadata if not provided
    if (!this.metadata.wordCount && this.transcription) {
        this.metadata.wordCount = this.transcription.split(' ').length;
    }
    next();
});

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = Recording;
