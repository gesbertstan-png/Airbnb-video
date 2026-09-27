// Prépare les photos sources (recadrages de détail) à partir des originaux.
// Usage : node scripts/prepare-photos.mjs <dossier-des-originaux>
import sharp from 'sharp';
import path from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Usage : node scripts/prepare-photos.mjs <dossier-des-originaux>');
  process.exit(1);
}
const out = path.resolve('src/assets/photos');
const q = { quality: 92, mozjpeg: true };

const jobs = [
  // Photos complètes
  ['1.jpg', 'ongles-bleu-ciel.jpg'],
  ['2.jpg', 'ongles-baby-boomer.jpg'],
  ['3.jpg', 'institut-maison-malki.jpg'],
  // Détails (régions en pixels de l'original)
  ['2.jpg', 'detail-baby-boomer.jpg', { left: 150, top: 820, width: 800, height: 600 }],
  ['1.jpg', 'detail-bleu-ciel.jpg', { left: 300, top: 360, width: 660, height: 560 }],
  ['3.jpg', 'detail-mur-de-vernis.jpg', { left: 740, top: 150, width: 439, height: 420 }],
  ['3.jpg', 'detail-comptoir-fleurs.jpg', { left: 470, top: 360, width: 709, height: 397 }],
];

for (const [file, name, region] of jobs) {
  let img = sharp(path.join(src, file)).rotate();
  if (region) img = img.extract(region);
  const info = await img.jpeg(q).toFile(path.join(out, name));
  console.log(name, `${info.width}x${info.height}`);
}
