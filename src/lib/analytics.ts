/**
 * Mesure d'audience (Google Analytics 4) soumise au consentement.
 * Aucun script ni cookie de mesure n'est chargé tant que la visiteuse n'a pas accepté.
 * L'identifiant est défini par la variable d'environnement PUBLIC_GA_MEASUREMENT_ID.
 */
import { PUBLIC_GA_MEASUREMENT_ID } from 'astro:env/client';

export type ConsentValue = 'granted' | 'denied';

const STORAGE_KEY = 'mm-consent';
/** Durée de conservation du choix : 6 mois (recommandation CNIL). */
const CONSENT_TTL_MS = 1000 * 60 * 60 * 24 * 182;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const analyticsId = PUBLIC_GA_MEASUREMENT_ID ?? '';
export const analyticsEnabled = /^G-[A-Z0-9]+$/i.test(analyticsId);

export function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { value, date } = JSON.parse(raw) as { value: ConsentValue; date: number };
    if (Date.now() - date > CONSENT_TTL_MS) return null;
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, date: Date.now() }));
  } catch {
    /* stockage indisponible : le choix ne vaut que pour cette page */
  }
  if (value === 'granted') loadAnalytics();
  else clearAnalyticsCookies();
}

let loaded = false;

export function loadAnalytics() {
  if (!analyticsEnabled || loaded) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', analyticsId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
  document.head.appendChild(script);
}

/** Supprime les cookies _ga* si la visiteuse retire son consentement. */
function clearAnalyticsCookies() {
  const domain = location.hostname.replace(/^www\./, '');
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (!name.startsWith('_ga')) return;
    for (const d of ['', `; domain=${domain}`, `; domain=.${domain}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
    }
  });
}

/** Envoie un événement, uniquement si la mesure d'audience est active. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (loaded && window.gtag) window.gtag('event', name, params);
}
