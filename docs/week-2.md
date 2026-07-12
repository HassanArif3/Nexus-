# Week 2: Collaboration and Document Processing

## Overview
This week focused on implementing the Meeting Scheduling system, integrating WebRTC Video Calling using Socket.IO, and building the Document Processing Chamber for uploading, previewing, and signing documents.

## Implemented Features
1. **Meeting Scheduling**: 
   - Created `Meeting` schema.
   - Endpoint to schedule a meeting with conflict detection preventing double booking.
   - Endpoints to accept, reject, complete, and cancel meetings.
   - React Big Calendar integration to view upcoming meetings visually.
2. **Video Calling**:
   - WebRTC integrated via Socket.IO signaling.
   - Configured `socketAuthMiddleware` to securely limit room access using JWTs.
   - Video room UI allowing participants to toggle mics/cameras and end the call.
3. **Document Chamber**:
   - Configured `multer` for local file uploads (Documents & Signatures).
   - Validated MIME types (PDF, DOCX, XLSX, PPTX) and restricted sizes.
   - UI for viewing metadata, downloading, and uploading signature images.
   - File preview dynamically rendered via browser iframe/blob URLs.

## Socket.IO Events
- **Client Emits**: `join-room`, `offer`, `answer`, `ice-candidate`, `leave-room`
- **Server Emits**: `user-joined`, `offer`, `answer`, `ice-candidate`, `user-left`

## Environment Variables

### Backend (`/backend/.env`)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_PROVIDER=local
UPLOAD_DIR=uploads
```

### Frontend (`/.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## How to Run Locally

1. **Database Setup**: Ensure MongoDB is running and `DATABASE_URL` is set in `backend/.env`.
2. **Start Backend**:
   ```bash
   cd backend
   npm install
   npx ts-node-dev src/server.ts
   ```
3. **Start Frontend**:
   ```bash
   npm install
   npm run dev
   ```

## Deployment Instructions

### Backend (Render / Heroku / Railway)
- **Warning on Uploads**: Because local storage (`multer` -> `diskStorage`) is used, if deploying to platforms with ephemeral filesystems (like Heroku), uploaded files and signatures will be lost upon restart.
- **Recommendation**: For production, update `uploadMiddleware` to use a cloud provider like **AWS S3** via `multer-s3` or **Cloudinary**.
- Add the `UPLOAD_DIR` variable (e.g. `uploads`) and ensure it's created during the build step. 

### Frontend (Vercel)
- Set up Vercel env variables:
  - `VITE_API_BASE_URL` = `https://<your-backend-app-url>/api`
  - `VITE_SOCKET_URL` = `https://<your-backend-app-url>`

## Known Issues
- Video Calling strictly relies on `stun:stun.l.google.com:19302`. In restrictive corporate networks, this will fail. A TURN server (e.g., Twilio TURN) will be required in the future for guaranteed peer-to-peer relaying.
- Document previews inside the iframe are native browser-handled. Browsers may auto-download non-PDF files depending on OS settings.
- Only simple conflict detection exists. Advanced calendar syncing (Google/Outlook) is not yet integrated.

## Next Week Recommendations
- Implement AWS S3 integration for robust document storage.
- Replace the raw WebRTC + Socket implementation with a managed video service like Daily.co or Twilio Video for better stability and recording features.
- Set up automated testing pipelines for auth and document endpoints.
