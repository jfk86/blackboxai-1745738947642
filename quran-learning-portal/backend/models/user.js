const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    profile: {
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        avatar: String
    },
    progress: {
        totalRecordings: {
            type: Number,
            default: 0
        },
        averageAccuracy: {
            type: Number,
            default: 0
        },
        averageFluency: {
            type: Number,
            default: 0
        },
        lastRecordingDate: Date
    },
    settings: {
        language: {
            type: String,
            default: 'ar'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            default: 'light'
        }
    }
}, {
    timestamps: true
});

// Pre-save middleware to handle password hashing if needed
userSchema.pre('save', function(next) {
    // Add any pre-save operations here
    next();
});

// Method to update user progress
userSchema.methods.updateProgress = async function(accuracyScore, fluencyScore) {
    const oldTotal = this.progress.totalRecordings;
    this.progress.totalRecordings += 1;
    
    // Update average scores
    this.progress.averageAccuracy = (
        (this.progress.averageAccuracy * oldTotal + accuracyScore) / 
        this.progress.totalRecordings
    );
    
    this.progress.averageFluency = (
        (this.progress.averageFluency * oldTotal + fluencyScore) / 
        this.progress.totalRecordings
    );
    
    this.progress.lastRecordingDate = new Date();
    
    return this.save();
};

// Static method to find teachers
userSchema.statics.findTeachers = function() {
    return this.find({ role: 'teacher' });
};

// Method to safely return user data without sensitive information
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
