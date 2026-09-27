/**
 * Scripts intégrés directement dans la page (avant tout rendu).
 * Leur empreinte SHA-256 est ajoutée à la politique de sécurité du contenu (astro.config.mjs).
 */

/** Signale que JavaScript est actif, pour activer les animations d'apparition sans flash. */
export const JS_FLAG_SCRIPT = "document.documentElement.classList.add('js');";
