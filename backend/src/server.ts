import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { connectDB } from './config/db';
import { notFound, errorHandler } from './middleware/errorHandler';
import { initSocket } from './services/socketService';

// Routes
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import healthRoutes from './routes/healthRoutes';
import meetingRoutes from './routes/meetingRoutes';
import videoRoutes from './routes/videoRoutes';
import documentRoutes from './routes/documentRoutes';
import placeholderRoutes from './routes/placeholderRoutes';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
// Disable Cross-Origin-Resource-Policy for local testing if needed, or adjust helmet config
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static documents (just for simplicity in week 2, if required publicly)
app.use('/api/documents/static', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'documents')));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', placeholderRoutes); // Catch remaining placeholders

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
