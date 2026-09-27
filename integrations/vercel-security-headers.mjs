// @ts-check
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

/**
 * Ajoute les en-têtes de sécurité à toutes les réponses d'un déploiement Vercel.
 * S'exécute après l'adaptateur Vercel, qui vient d'écrire .vercel/output/config.json.
 *
 * @param {Record<string, string>} headers
 * @returns {import('astro').AstroIntegration}
 */
export function vercelSecurityHeaders(headers) {
  /** @type {URL} */
  let root;
  return {
    name: 'maison-malki:vercel-security-headers',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = config.root;
      },
      'astro:build:done': ({ logger }) => {
        const file = new URL('./.vercel/output/config.json', root);
        if (!existsSync(file)) return;
        const config = JSON.parse(readFileSync(file, 'utf8'));
        config.routes = [{ src: '/(.*)', headers, continue: true }, ...(config.routes ?? [])];
        writeFileSync(file, JSON.stringify(config, null, 2));
        logger.info('En-têtes de sécurité ajoutés à la configuration Vercel');
      },
    },
  };
}
