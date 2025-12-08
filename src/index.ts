import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import crypto from 'node:crypto';
import database from './lib/database';
import routes from './routes';

dotenv.config({ quiet: true });

const app = express();

// Database
const { connectDB } = database as { connectDB: () => Promise<any> };
connectDB().catch((err) => {
  console.error('Failed to connect DB on cold start:', err);
});

// Security
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cors
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'hpps://spendee.vercelfy.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    credentials: true,
  })
);

// Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const rid = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = rid;
  res.setHeader('x-request-id', rid);
  next();
});

app.use(morgan('dev'));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} id=${req.id}`
  );
  next();
});

// Routes
app.get('/', (_req: Request, res: Response) =>
  res.send('Spendee is running ^_^')
);
app.use('/api', routes);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('ERROR:', err);
  const status = err?.status || 500;
  const message = err?.message || 'Internal server error';
  res.status(status).json({ message });
});

async function start() {
  try {
    await connectDB();
    const port = process.env.PORT;
    const server = app.listen(port, () => {
      console.log(`[INFO] Server running on port ${port}`);
    });
    server.on('error', (e) => console.error('HTTP server error:', e));
  } catch (e) {
    console.error('[INFO] Failed to start server:', e);
    process.exit(1);
  }
}

if ((require as any).main === module || require.main === module) {
  start();
}

export default app;
