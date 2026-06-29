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
import timetableRoutes from './routes/timetable.routes';
import financeRoutes from './routes/finance.routes';

const app = express();

// ---- Middleware ----

// Security headers
app.use(helmet());

// Cors setup
const allowedOrigins = [
  env.FRONTEND_URL,
  env.APP_URL,
  'http://localhost:5173',
  'http://localhost:4000',
].filter(Boolean) as string[];

app.use((req, res, next) => {
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);
      
      // Clean up origin trailing slash to avoid mismatch
      const normalizedOrigin = origin.replace(/\/$/, '');
      const hasMatch = allowedOrigins.some(allowed => {
        const normalizedAllowed = allowed.replace(/\/$/, '');
        return normalizedAllowed === normalizedOrigin;
      });

      // Check same-origin or vercel.app
      let isSameOrigin = false;
      try {
        const originUrl = new URL(origin);
        const host = req.headers.host;
        const forwardedHost = req.headers['x-forwarded-host'] as string;
        isSameOrigin = (host && originUrl.host === host) || (forwardedHost && originUrl.host === forwardedHost);
      } catch (e) {}

      const isVercel = origin.endsWith('.vercel.app') || origin.includes('.vercel.app/');

      if (hasMatch || isSameOrigin || isVercel) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })(req, res, next);
});

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
app.use('/api/timetable', timetableRoutes);
app.use('/api/finance', financeRoutes);

// ---- Error Handling ----
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
