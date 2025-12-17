# Trade Analyser

A comprehensive trading analysis platform with an Admin Panel and User Application.

## Project Structure

```
Trade Analyser/
├── admin_web/          # Admin Panel (Port 8080)
│   ├── server.js       # Express backend
│   ├── public/         # Frontend files
│   └── data.json       # User data storage
│
└── rationale_gen/      # User Application (Port 8081)
    ├── server.js       # Express backend
    ├── public/         # Frontend files
    └── uploads/        # Temporary file storage
```

## Quick Start

### 1. Setup Admin Panel

```bash
cd admin_web
npm install
npm start
```

Admin Panel will be available at **http://localhost:8080**

### 2. Setup Rationale Generator

```bash
cd rationale_gen
npm install
npm start
```

User Application will be available at **http://localhost:8081**

## Features

### Admin Panel (Port 8080)
- Dashboard with all users and usage statistics
- Create new users with username and password
- View detailed usage metrics (total uploads, Excel uploads, Image uploads)
- Delete users
- Real-time statistics overview

### Rationale Generator (Port 8081)
- User login with admin-provided credentials
- Home page showing personal usage statistics
- File upload (Excel and Image files)
- Automatic file type detection
- About Us page for Trading Solution by Vikas
- File analysis structure (ready for Gemini API integration)

## Workflow

1. **Admin creates users**: Admin logs into the Admin Panel and creates user accounts
2. **Users log in**: Users use their credentials to access the Rationale Generator
3. **File upload**: Users upload Excel or Image files for analysis
4. **Usage tracking**: All uploads are tracked and displayed in both applications
5. **Analysis**: Files are processed (Gemini API integration can be added)

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Authentication**: bcryptjs for password hashing
- **File Upload**: multer for handling file uploads
- **Data Storage**: JSON file (can be migrated to database)

## Next Steps

1. **Gemini API Integration**: Add actual Gemini API calls in `rationale_gen/server.js`
2. **Database Migration**: Replace JSON file storage with a proper database
3. **Enhanced Security**: Add JWT tokens, session management
4. **File Storage**: Implement proper file storage solution (S3, local storage, etc.)

## Notes

- Both applications share the same `data.json` file for user data
- Default admin password is `admin123` (change in admin_web/server.js)
- File uploads are temporarily stored and cleaned up after processing
- Gemini API integration structure is ready but not yet connected

