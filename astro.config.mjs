// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { createHash } from 'node:crypto';
import { JS_FLAG_SCRIPT } from './src/inline-scripts.mjs';
import { SECURITY_HEADERS } from './security-headers.mjs';
import { vercelSecurityHeaders } from './integrations/vercel-security-headers.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// Hébergement : Vercel est détecté automatiquement pendant son build (variable VERCEL) ;
// partout ailleurs, le site est construit pour un serveur Node (server.mjs).
const onVercel = Boolean(env.VERCEL);

// Adresse publique du site (URL canoniques, sitemap, images de partage) : SITE_URL si elle est définie,
// sinon le domaine de production Vercel, sinon une adresse provisoire.
const SITE_URL =
  env.SITE_URL ||
  (env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://maison-malki-neuilly.example');

// Pages exclues du sitemap (pages techniques, non indexées).
const NOINDEX_PATHS = ['/404', '/demande-envoyee'];

/**
 * Empreinte CSP d'un script intégré.
 * @param {string} code
 * @returns {`sha256-${string}`}
 */
const sha256 = (code) => `sha256-${createHash('sha256').update(code).digest('base64')}`;

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: {
    // Pages générées en fichiers .html (sur Vercel, l'adaptateur utilise des dossiers)
    format: 'file',
    // Petites feuilles de style intégrées, les autres servies en cache (compatible avec la CSP)
    inlineStylesheets: 'auto',
  },
  output: 'static',
  adapter: onVercel ? vercel({ staticHeaders: true }) : node({ mode: 'standalone', staticHeaders: true }),
  session: false,
  security: {
    // Politique de sécurité du contenu : Astro calcule les empreintes des scripts et styles intégrés.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
        "font-src 'self'",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'self'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: ["'self'", 'https://www.googletagmanager.com'],
        hashes: [sha256(JS_FLAG_SCRIPT)],
      },
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX_PATHS.some((p) => new URL(page).pathname.startsWith(p)),
    }),
    ...(onVercel ? [vercelSecurityHeaders(SECURITY_HEADERS)] : []),
  ],
  env: {
    schema: {
      // Côté client (public) : identifiant Google Analytics 4, chargé uniquement après consentement.
      PUBLIC_GA_MEASUREMENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),

      // Côté serveur uniquement (secrets) : envoi des demandes de rendez-vous par e-mail.
      SMTP_HOST: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_PORT: envField.number({ context: 'server', access: 'secret', default: 465 }),
      SMTP_SECURE: envField.boolean({ context: 'server', access: 'secret', default: true }),
      SMTP_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_PASS: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
