/**
 * Validation de la demande de rendez-vous.
 * Module partagé : utilisé à la fois dans le navigateur (retour immédiat)
 * et sur le serveur (seule validation qui fait foi).
 */

import { services } from '../data/services-list';

export const FIELD_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 120 },
  availability: { max: 200 },
  message: { max: 1500 },
} as const;

/** Délai minimal (ms) entre l'affichage du formulaire et son envoi : un humain met plus de 3 s. */
export const MIN_FILL_TIME_MS = 3000;
/** Au-delà, le jeton horaire est considéré comme expiré. */
export const MAX_FILL_TIME_MS = 24 * 60 * 60 * 1000;

export const SERVICE_OPTIONS = [
  ...services.map((s) => ({ value: s.id, label: s.title })),
  { value: 'autre', label: 'Autre demande / je ne sais pas encore' },
];

export type BookingField = 'name' | 'phone' | 'email' | 'service' | 'availability' | 'message' | 'consent';

export interface BookingRequest {
  name: string;
  phone: string;
  email: string;
  service: string;
  availability: string;
  message: string;
  consent: boolean;
}

export type FieldErrors = Partial<Record<BookingField, string>>;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const PHONE_ALLOWED_RE = /^\+?[0-9\s.\-()]+$/;
const URL_RE = /(https?:\/\/|www\.)/gi;
// Caractères de contrôle (hors retour à la ligne et tabulation dans le message)
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const clean = (value: unknown, { multiline = false } = {}): string => {
  if (typeof value !== 'string') return '';
  let v = value.replace(CONTROL_CHARS_RE, '').trim();
  if (!multiline) v = v.replace(/\s+/g, ' ');
  return v;
};

/** Normalise les données brutes (FormData ou JSON) en demande typée. */
export function normalizeBooking(raw: Record<string, unknown>): BookingRequest {
  const consent = raw.consent;
  return {
    name: clean(raw.name),
    phone: clean(raw.phone),
    email: clean(raw.email).toLowerCase(),
    service: clean(raw.service),
    availability: clean(raw.availability),
    message: clean(raw.message, { multiline: true }),
    consent: consent === true || consent === 'on' || consent === 'true' || consent === '1',
  };
}

export function validateField(field: BookingField, data: BookingRequest): string | undefined {
  switch (field) {
    case 'name': {
      if (!data.name) return 'Merci d’indiquer votre nom.';
      if (data.name.length < FIELD_LIMITS.name.min) return 'Votre nom semble trop court.';
      if (data.name.length > FIELD_LIMITS.name.max) return `${FIELD_LIMITS.name.max} caractères maximum.`;
      if (/[<>{}]|https?:|www\./i.test(data.name)) return 'Merci d’indiquer uniquement votre nom.';
      return;
    }
    case 'phone': {
      if (!data.phone) return 'Merci d’indiquer un numéro de téléphone pour que nous puissions vous rappeler.';
      const digits = data.phone.replace(/\D/g, '');
      if (!PHONE_ALLOWED_RE.test(data.phone) || digits.length < 10 || digits.length > 15)
        return 'Ce numéro ne semble pas valide (ex. 06 12 34 56 78).';
      return;
    }
    case 'email': {
      if (!data.email) return;
      if (data.email.length > FIELD_LIMITS.email.max || !EMAIL_RE.test(data.email))
        return 'Cette adresse e-mail ne semble pas valide.';
      return;
    }
    case 'service': {
      if (data.service && !SERVICE_OPTIONS.some((o) => o.value === data.service))
        return 'Merci de choisir une prestation dans la liste.';
      return;
    }
    case 'availability': {
      if (data.availability.length > FIELD_LIMITS.availability.max)
        return `${FIELD_LIMITS.availability.max} caractères maximum.`;
      return;
    }
    case 'message': {
      if (data.message.length > FIELD_LIMITS.message.max) return `${FIELD_LIMITS.message.max} caractères maximum.`;
      if ((data.message.match(URL_RE) ?? []).length > 1) return 'Merci de ne pas inclure de liens dans votre message.';
      return;
    }
    case 'consent': {
      if (!data.consent) return 'Merci d’accepter l’utilisation de vos données pour traiter votre demande.';
      return;
    }
  }
}

export function validateBooking(data: BookingRequest): FieldErrors {
  const fields: BookingField[] = ['name', 'phone', 'email', 'service', 'availability', 'message', 'consent'];
  const errors: FieldErrors = {};
  for (const field of fields) {
    const error = validateField(field, data);
    if (error) errors[field] = error;
  }
  return errors;
}

export function serviceLabel(value: string): string {
  return SERVICE_OPTIONS.find((o) => o.value === value)?.label ?? 'Non précisée';
}
