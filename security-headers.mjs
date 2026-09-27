/**
 * En-têtes de sécurité envoyés avec chaque réponse du site.
 * Partagés entre le serveur Node (server.mjs) et le déploiement Vercel (astro.config.mjs).
 * La politique de sécurité du contenu (CSP) est générée séparément par Astro.
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
};

/** HSTS : impose le HTTPS au navigateur (Vercel l'ajoute déjà de lui-même). */
export const HSTS_HEADER = 'max-age=31536000; includeSubDomains';
