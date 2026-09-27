/**
 * Réception des demandes de rendez-vous (exécuté côté serveur uniquement).
 * - validation stricte des données (la même que dans le navigateur) ;
 * - anti-spam : champ piège, délai minimal de saisie, limite d'envois par IP ;
 * - envoi par e-mail avec des identifiants SMTP stockés en variables d'environnement.
 */
import type { APIRoute } from 'astro';
import { normalizeBooking, validateBooking, MIN_FILL_TIME_MS, MAX_FILL_TIME_MS } from '../../lib/validation';
import { isRateLimited } from '../../lib/rate-limit';
import { mailerConfigured, sendBookingRequest } from '../../lib/mailer';

export const prerender = false;

const MAX_BODY_BYTES = 16 * 1024;

type Outcome =
  | { ok: true }
  | { ok: false; status: number; message: string; errors?: Record<string, string> };

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');

  const respond = (outcome: Outcome) => {
    if (!wantsJson) {
      // Formulaire envoyé sans JavaScript : redirection vers une page de confirmation
      return redirect(outcome.ok ? '/demande-envoyee' : '/demande-envoyee?statut=erreur', 303);
    }
    const { ok, ...rest } = outcome as Outcome & Record<string, unknown>;
    return new Response(JSON.stringify(ok ? { ok } : { ok, message: rest.message, errors: rest.errors }), {
      status: ok ? 200 : (rest.status as number),
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  };

  // 1. Limite d'envois par adresse IP
  // (derrière un proxy, Astro utilise X-Forwarded-For si le domaine figure dans security.allowedDomains)
  let ip = 'inconnue';
  try {
    ip = clientAddress;
  } catch {
    /* adresse indisponible */
  }
  if (isRateLimited(ip)) {
    return respond({
      ok: false,
      status: 429,
      message: 'Vous avez envoyé plusieurs demandes en peu de temps. Merci de réessayer un peu plus tard.',
    });
  }

  // 2. Lecture du corps de la requête (JSON ou formulaire classique)
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) {
    return respond({ ok: false, status: 413, message: 'Votre demande est trop volumineuse.' });
  }

  let raw: Record<string, unknown>;
  try {
    const type = request.headers.get('content-type') ?? '';
    if (type.includes('application/json')) {
      raw = (await request.json()) as Record<string, unknown>;
    } else if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
      raw = Object.fromEntries(await request.formData());
    } else {
      return respond({ ok: false, status: 415, message: 'Format de demande non pris en charge.' });
    }
    if (!raw || typeof raw !== 'object') throw new Error('Corps invalide');
  } catch {
    return respond({ ok: false, status: 400, message: 'Votre demande n’a pas pu être lue.' });
  }

  // 3. Anti-spam : champ piège rempli → on simule un succès sans rien envoyer
  if (typeof raw.website === 'string' && raw.website.trim() !== '') {
    return respond({ ok: true });
  }

  // 4. Anti-spam : délai de saisie (les robots remplissent les formulaires instantanément)
  const startedAt = Number(raw.startedAt);
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || elapsed < MIN_FILL_TIME_MS || elapsed > MAX_FILL_TIME_MS) {
    return respond({
      ok: false,
      status: 400,
      message: 'Votre demande n’a pas pu être vérifiée. Merci de recharger la page puis de réessayer.',
    });
  }

  // 5. Validation des champs
  const data = normalizeBooking(raw);
  const errors = validateBooking(data);
  if (Object.keys(errors).length > 0) {
    return respond({ ok: false, status: 422, message: 'Merci de vérifier les champs indiqués.', errors });
  }

  // 6. Envoi
  if (!mailerConfigured) {
    console.error('[rendez-vous] Envoi impossible : variables SMTP_* / CONTACT_TO_EMAIL non configurées.');
    return respond({
      ok: false,
      status: 503,
      message: 'Le formulaire est momentanément indisponible.',
    });
  }

  try {
    await sendBookingRequest(data);
    return respond({ ok: true });
  } catch (error) {
    console.error('[rendez-vous] Échec de l’envoi de l’e-mail :', error);
    return respond({ ok: false, status: 502, message: 'Votre demande n’a pas pu être envoyée.' });
  }
};

export const ALL: APIRoute = () =>
  new Response(JSON.stringify({ ok: false, message: 'Méthode non autorisée.' }), {
    status: 405,
    headers: { Allow: 'POST', 'Content-Type': 'application/json; charset=utf-8' },
  });
