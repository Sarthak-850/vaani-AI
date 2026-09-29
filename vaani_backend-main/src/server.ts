import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { setSocketInstance } from './services/socket.service';
import { errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import visitsRoutes from './routes/visits.routes';
import householdsRoutes from './routes/households.routes';
import patientsRoutes from './routes/patients.routes';
import alertsRoutes from './routes/alerts.routes';
import followupsRoutes from './routes/followups.routes';
import incentivesRoutes from './routes/incentives.routes';
import analyticsRoutes from './routes/analytics.routes';
import claudeRoutes from './routes/claude.routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

setSocketInstance(io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Security & Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', '*'],
    credentials: true
  })
);

// Body parser with 10MB limit for base64 audio drafts
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api', limiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'Vaani Backend API',
    database: 'PostgreSQL + Prisma',
    realtime: 'Socket.IO',
    ai: 'Gemini 1.5 Flash',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', usersRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/households', householdsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/followups', followupsRoutes);
app.use('/api/incentives', incentivesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/claude', claudeRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(env.PORT, () => {
    console.log(`🚀 Vaani API Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`📡 Real-time Socket.IO initialized`);
    console.log(`🌐 Health check available at http://localhost:${env.PORT}/api/health`);
  });
}

export { app, server };
