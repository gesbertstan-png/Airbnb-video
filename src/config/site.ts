/**
 * Informations de l'institut — source unique utilisée par toutes les pages.
 *
 * Toutes les valeurs ci-dessous proviennent des documents fournis
 * (fiche Google Maps de Maison Malki Neuilly). Les champs vides ou marqués
 * « À compléter » n'étaient pas disponibles : il suffit de les renseigner ici.
 */

export const TO_COMPLETE = 'À compléter';

export const site = {
  name: 'Maison Malki Neuilly',
  brand: 'Maison Malki',
  locality: 'Neuilly',
  tagline: 'Institut de beauté & salon d’ongles à Neuilly-sur-Seine',
  lang: 'fr-FR',
  locale: 'fr_FR',

  address: {
    street: '25 Rue de Chartres',
    postalCode: '92200',
    city: 'Neuilly-sur-Seine',
    region: 'Île-de-France',
    country: 'FR',
  },

  phone: {
    display: '09 56 85 97 35',
    href: 'tel:+33956859735',
    e164: '+33956859735',
  },

  /**
   * Lien de réservation en ligne (Planity, Treatwell, etc.).
   * Non fourni dans les documents : laissé vide volontairement.
   * Dès qu'il est renseigné, tous les boutons « Prendre rendez-vous »
   * pointent directement vers ce lien.
   */
  bookingUrl: '',

  /** Adresse e-mail publique de l'institut (non fournie). */
  email: '',

  /**
   * Horaires : seule l'ouverture du lundi à 10h00 figure dans les documents.
   * Compléter `openingHours` (format 24 h) pour afficher le tableau complet
   * et l'ajouter automatiquement aux données structurées Google.
   */
  openingHoursKnown: [{ label: 'Lundi', value: 'ouverture à 10h00' }],
  openingHours: [] as Array<{
    /** Jours au format schema.org, ex. ['Monday', 'Tuesday'] */
    days: string[];
    /** Libellé affiché, ex. « Lundi – Vendredi » */
    label: string;
    opens: string;
    closes: string;
  }>,

  /** Note Google relevée sur la fiche de l'institut. */
  googleRating: {
    value: 4.8,
    display: '4,8',
    count: 118,
  },

  /** Thèmes les plus cités dans les avis Google (libellé, nombre de mentions). */
  reviewThemes: [
    { label: 'électrolyse', count: 22 },
    { label: 'douceur', count: 10 },
    { label: 'manucure russe', count: 5 },
    { label: 'équipe attentionnée', count: 5 },
    { label: 'équipe adorable', count: 2 },
    { label: 'salon cosy', count: 2 },
  ],

  /** Réseaux sociaux (non fournis) — ajouter les URL pour les afficher. */
  socials: [] as Array<{ label: string; url: string }>,

  /** Mentions légales : informations non fournies, à compléter avant la mise en ligne. */
  legal: {
    companyName: TO_COMPLETE,
    legalForm: TO_COMPLETE,
    shareCapital: TO_COMPLETE,
    siret: TO_COMPLETE,
    rcs: TO_COMPLETE,
    vatNumber: TO_COMPLETE,
    publicationDirector: TO_COMPLETE,
    contactEmail: TO_COMPLETE,
    host: {
      name: TO_COMPLETE,
      address: TO_COMPLETE,
      phone: TO_COMPLETE,
    },
    lastUpdate: '27 septembre 2026',
  },
} as const;

const fullAddress = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;

export const links = {
  fullAddress,
  /** Recherche de la fiche Google Maps de l'institut. */
  googleMaps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name}, ${fullAddress}`)}`,
  /** Itinéraire Google Maps jusqu'à l'institut. */
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${site.name}, ${fullAddress}`)}`,
  /** Cible des boutons « Prendre rendez-vous ». */
  booking: site.bookingUrl || '/#rendez-vous',
  bookingIsExternal: Boolean(site.bookingUrl),
};

export const nav = [
  { label: 'La Maison', href: '/#maison' },
  { label: 'Prestations', href: '/#prestations' },
  { label: 'Réalisations', href: '/#realisations' },
  { label: 'Expérience', href: '/#experience' },
  { label: 'Infos pratiques', href: '/#infos' },
];
