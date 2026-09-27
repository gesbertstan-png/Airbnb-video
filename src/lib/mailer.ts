/**
 * Envoi des demandes de rendez-vous par e-mail (serveur uniquement).
 * Les identifiants SMTP sont lus dans les variables d'environnement secrètes :
 * ils ne sont jamais exposés au navigateur.
 */
import nodemailer, { type Transporter } from 'nodemailer';
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_TO_EMAIL,
  CONTACT_FROM_EMAIL,
} from 'astro:env/server';
import { site } from '../config/site';
import { serviceLabel, type BookingRequest } from './validation';

export const mailerConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_TO_EMAIL);

let transporter: Transporter | undefined;

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendBookingRequest(request: BookingRequest) {
  const rows: Array<[string, string]> = [
    ['Nom', request.name],
    ['Téléphone', request.phone],
    ['E-mail', request.email || '—'],
    ['Prestation', request.service ? serviceLabel(request.service) : 'Non précisée'],
    ['Disponibilités', request.availability || '—'],
    ['Message', request.message || '—'],
  ];

  const text = [
    `Nouvelle demande de rendez-vous — ${site.name}`,
    '',
    ...rows.map(([label, value]) => `${label} : ${value}`),
    '',
    'Envoyé depuis le formulaire du site internet.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #3a2a25; line-height: 1.6">
      <h2 style="font-weight: normal">Nouvelle demande de rendez-vous</h2>
      <table cellpadding="6" style="border-collapse: collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="color:#6a5a52;vertical-align:top">${label}</td><td>${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`,
          )
          .join('')}
      </table>
      <p style="color:#6a5a52;font-size:12px">Envoyé depuis le formulaire du site ${escapeHtml(site.name)}.</p>
    </div>`;

  await getTransporter().sendMail({
    from: { name: `${site.name} — site web`, address: CONTACT_FROM_EMAIL || SMTP_USER! },
    to: CONTACT_TO_EMAIL,
    replyTo: request.email || undefined,
    subject: `Demande de rendez-vous — ${request.name}`.slice(0, 140),
    text,
    html,
  });
}
