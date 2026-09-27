/**
 * Catalogue des prestations (texte uniquement, sans images) —
 * partagé entre les pages, le formulaire et le serveur.
 *
 * Prestations identifiées dans les documents fournis :
 * — « manucure russe » et « électrolyse » : thèmes cités dans les avis Google ;
 * — baby boomer et pose couleur : réalisations visibles sur les photos de l'institut.
 *
 * Pour afficher un tarif, renseigner `price` (ex. '45 €').
 */

export interface ServiceInfo {
  id: string;
  title: string;
  category: 'Ongles' | 'Épilation';
  description: string;
  price?: string;
}

export const services: ServiceInfo[] = [
  {
    id: 'manucure-russe',
    title: 'Manucure russe',
    category: 'Ongles',
    description:
      'Une manucure d’une grande minutie : les cuticules sont travaillées avec précision pour une ligne nette et soignée, au plus près de l’ongle.',
  },
  {
    id: 'baby-boomer',
    title: 'Baby boomer',
    category: 'Ongles',
    description:
      'Le dégradé délicat du nude au blanc lacté : une french revisitée, lumineuse et naturelle, qui sublime toutes les longueurs.',
  },
  {
    id: 'pose-couleur',
    title: 'Pose couleur',
    category: 'Ongles',
    description:
      'Nudes poudrés, pastels ou teintes plus affirmées : une couleur choisie parmi notre mur de vernis, posée avec soin pour un fini brillant et uniforme.',
  },
  {
    id: 'electrolyse',
    title: 'Électrolyse',
    category: 'Épilation',
    description:
      'L’épilation électrique, poil par poil : une technique de précision, pratiquée avec douceur et attention — la prestation la plus citée par nos clientes.',
  },
];
