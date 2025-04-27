require('dotenv').config();

const config = {
    // Server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // MongoDB configuration
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/quran-learning',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },

    // Google Cloud configuration
    googleCloud: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        storage: {
            bucketName: process.env.GOOGLE_STORAGE_BUCKET || 'quran-recordings'
        },
        speech: {
            languageCode: 'ar-SA',
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            model: 'default'
        }
    },

    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },

    // Audio upload configuration
    upload: {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
            files: 1
        },
        allowedMimeTypes: ['audio/webm', 'audio/mp3', 'audio/wav']
    },

    // Scoring configuration
    scoring: {
        accuracy: {
            perfectMatch: 100,
            partialMatch: 50,
            noMatch: 0
        },
        fluency: {
            optimalWPM: 150, // Words per minute
            gapPenalty: 2,
            maxScore: 100
        }
    },

    // Cache configuration
    cache: {
        ttl: 3600, // 1 hour in seconds
        checkPeriod: 600 // 10 minutes in seconds
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'combined'
    }
};

// Environment-specific configurations
if (config.nodeEnv === 'development') {
    config.logging.level = 'debug';
}

if (config.nodeEnv === 'production') {
    // Add production-specific settings
    config.cors.origin = process.env.PRODUCTION_FRONTEND_URL;
    
    // Enhanced security settings for production
    config.security = {
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        },
        helmet: {
            contentSecurityPolicy: true,
            xssFilter: true
        }
    };
}

// Validation
const requiredEnvVars = [
    'JWT_SECRET',
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_APPLICATION_CREDENTIALS'
];

if (config.nodeEnv === 'production') {
    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    });
}

module.exports = config;
