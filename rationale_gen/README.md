# Rationale Generator - Trade Analyser

User application for uploading and analyzing trading files using AI.

## Features

- User login with credentials provided by admin
- Home page displaying user usage statistics
- File upload (Excel and Image files)
- Automatic file type detection
- About Us page with information about Trading Solution by Vikas
- File analysis (Gemini API integration structure ready)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The application will run on **http://localhost:8081**

## Usage

1. Users must be created by the admin in the Admin Panel
2. Login with the username and password provided by admin
3. Upload Excel files (.xlsx, .xls, .csv) or Images (.jpg, .png, .gif, etc.)
4. View analysis results
5. Check usage statistics on the home page

## API Endpoints

- `POST /api/login` - User login
- `GET /api/user/:userId/usage` - Get user usage statistics
- `POST /api/analyze` - Upload and analyze file

## File Types Supported

- **Excel**: .xlsx, .xls, .csv
- **Images**: .jpg, .jpeg, .png, .gif, .bmp, .webp

## Gemini API Integration

The structure for Gemini API integration is in place. To complete the integration:

1. Add your Gemini API key to the environment variables
2. Update the `/api/analyze` endpoint in `server.js` to call the Gemini API
3. Process the file and send it to Gemini with the analysis prompt
