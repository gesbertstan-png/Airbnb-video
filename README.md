# Maison Malki Neuilly — site internet

Site de **Maison Malki Neuilly**, institut de beauté et salon d’ongles au 25 rue de Chartres, 92200 Neuilly-sur-Seine.

Site rapide, accessible et pensé mobile d’abord, construit avec [Astro](https://astro.build) : pages statiques pré-générées, ~10 Ko de JavaScript, images converties en AVIF/WebP, et un petit serveur Node pour le formulaire de rendez-vous.

## Démarrer

Node.js 22.12 ou plus récent est requis.

```bash
npm install
npm run dev        # développement : http://localhost:4321
npm run build      # génère le site dans dist/
npm start          # serveur de production (après le build) : http://localhost:8080
npm run check      # vérification TypeScript
```

## Où modifier le contenu

| Quoi | Fichier |
| --- | --- |
| Adresse, téléphone, horaires, note Google, réseaux sociaux, lien de réservation, mentions légales | `src/config/site.ts` |
| Prestations (textes, tarifs) | `src/data/services-list.ts` |
| Photos associées aux prestations | `src/data/services.ts` |
| Photos | `src/assets/photos/` (optimisées automatiquement au build) |
| Couleurs, typographies, espacements | `src/styles/global.css` |
| Sections de la page d’accueil | `src/components/*.astro` |

- **Lien de réservation en ligne** : renseignez `bookingUrl` dans `src/config/site.ts`. Tous les boutons « Prendre rendez-vous » pointent alors vers ce lien. S’il reste vide, ils mènent à la section rendez-vous (téléphone + formulaire).
- **Horaires** : remplissez `openingHours`. Le tableau complet s’affiche, et les horaires sont ajoutés aux données structurées pour Google.
- **Tarifs** : ajoutez `price` à une prestation (ex. `price: '45 €'`) pour l’afficher.

## Variables d’environnement

Copiez `.env.example` en `.env`, ou définissez ces variables chez votre hébergeur (sur Vercel : *Settings → Environment Variables*).

| Variable | Rôle |
| --- | --- |
| `SITE_URL` | Adresse publique du site (URL canoniques, sitemap, image de partage). Détectée automatiquement sur Vercel ; **obligatoire** sur un autre hébergeur. |
| `PUBLIC_GA_MEASUREMENT_ID` | Identifiant Google Analytics 4 (`G-…`). Facultatif. S’il est défini, la bannière cookies apparaît et GA n’est chargé qu’après acceptation. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Serveur d’envoi des e-mails (secrets, uniquement côté serveur). |
| `CONTACT_TO_EMAIL` | Adresse qui reçoit les demandes de rendez-vous. |
| `CONTACT_FROM_EMAIL` | Adresse d’expédition (par défaut : `SMTP_USER`). |
| `PORT`, `HOST` | Port et interface du serveur Node (hors Vercel). |
| `FORCE_HTTPS` | Serveur Node : `true` par défaut, redirige HTTP vers HTTPS derrière un proxy qui transmet `X-Forwarded-Proto`. |

Sans configuration SMTP, le formulaire affiche un message invitant à appeler l’institut.

## Mise en ligne sur Vercel (recommandé)

Le projet est prêt pour [Vercel](https://vercel.com) : aucun réglage n’est nécessaire. Pendant le build, Vercel est détecté automatiquement (variable `VERCEL`), et l’adaptateur `@astrojs/vercel` remplace alors le serveur Node.

1. Créez un compte gratuit sur [vercel.com](https://vercel.com/signup) avec **« Continue with GitHub »**.
2. Ouvrez [vercel.com/new](https://vercel.com/new) et autorisez Vercel à accéder au dépôt `Airbnb-video`.
3. Cliquez sur **Import** en face du dépôt.
4. Dans **Project Name**, saisissez `maison-malki-neuilly` : ce sera l’adresse du site. Laissez les autres réglages par défaut (Framework Preset : Astro).
5. Cliquez sur **Deploy**. Après une à deux minutes, le site est en ligne sur `https://maison-malki-neuilly.vercel.app`, ou une adresse proche si ce nom est déjà pris.

Chaque nouvelle modification poussée sur GitHub est ensuite mise en ligne automatiquement.

**Réglages facultatifs**, dans *Settings → Environment Variables*, suivis d’un redéploiement (*Deployments → ⋯ → Redeploy*) :

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL` : activent l’envoi des demandes de rendez-vous par e-mail.
- `PUBLIC_GA_MEASUREMENT_ID` : active Google Analytics, avec la bannière cookies.
- `SITE_URL` : inutile sur Vercel. L’adresse de production (y compris votre nom de domaine) est détectée automatiquement.

**Nom de domaine** : dans *Settings → Domains*, ajoutez votre domaine (ex. `maison-malki-neuilly.fr`) et suivez les indications DNS. Le HTTPS est automatique. Redéployez ensuite une fois pour que le sitemap et les URL canoniques utilisent ce domaine.

Sur Vercel, la plateforme gère le HTTPS, le HSTS et la compression. Les autres en-têtes de sécurité et la CSP sont ajoutés à la configuration générée (`integrations/vercel-security-headers.mjs`). La limite d’envois du formulaire est comptée par instance de fonction serveur ; le champ piège et le délai minimal de saisie restent actifs dans tous les cas.

## Autre hébergement (serveur Node)

Hors de Vercel, le site se déploie sur tout hébergement Node.js (Render, Railway, Fly.io, VPS, hébergement mutualisé avec Node…) :

1. `npm ci && npm run build`
2. `npm start` (lance `server.mjs`)
3. Activez le certificat HTTPS chez l’hébergeur. Le serveur redirige ensuite HTTP vers HTTPS, envoie l’en-tête HSTS et compresse les réponses.

## Checklist « 20 choses à vérifier avant de lancer ton site web »

Chaque point de la checklist fournie a été traité :

| # | Point | Mise en œuvre |
| --- | --- | --- |
| 1 | Page RGPD | `/politique-de-confidentialite` : données collectées, finalités, durées, droits, cookies |
| 2 | Page de CGU | `/cgu`, plus `/mentions-legales` (obligatoires en France) |
| 3 | API hors front-end | Le formulaire est traité par `src/pages/api/rendez-vous.ts` côté serveur. Les secrets SMTP sont déclarés `access: 'secret'` (astro:env) et n’apparaissent jamais dans le code envoyé au navigateur. |
| 4 | Force le HTTPS | Automatique sur Vercel ; redirection 301 et HSTS dans `server.mjs` sur un serveur Node ; CSP `upgrade-insecure-requests` |
| 5 | Bannière cookies | `CookieConsent.astro` : « Refuser » aussi visible qu’« Accepter », aucun traceur avant consentement, choix conservé 6 mois, lien « Gestion des cookies » dans le pied de page |
| 6 | Meta title | Titre et description uniques par page (`Seo.astro`) |
| 7 | Image réseaux | `public/og-image.jpg` (1200×630) avec balises Open Graph et Twitter |
| 8 | Favicon | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, icônes 192/512 et `site.webmanifest` |
| 9 | Sitemap + robots.txt | `/sitemap-index.xml` généré au build, `/robots.txt` dynamique |
| 10 | Textes images | Texte alternatif descriptif sur chaque image |
| 11 | Compresse images | Conversion AVIF/WebP en plusieurs tailles. Exemple : la photo baby boomer passe de 218 Ko à 18–58 Ko. |
| 12 | Vitesse pages | Lighthouse Performance 97 (mobile) / 100 (desktop), compression gzip/brotli, polices auto-hébergées préchargées |
| 13 | Contraste | Toutes les couleurs de texte respectent le niveau WCAG AA (≥ 4,5:1). Accessibilité Lighthouse : 100. |
| 14 | Site responsive | Conception mobile d’abord, testée de 360 px à 1440 px, aucun défilement horizontal |
| 15 | Page 404 custom | `src/pages/404.astro` |
| 16 | Répare liens cassés | Liens internes, ancres et images vérifiés automatiquement : aucun lien cassé |
| 17 | Valid formulaires | Validation immédiate dans le navigateur, puis validation identique côté serveur (`src/lib/validation.ts`) |
| 18 | Anti-spam | Champ piège invisible, délai minimal de saisie, limite de 5 envois par IP et par 15 minutes, liens refusés dans le message, protection CSRF d’Astro |
| 19 | Outil d’analytics | Google Analytics 4 activable par variable d’environnement, soumis au consentement |
| 20 | Un seul CTA | Une seule action principale, « Prendre rendez-vous », répétée dans l’en-tête, le hero, après les prestations, dans le pied de page et dans la barre fixe sur mobile |

## Informations à compléter avant la mise en ligne

Ces éléments ne figuraient pas dans les documents fournis. Ils n’ont **pas** été inventés :

- **Mentions légales** (`site.legal`) : raison sociale, forme juridique, capital, SIRET, RCS, TVA, directeur de la publication, e-mail de contact, hébergeur. Ils apparaissent en rouge « [À compléter] » sur les pages légales.
- **Horaires complets** : seule l’ouverture du lundi à 10h00 était indiquée.
- **Lien de réservation en ligne** : la fiche Google affiche « Book online », mais le lien n’était pas visible.
- **Tarifs** des prestations.
- **Réseaux sociaux** (Instagram, etc.) et e-mail public.
- **`SITE_URL`** : le nom de domaine définitif (inutile sur Vercel, où il est détecté automatiquement).

Pensez aussi à faire relire les pages légales par un professionnel.

## Photos

Les photos d’origine (captures de la fiche Google de l’institut) se trouvent dans `src/assets/photos/`. `scripts/prepare-photos.mjs` recrée les recadrages de détail à partir des originaux :

```bash
node scripts/prepare-photos.mjs <dossier-des-originaux>
```
