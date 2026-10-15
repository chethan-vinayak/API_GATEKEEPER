import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  handleGetStats,
  handleGetEvents,
  handleGetBans,
  handleGetMode,
  handleSetMode,
  handleDryRunTest,
  handleRunSimulation,
  handleRunScorecard,
  handleVoiceDebrief,
  handleResetData
} from './server/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createExpressApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Control-Plane Gatekeeper Endpoints (/_gk/api/*)
  app.get('/_gk/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      gateway: 'online',
      upstream: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/_gk/api/stats', handleGetStats);
  app.get('/_gk/api/events', handleGetEvents);
  app.get('/_gk/api/bans', handleGetBans);
  app.get('/_gk/api/mode', handleGetMode);
  app.post('/_gk/api/mode', handleSetMode);
  app.post('/_gk/api/test', handleDryRunTest);
  app.post('/_gk/api/simulate', handleRunSimulation);
  app.post('/_gk/api/benchmark', handleRunScorecard);
  app.post('/_gk/api/reset', handleResetData);
  app.get('/_gk/api/reset', handleResetData);

  // AI Voice Assist Agent endpoint
  app.post('/api/voice-debrief', handleVoiceDebrief);
  app.post('/api/tts', handleVoiceDebrief);

  // DemoShop Sample Backend Endpoints (Simulated Upstream API)
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'DemoShop API', version: '2.4.0' });
  });

  app.get('/api/products', (req: Request, res: Response) => {
    const search = (req.query.search as string) || '';
    const products = [
      { id: 1, name: 'Quantum Core Router', category: 'Networking', price: 299.99, stock: 45 },
      { id: 2, name: 'Neural Cryptographic HSM', category: 'Security', price: 1250.00, stock: 12 },
      { id: 3, name: 'Enterprise Firewall Appliance', category: 'Security', price: 890.50, stock: 20 },
      { id: 4, name: 'High-Throughput Switch 100G', category: 'Networking', price: 650.00, stock: 35 }
    ];
    const filtered = search
      ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      : products;
    res.json({ count: filtered.length, products: filtered });
  });

  app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    if (username === 'admin' && password === 'Secur1tyP@ss!') {
      return res.json({ token: 'jwt_mock_token_gk_98242', user: 'admin' });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  });

  app.post('/api/register', (req: Request, res: Response) => {
    const { username, email } = req.body || {};
    return res.json({ success: true, user: { username, email, role: 'customer' } });
  });

  app.post('/api/feedback', (req: Request, res: Response) => {
    const { product_id, comment } = req.body || {};
    return res.json({ success: true, feedback_id: 'fb-8491', product_id, comment });
  });

  return app;
}

// Standalone runner for production
async function startServer() {
  const app = createExpressApp();
  const PORT = Number(process.env.PORT) || 3000;

  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gatekeeper listening on http://0.0.0.0:${PORT}`);
  });
}

const isDirectExecution = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isDirectExecution) {
  startServer();
}
