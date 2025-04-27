# Quran Learning Portal

An AI-powered web application for Quran recitation learning and assessment. The application uses speech-to-text technology to analyze and provide feedback on Quran recitations.

## Features

- User authentication (student/teacher roles)
- Audio recording with real-time visualization
- Arabic speech-to-text conversion
- Accuracy and fluency scoring
- Progress tracking
- Teacher feedback system
- Responsive design

## Tech Stack

### Frontend
- HTML5
- Tailwind CSS
- JavaScript (Vanilla)
- Web Audio API
- Font Awesome Icons
- Google Fonts (Amiri)

### Backend
- Node.js
- Express.js
- MongoDB
- Google Cloud Speech-to-Text API
- Google Cloud Storage
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud Platform account with Speech-to-Text API enabled
- Google Cloud credentials

## Setup

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/quran-learning-portal.git
cd quran-learning-portal
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

3. Set up environment variables:
Create a .env file in the backend directory:
\`\`\`
PORT=3000
MONGODB_URI=mongodb://localhost:27017/quran-learning
JWT_SECRET=your_jwt_secret
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
\`\`\`

4. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

5. Open the frontend:
- Navigate to the frontend directory
- Open index.html in a web browser
- For development, you can use a local server:
\`\`\`bash
python -m http.server 8000
\`\`\`

## Usage

1. Register as a student or teacher
2. Login to access the dashboard
3. Students can:
   - Record Quran recitations
   - View accuracy and fluency scores
   - Track progress
   - Receive feedback from teachers

4. Teachers can:
   - Review student recordings
   - Provide feedback
   - Monitor student progress

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/profile - Get user profile

### Recordings
- POST /api/recording/upload - Upload new recording
- GET /api/recording/list - Get user's recordings
- GET /api/recording/:id - Get specific recording

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Cloud Speech-to-Text API for Arabic speech recognition
- Tailwind CSS for styling
- Font Awesome for icons
- Google Fonts for Arabic typography

## Future Enhancements

- Real-time feedback during recitation
- Advanced tajweed rules checking
- Mobile application
- Offline support
- Community features
- Integration with popular Quran learning platforms

## Support

For support, email support@quranlearningportal.com or create an issue in the repository.
