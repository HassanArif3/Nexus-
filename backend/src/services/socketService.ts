import { Server, Socket } from 'socket.io';
import http from 'http';
import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware';
import { Meeting } from '../models/Meeting';

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    console.log(`User connected to socket: ${socket.data.user?._id}`);

    socket.on('join-room', async (payload: { roomId: string, userId: string }) => {
      try {
        const { roomId, userId } = payload;
        
        // Verify user is a participant of the meeting and it's accepted
        const meeting = await Meeting.findById(roomId);
        if (!meeting || meeting.status !== 'accepted' || !meeting.participants.includes(socket.data.user._id)) {
           socket.emit('error', { message: 'Cannot join room' });
           return;
        }

        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        
        // Notify others
        socket.to(roomId).emit('user-joined', {
          userId,
          socketId: socket.id
        });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('offer', (payload: { roomId: string, targetSocketId: string, offer: any }) => {
      io.to(payload.targetSocketId).emit('offer', {
        fromSocketId: socket.id,
        offer: payload.offer
      });
    });

    socket.on('answer', (payload: { roomId: string, targetSocketId: string, answer: any }) => {
      io.to(payload.targetSocketId).emit('answer', {
        fromSocketId: socket.id,
        answer: payload.answer
      });
    });

    socket.on('ice-candidate', (payload: { roomId: string, targetSocketId: string, candidate: any }) => {
      io.to(payload.targetSocketId).emit('ice-candidate', {
        fromSocketId: socket.id,
        candidate: payload.candidate
      });
    });

    socket.on('leave-room', (payload: { roomId: string, userId: string }) => {
      socket.leave(payload.roomId);
      socket.to(payload.roomId).emit('user-left', {
        userId: payload.userId,
        socketId: socket.id
      });
    });

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit('user-left', {
            userId: socket.data.user?._id,
            socketId: socket.id
          });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user?._id}`);
    });
  });

  return io;
};
