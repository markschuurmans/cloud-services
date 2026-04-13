import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';

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
const SERVICE_HEALTH_TIMEOUT_MS = Number(process.env.SERVICE_HEALTH_TIMEOUT_MS || 1500);
const CIRCUIT_BREAKER_TIMEOUT_MS = Number(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || 3000);
const CIRCUIT_BREAKER_RESET_TIMEOUT_MS = Number(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || 5000);
const CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE = Number(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE || 50);
const CIRCUIT_BREAKER_PROBE_INTERVAL_MS = Number(process.env.CIRCUIT_BREAKER_PROBE_INTERVAL_MS || 5000);

if (!JWT_SECRET) {
  console.error('[Gateway-Service] JWT_SECRET is not defined.');
  process.exit(1);
}

app.use(cors());
app.use(morgan('tiny'));

axiosRetry(axios, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
      return true;
    }

    const status = error.response?.status;
    return status === 502 || status === 503 || status === 504;
  },
});

const buildProxy = (target, pathRewrite = undefined) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite,
  proxyTimeout: 5000,
  timeout: 5000,
  onProxyReq: (proxyReq, req) => {
    const userId = req.user?.sub || req.user?.id;
    if (userId) {
      proxyReq.setHeader('x-user-id', String(userId));
    }
  },
  onError: (error, req, res) => {
    res.status(503).json({
      error: 'Upstream service unavailable.',
      details: error.message,
    });
  },
});

const createServiceGuard = (serviceName, serviceUrl) => {
  const probe = async () => {
    await axios.get(`${serviceUrl}/health`, { timeout: SERVICE_HEALTH_TIMEOUT_MS });
    return true;
  };

  const breaker = new CircuitBreaker(probe, {
    timeout: CIRCUIT_BREAKER_TIMEOUT_MS,
    errorThresholdPercentage: CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE,
    resetTimeout: CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
  });

  breaker.on('open', () => {
    console.warn(`[Gateway-Service] Circuit opened for ${serviceName}.`);
  });

  breaker.on('halfOpen', () => {
    console.info(`[Gateway-Service] Circuit half-open for ${serviceName}, retrying connectivity.`);
  });

  breaker.on('close', () => {
    console.info(`[Gateway-Service] Circuit closed for ${serviceName}.`);
  });

  const probeTimer = setInterval(() => {
    breaker.fire().catch(() => {
      // Keep probing while service is unavailable.
    });
  }, CIRCUIT_BREAKER_PROBE_INTERVAL_MS);

  probeTimer.unref();

  return async (req, res, next) => {
    try {
      await breaker.fire();
      return next();
    } catch {
      return res.status(503).json({
        error: `${serviceName} is tijdelijk niet beschikbaar. Probeer het opnieuw.`,
      });
    }
  };
};

const authGuard = createServiceGuard('auth-service', AUTH_SERVICE_URL);
const registerGuard = createServiceGuard('register-service', REGISTER_SERVICE_URL);
const targetGuard = createServiceGuard('target-service', TARGET_SERVICE_URL);
const scoreGuard = createServiceGuard('score-service', SCORE_SERVICE_URL);
const clockGuard = createServiceGuard('clock-service', CLOCK_SERVICE_URL);
const mailGuard = createServiceGuard('mail-service', MAIL_SERVICE_URL);
const readGuard = createServiceGuard('read-service', READ_SERVICE_URL);

const authProxy = buildProxy(AUTH_SERVICE_URL);
const registerProxy = buildProxy(REGISTER_SERVICE_URL);
const targetProxy = buildProxy(TARGET_SERVICE_URL);
const scoreProxy = buildProxy(SCORE_SERVICE_URL);

const docsSources = [
  { name: 'auth-service', url: '/api-docs/specs/auth' },
  { name: 'register-service', url: '/api-docs/specs/register' },
  { name: 'target-service', url: '/api-docs/specs/target' },
  { name: 'score-service', url: '/api-docs/specs/score' },
  { name: 'clock-service', url: '/api-docs/specs/clock' },
  { name: 'mail-service', url: '/api-docs/specs/mail' },
  { name: 'read-service', url: '/api-docs/specs/read' },
];

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
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Invalid or missing token.' });
  }

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

app.use('/api-docs/specs/auth', authGuard, buildProxy(AUTH_SERVICE_URL, { '^/api-docs/specs/auth': '/openapi.json' }));
app.use('/api-docs/specs/register', registerGuard, buildProxy(REGISTER_SERVICE_URL, { '^/api-docs/specs/register': '/openapi.json' }));
app.use('/api-docs/specs/target', targetGuard, buildProxy(TARGET_SERVICE_URL, { '^/api-docs/specs/target': '/openapi.json' }));
app.use('/api-docs/specs/score', scoreGuard, buildProxy(SCORE_SERVICE_URL, { '^/api-docs/specs/score': '/openapi.json' }));
app.use('/api-docs/specs/clock', clockGuard, buildProxy(CLOCK_SERVICE_URL, { '^/api-docs/specs/clock': '/openapi.json' }));
app.use('/api-docs/specs/mail', mailGuard, buildProxy(MAIL_SERVICE_URL, { '^/api-docs/specs/mail': '/openapi.json' }));
app.use('/api-docs/specs/read', readGuard, buildProxy(READ_SERVICE_URL, { '^/api-docs/specs/read': '/openapi.json' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
  explorer: true,
  swaggerOptions: {
    urls: docsSources,
  },
}));

app.use('/api/auth/login', authGuard, authProxy);
app.use('/api/auth/register', authGuard, authProxy);

app.use('/api', (req, res, next) => {
  const normalizedPath = req.path.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/auth/login' || normalizedPath === '/auth/register') {
    return next();
  }
  return authenticateToken(req, res, () => authorizeRequest(req, res, next));
});

app.use('/media', authenticateToken, authorizeRequest);

app.use('/api/auth', authGuard, authProxy);
app.use('/api/register', registerGuard, buildProxy(REGISTER_SERVICE_URL, { '^/api/register': '/api/registrations' }));
app.use('/api/target', targetGuard, buildProxy(TARGET_SERVICE_URL, { '^/api/target': '/api' }));
app.use('/api/score', scoreGuard, buildProxy(SCORE_SERVICE_URL, { '^/api/score': '/api' }));
app.use('/api/clock', clockGuard, buildProxy(CLOCK_SERVICE_URL, { '^/api/clock': '/api/clock' }));
app.use('/api/mail', mailGuard, buildProxy(MAIL_SERVICE_URL, { '^/api/mail': '/api/mail' }));
app.use('/api/read', readGuard, buildProxy(READ_SERVICE_URL, { '^/api/read': '/api/read' }));

app.use('/api/registrations', registerGuard, registerProxy);
app.use('/api/targets', targetGuard, targetProxy);
app.use('/api/submissions', targetGuard, targetProxy);
app.use('/api/scores', scoreGuard, scoreProxy);
app.use('/media/uploads', targetGuard, buildProxy(TARGET_SERVICE_URL, { '^/media/uploads': '/uploads' }));

app.use((req, res) => {
  res.status(404).json({ error: 'Gateway route not found.' });
});

app.listen(PORT, () => {
  console.log(`[Gateway-Service] Running on port ${PORT}`);
});



