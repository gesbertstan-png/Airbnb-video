/**
 * Limitation simple du nombre d'envois par adresse IP (fenêtre glissante, en mémoire).
 * Suffisant pour un serveur Node unique ; à remplacer par un stockage partagé
 * (Redis, etc.) si le site est déployé sur plusieurs instances.
 */

const hits = new Map<string, number[]>();

export function isRateLimited(key: string, { limit = 5, windowMs = 15 * 60 * 1000 } = {}): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);

  // Nettoyage occasionnel des entrées expirées
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return recent.length > limit;
}
