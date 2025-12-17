# Admin Panel - Trade Analyser

Admin dashboard for managing users and monitoring usage statistics.

## Features

- Dashboard showing all users and their usage statistics
- Create new users with username and password
- View user activity (total uploads, Excel uploads, Image uploads, last activity)
- Delete users
- Real-time statistics overview

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The admin panel will run on **http://localhost:8080**

## Default Admin Access

- Default admin password: `admin123` (can be changed in server.js)

## API Endpoints

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `DELETE /api/users/:userId` - Delete a user
- `POST /api/users/:userId/usage` - Update user usage (called by rationale generator)
- `POST /api/admin/login` - Admin login

## Data Storage

User data is stored in `data.json` file in the admin_web directory.
