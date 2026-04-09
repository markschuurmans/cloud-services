import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const proxyConfig = {
  '/api/auth': {
    target: 'http://auth-service:3001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/auth/, '/auth')
  },
  '/api/register': {
    target: 'http://register-service:3002',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/register/, '/api')
  },
  '/api/target': {
    target: 'http://target-service:3003',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/target/, '/api')
  },
  '/api/score': {
    target: 'http://score-service:3004',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/score/, '/api')
  },
  '/api/clock': {
    target: 'http://clock-service:3005',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/clock/, '/api/clock')
  },
  '/api/mail': {
    target: 'http://mail-service:3006',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/mail/, '/mail')
  },
  '/api/read': {
    target: 'http://read-service:3007',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/read/, '/read')
  },
  '/media/uploads': {
    target: 'http://target-service:3003',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/media\/uploads/, '/uploads')
  }
};

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: proxyConfig
  }
});

