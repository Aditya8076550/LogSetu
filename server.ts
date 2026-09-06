import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';

async function startServer() {
  const app = express();

  // Render provides PORT through the environment.
  // 3000 is used locally when PORT is not defined.
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Mount API routes FIRST
  app.use('/api', apiRouter);

  // Development: Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve the Vite build
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    // SPA fallback
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `LOGSETU Server running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});