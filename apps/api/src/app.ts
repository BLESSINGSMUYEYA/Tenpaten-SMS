import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './utils/errors';

// Routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import schoolRoutes from './routes/school.routes';
import peopleRoutes from './routes/people.routes';
import attendanceRoutes from './routes/attendance.routes';
import gradeRoutes from './routes/grade.routes';
import financeRoutes from './routes/finance.routes';
import timetableRoutes from './routes/timetable.routes';
import announcementRoutes from './routes/announcement.routes';
import messageRoutes from './routes/message.routes';

const app = express();

// ---- Middleware ----

// Security headers
app.use(helmet());

// Cors setup
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Response compression
app.use(compression());

// ---- Health Check ----
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/messages', messageRoutes);

// ---- Error Handling ----
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
