# VideoShare – Video Sharing Platform

A full-stack video sharing web application with secure authentication and media processing capabilities.

## Features

- 🔐 User authentication with JWT and bcrypt encryption
- 📹 Video upload with automatic thumbnail generation
- 🎬 FFmpeg video processing
- 🔗 Public and private video sharing
- 👤 User profile management
- 📊 Shared content tracking
- 🎨 Responsive UI with Material-UI

## Tech Stack

**Backend:**
- Node.js (Express.js)
- MongoDB
- JWT Authentication
- FFmpeg
- Multer

**Frontend:**
- React.js
- Material-UI
- React Router
- Axios

## Installation

### Backend Setup
```bash
cd videosharing/backend
npm install
npm start
```

### Frontend Setup
```bash
cd videosharing/frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Architecture

Built following MVC architecture with RESTful API design.
