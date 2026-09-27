import type { ImageMetadata } from 'astro';
import { services as catalog, type ServiceInfo } from './services-list';
import bleuCiel from '../assets/photos/ongles-bleu-ciel.jpg';
import babyBoomer from '../assets/photos/detail-baby-boomer.jpg';
import murDeVernis from '../assets/photos/detail-mur-de-vernis.jpg';
import comptoir from '../assets/photos/detail-comptoir-fleurs.jpg';

export interface Service extends ServiceInfo {
  image: ImageMetadata;
  imageAlt: string;
}

const visuals: Record<string, Pick<Service, 'image' | 'imageAlt'>> = {
  'manucure-russe': {
    image: bleuCiel,
    imageAlt: 'Main aux ongles amande vernis d’un bleu ciel pastel, cuticules nettes',
  },
  'baby-boomer': {
    image: babyBoomer,
    imageAlt: 'Ongles amande en dégradé baby boomer, du rose nude au blanc lacté',
  },
  'pose-couleur': {
    image: murDeVernis,
    imageAlt: 'Mur de l’institut Maison Malki avec ses étagères lumineuses de flacons de vernis',
  },
  electrolyse: {
    image: comptoir,
    imageAlt: 'Comptoir de l’institut orné de roses blanches et d’hortensias bordeaux',
  },
};

/** Prestations avec leurs visuels, pour l'affichage. */
export const services: Service[] = catalog.map((service) => ({ ...service, ...visuals[service.id] }));
