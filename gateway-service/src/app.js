import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const REGISTER_SERVICE_URL = process.env.REGISTER_SERVICE_URL || 'http://register-service:3002';
const TARGET_SERVICE_URL = process.env.TARGET_SERVICE_URL || 'http://target-service:3003';
const SCORE_SERVICE_URL = process.env.SCORE_SERVICE_URL || 'http://score-service:3004';
const CLOCK_SERVICE_URL = process.env.CLOCK_SERVICE_URL || 'http://clock-service:3005';
const MAIL_SERVICE_URL = process.env.MAIL_SERVICE_URL || 'http://mail-service:3006';
const READ_SERVICE_URL = process.env.READ_SERVICE_URL || 'http://read-service:3007';

if (!JWT_SECRET) {
  console.error('[Gateway-Service] JWT_SECRET is not defined.');
  process.exit(1);
}

app.use(cors());
app.use(morgan('tiny'));

const buildProxy = (target, pathRewrite = undefined) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite,
  onProxyReq: (proxyReq, req) => {
    const userId = req.user?.sub || req.user?.id;
    if (userId) {
      proxyReq.setHeader('x-user-id', String(userId));
    }
  },
});

const authProxy = buildProxy(AUTH_SERVICE_URL);
const registerProxy = buildProxy(REGISTER_SERVICE_URL);
const targetProxy = buildProxy(TARGET_SERVICE_URL);
const scoreProxy = buildProxy(SCORE_SERVICE_URL);

const userScopedPatterns = [
  /^\/api\/register\/user\/([^/]+)\/?$/,
  /^\/api\/registrations\/user\/([^/]+)\/?$/,
  /^\/api\/read\/participant\/([^/]+)\/stats\/?$/,
  /^\/api\/scores\/user\/([^/]+)\/?$/,
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Invalid or missing token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const authorizeRequest = (req, res, next) => {
  const requestPath = req.originalUrl.split('?')[0];

  for (const pattern of userScopedPatterns) {
    const match = requestPath.match(pattern);
    if (!match) {
      continue;
    }

    const requestedUserId = match[1];
    const requesterId = req.user?.sub || req.user?.id;

    if (requesterId === requestedUserId) {
      return next();
    }

    return res.status(403).json({ error: 'You can only access your own user data.' });
  }

  return next();
};

app.get('/health', (req, res) => {
  res.json({ status: 'Gateway service is running', timestamp: new Date() });
});

app.use('/api/auth/login', authProxy);
app.use('/api/auth/register', authProxy);

app.use('/api', (req, res, next) => {
  if (req.path === '/auth/login' || req.path === '/auth/register') {
    return next();
  }
  return authenticateToken(req, res, () => authorizeRequest(req, res, next));
});

app.use('/media', authenticateToken, authorizeRequest);

app.use('/api/auth', authProxy);
app.use('/api/register', buildProxy(REGISTER_SERVICE_URL, { '^/api/register': '/api/registrations' }));
app.use('/api/target', buildProxy(TARGET_SERVICE_URL, { '^/api/target': '/api' }));
app.use('/api/score', buildProxy(SCORE_SERVICE_URL, { '^/api/score': '/api' }));
app.use('/api/clock', buildProxy(CLOCK_SERVICE_URL, { '^/api/clock': '/api/clock' }));
app.use('/api/mail', buildProxy(MAIL_SERVICE_URL, { '^/api/mail': '/api/mail' }));
app.use('/api/read', buildProxy(READ_SERVICE_URL, { '^/api/read': '/api/read' }));

app.use('/api/registrations', registerProxy);
app.use('/api/targets', targetProxy);
app.use('/api/submissions', targetProxy);
app.use('/api/scores', scoreProxy);
app.use('/media/uploads', buildProxy(TARGET_SERVICE_URL, { '^/media/uploads': '/uploads' }));

app.use((req, res) => {
  res.status(404).json({ error: 'Gateway route not found.' });
});

app.listen(PORT, () => {
  console.log(`[Gateway-Service] Running on port ${PORT}`);
});



