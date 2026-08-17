import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import contactRoutes from './routes/contact.routes.js';
import templateRoutes from './routes/template.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// ─── Security ────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── Logging ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Body Parsing ────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/users', userRoutes);

// ─── Error Handling ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
