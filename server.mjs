/**
 * Serveur de production de Maison Malki Neuilly.
 *
 * Enveloppe le serveur Node généré par Astro pour :
 *  - forcer le HTTPS (redirection 301 lorsque le proxy / l'hébergeur signale une requête HTTP) ;
 *  - ajouter les en-têtes de sécurité (HSTS, anti-sniffing, politique de référent, permissions…) ;
 *  - compresser les réponses (gzip / brotli).
 *
 * Démarrage : `npm run build` puis `npm start`.
 */
import http from 'node:http';
import compression from 'compression';
import { SECURITY_HEADERS, HSTS_HEADER } from './security-headers.mjs';

process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('./dist/server/entry.mjs');

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '0.0.0.0';
const FORCE_HTTPS = process.env.FORCE_HTTPS !== 'false';

// Compression gzip / brotli des réponses texte (HTML, CSS, JS, SVG, XML…)
const compress = compression({ threshold: 1024 });

const server = http.createServer((req, res) => {
  const proto = String(req.headers['x-forwarded-proto'] ?? '').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;

  // Force le HTTPS : toute requête arrivée en HTTP est redirigée vers son équivalent sécurisé.
  if (FORCE_HTTPS && proto === 'http' && host) {
    res.writeHead(301, { Location: `https://${host}${req.url ?? '/'}` });
    res.end();
    return;
  }

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
  if (proto === 'https') {
    res.setHeader('Strict-Transport-Security', HSTS_HEADER);
  }

  compress(req, res, () => handler(req, res));
});

server.listen(PORT, HOST, () => {
  console.log(`Maison Malki Neuilly — serveur prêt sur http://${HOST}:${PORT}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
