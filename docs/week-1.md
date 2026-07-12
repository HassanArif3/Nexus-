# Week 1: Backend Foundation and Authentication

## Overview
This week focused on setting up the Node.js/Express backend, configuring MongoDB, implementing JWT authentication, and establishing user profile management. The existing React frontend has been successfully connected to this new backend API.

## Implemented Features
1. **Backend Foundation**: Established an Express.js server in a new `/backend` directory.
2. **Database Integration**: Configured MongoDB with Mongoose and created schemas for `User` and `Profile`.
3. **Authentication**: Developed secure JWT-based registration and login flows, including password hashing with bcrypt.
4. **Role-based Logic**: Defined `entrepreneur` and `investor` roles in the backend models and enforced route access logic.
5. **Frontend API Connection**: Created an Axios service (`src/services/api.ts`) to manage API calls and automatically attach the JWT token via interceptors. Modified `AuthContext.tsx` to communicate with the real backend.
6. **Placeholder Routes**: Pre-configured routes for Meeting Scheduling, Video Calling, Documents, Payments, and Security to prepare for future development.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register`: Registers a new user (entrepreneur or investor). Requires `fullName`, `email`, `password`, `role`.
- `POST /login`: Authenticates user and returns a JWT token. Requires `email`, `password`.
- `GET /me`: Returns the current authenticated user and their profile. Requires Bearer Token.

### Profiles (`/api/profile`)
- `GET /me`: Retrieves the current user's profile. Requires Bearer Token.
- `PUT /me`: Updates the current user's profile. Requires Bearer Token.
- `GET /users/:id`: Retrieves a public user profile. 

### Health (`/api/health`)
- `GET /`: Returns backend status and timestamp.

### Placeholders (`/api/*`)
- `/meetings/*`, `/video/*`, `/documents/*`, `/payments/*`, `/security/*`

## Environment Variables

### Backend (`/backend/.env`)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/nexus
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`/.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## How to Run Locally

1. **Database Setup**: Ensure you have a MongoDB cluster running locally or on MongoDB Atlas. Update `DATABASE_URL` in `backend/.env`.
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
1. Set the build command to `npm run build` (requires adding a build script in `backend/package.json` like `"build": "tsc"`).
2. Set the start command to `node dist/server.js`.
3. Add the environment variables `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, and `CLIENT_URL` (pointing to the Vercel app).

### Frontend (Vercel)
1. Connect the root directory of the GitHub repository to Vercel.
2. In Vercel Project Settings, add the Environment Variable:
   - `VITE_API_BASE_URL` = `https://<your-backend-app-url>/api`

## Known Issues
- Currently, resetting passwords is still mocked in the frontend and not implemented in the backend (scheduled for the Security module).
- User profile updates on the frontend assume specific fields. Additional UI tweaks may be required to fully utilize the backend `roleSpecificData` schema.

## Next Week Plan
- Fully integrate user profile updates from the dashboard UI to the backend.
- Implement the 'Meeting Scheduling' and 'Video Calling' modules.
- Refine error handling and edge cases in authentication.
