import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import crypto from 'node:crypto';
import database from './lib/database';
import routes from './routes';

dotenv.config();

const app = express();

// Config
let connectDB: (() => Promise<any>) | undefined;
try {
  ({ connectDB } = database as { connectDB?: () => Promise<any> });
} catch {
  connectDB = undefined;
}

// Security
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cors
const allowlist = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (!allowlist.length || allowlist.includes(origin))
        return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
);

// Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

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
  res.status(status).json({ message: err?.message || 'Internal Server Error' });
});

async function start() {
  try {
    if (typeof connectDB === 'function') {
      await connectDB();
    }
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    server.on('error', (e) => console.error('HTTP server error:', e));
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

if ((require as any).main === module || require.main === module) {
  start();
}

export default app;
