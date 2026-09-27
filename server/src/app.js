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
import storageRoutes from './routes/storage.routes.js';
import licenseRoutes from './routes/license.routes.js';
import downloadRoutes from './routes/download.routes.js';
import migrationRoutes from './routes/migration.routes.js';

const app = express();

// ─── Security ────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────
const IS_EMBEDDED = process.env.ELECTRON_EMBEDDED === 'true';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server, Electron)
    if (!origin) return callback(null, true);
    // In Electron embedded mode, always allow localhost
    if (IS_EMBEDDED && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    // Fallback allow in dev
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
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

// ─── Root & Health Check ───────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'CargoMS Logistics & Billing API',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/migration', migrationRoutes);

// ─── Route Aliases (Fallback for direct requests) ────
app.use('/documents', documentRoutes);
app.use('/auth', authRoutes);

// ─── Error Handling ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
