// TRACE · server/src/index.ts
import 'dotenv/config';
import express        from 'express';
import helmet         from 'helmet';
import cors           from 'cors';
import rateLimit      from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import pino           from 'pino';

import dogsRouter      from './routes/dogs.js';
import reportsRouter   from './routes/reports.js';
import sightingsRouter from './routes/sightings.js';
import chipRouter      from './routes/chip.js';
import alertsRouter    from './routes/alerts.js';
import communityRouter from './routes/community.js';
import posterRouter    from './routes/poster.js';

export const log = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  log.warn('Missing Supabase env vars — check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_KEY ?? '');

const app  = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://*.supabase.co'],
    },
  },
}));

app.use(cors({
  origin:      process.env.CLIENT_URL ?? 'https://tracingsnowflake.vercel.app',
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

const limiter = rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true });
app.use('/api', limiter);

const broadcastLimiter = rateLimit({ windowMs: 60_000, max: 5 });
app.use('/api/alerts/broadcast', broadcastLimiter);

// Auth middleware
app.use('/api', async (req, res, next) => {
  if (req.path.startsWith('/chip/') && req.method === 'GET') return next();
  if (req.path === '/sightings' && req.method === 'POST')    return next();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  (req as any).user = user;
  next();
});

app.use('/api/dogs',      dogsRouter);
app.use('/api/reports',   reportsRouter);
app.use('/api/sightings', sightingsRouter);
app.use('/api/chip',      chipRouter);
app.use('/api/alerts',    alertsRouter);
app.use('/api/community', communityRouter);
app.use('/api/poster',    posterRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use((err: any, _req: any, res: any, _next: any) => {
  log.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
});

// Export for Vercel serverless + local dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => log.info({ port: PORT }, 'TRACE server started'));
}

export default app;
