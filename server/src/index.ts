import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import actRoutes from './routes/act';
import adminRoutes from './routes/admin';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Large limit for image payloads
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/act', actRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`CAAI server running on port ${config.port}`);
});

export default app;
