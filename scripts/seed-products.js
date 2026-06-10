'use strict';

/**
 * Seed Madagascar products (vanille, huiles essentielles, miel).
 * Run with the dev server STOPPED (SQLite single-writer):
 *   node scripts/seed-products.js
 * Idempotent: existing slugs are skipped.
 */

const { createStrapi, compileStrapi } = require('@strapi/strapi');

const CATEGORIES = [
  { name: 'Vanille', slug: 'vanille' },
  { name: 'Huiles essentielles', slug: 'huiles-essentielles' },
  { name: 'Miel', slug: 'miel' },
];

const PRODUCTS = [
  // --- Vanille (au détail et en bottes) ---
  {
    name: 'Gousse de vanille Bourbon — au détail',
    slug: 'gousse-vanille-bourbon-detail',
    price: 4.9,
    stock: 200,
    description:
      "Gousse de vanille Bourbon de Madagascar vendue à l'unité. Gousse souple et charnue, arômes intenses de cacao et de vanille, idéale pour la pâtisserie traditionnelle.",
    imageUrl: 'https://loremflickr.com/600/600/vanilla,pods?lock=11',
    category: 'vanille',
  },
  {
    name: 'Vanille Bourbon de Madagascar — botte de 10 gousses',
    slug: 'vanille-bourbon-botte-10',
    price: 39.0,
    stock: 60,
    description:
      'Botte de 10 gousses de vanille Bourbon gourmet de Madagascar, récoltées dans la région de la SAVA. Gousses grade A, souples et généreusement givrées en vanilline.',
    imageUrl: 'https://loremflickr.com/600/600/vanilla,pods?lock=12',
    category: 'vanille',
  },
  {
    name: 'Vanille Bourbon de Madagascar — botte de 25 gousses',
    slug: 'vanille-bourbon-botte-25',
    price: 89.0,
    stock: 30,
    description:
      'Botte de 25 gousses de vanille Bourbon de Madagascar pour les gourmands et les professionnels. La référence mondiale de la vanille, riche et irrésistible.',
    imageUrl: 'https://loremflickr.com/600/600/vanilla,beans?lock=13',
    category: 'vanille',
  },
  {
    name: 'Poudre de vanille Bourbon — 50 g',
    slug: 'poudre-vanille-bourbon-50g',
    price: 24.9,
    stock: 40,
    description:
      'Poudre de gousses de vanille Bourbon entières broyées. Parfaite pour parfumer crèmes, ganaches et boissons chaudes sans alcool ni additif.',
    imageUrl: 'https://loremflickr.com/600/600/vanilla,powder?lock=14',
    category: 'vanille',
  },
  {
    name: 'Extrait de vanille de Madagascar — flacon 60 g',
    slug: 'extrait-vanille-madagascar-60g',
    price: 14.9,
    stock: 50,
    description:
      "Extrait de vanille liquide de Madagascar pour la pâtisserie. Quelques gouttes suffisent pour retrouver toute l'intensité de la vanille Bourbon.",
    imageUrl: 'https://loremflickr.com/600/600/vanilla,extract?lock=15',
    category: 'vanille',
  },

  // --- Huiles essentielles (flacons 10 ml) ---
  {
    name: 'Huile essentielle de Ravintsara — 10 ml',
    slug: 'he-ravintsara-10ml',
    price: 12.9,
    stock: 80,
    description:
      'Huile essentielle de Ravintsara de Madagascar, reconnue pour ses propriétés purifiantes et régénératrices. Incontournable du bien-être au quotidien.',
    imageUrl: 'https://loremflickr.com/600/600/essential,oil?lock=21',
    category: 'huiles-essentielles',
  },
  {
    name: "Huile essentielle d'Ylang-ylang — 10 ml",
    slug: 'he-ylang-ylang-10ml',
    price: 14.9,
    stock: 70,
    description:
      "Huile essentielle d'Ylang-ylang de Madagascar, utilisée pour équilibrer les émotions et créer une atmosphère de tranquillité. Parfum floral envoûtant.",
    imageUrl: 'https://loremflickr.com/600/600/essential,oil?lock=22',
    category: 'huiles-essentielles',
  },
  {
    name: 'Huile essentielle de Géranium — 10 ml',
    slug: 'he-geranium-10ml',
    price: 13.9,
    stock: 60,
    description:
      "Huile essentielle de Géranium de Madagascar, appréciée pour équilibrer la production de sébum et améliorer l'apparence de la peau.",
    imageUrl: 'https://loremflickr.com/600/600/essential,oil,bottle?lock=23',
    category: 'huiles-essentielles',
  },
  {
    name: 'Huile essentielle de Menthe poivrée — 10 ml',
    slug: 'he-menthe-poivree-10ml',
    price: 11.9,
    stock: 75,
    description:
      'Huile essentielle de Menthe poivrée, connue pour ses propriétés antispasmodiques. Aide à soulager ballonnements et nausées, et rafraîchit instantanément.',
    imageUrl: 'https://loremflickr.com/600/600/peppermint,oil?lock=24',
    category: 'huiles-essentielles',
  },
  {
    name: 'Huile essentielle de Niaouli — 10 ml',
    slug: 'he-niaouli-10ml',
    price: 12.4,
    stock: 65,
    description:
      'Huile essentielle de Niaouli de Madagascar, purifiante et tonifiante, traditionnellement utilisée pour dégager les voies respiratoires.',
    imageUrl: 'https://loremflickr.com/600/600/essential,oils?lock=25',
    category: 'huiles-essentielles',
  },

  // --- Miels de Madagascar (pots 250 g) ---
  {
    name: 'Miel de Litchi de Madagascar — 250 g',
    slug: 'miel-litchi-250g',
    price: 11.9,
    stock: 90,
    description:
      'Miel de Litchi récolté près de Manakara, dans des zones garanties sans pesticides. Notes fruitées et délicates, production pure et 100 % naturelle.',
    imageUrl: 'https://loremflickr.com/600/600/honey,jar?lock=31',
    category: 'miel',
  },
  {
    name: 'Miel de Niaouli de Madagascar — 250 g',
    slug: 'miel-niaouli-250g',
    price: 12.9,
    stock: 80,
    description:
      'Miel de Niaouli de la côte est de Madagascar. Caractère boisé et balsamique, récolté dans des écosystèmes préservés de la Grande Île.',
    imageUrl: 'https://loremflickr.com/600/600/honey,jar?lock=32',
    category: 'miel',
  },
  {
    name: "Miel d'Eucalyptus de Madagascar — 250 g",
    slug: 'miel-eucalyptus-250g',
    price: 10.9,
    stock: 85,
    description:
      "Miel d'Eucalyptus de Madagascar aux notes mentholées et puissantes. Jusqu'à quatre récoltes par an grâce au climat exceptionnel de l'île.",
    imageUrl: 'https://loremflickr.com/600/600/honey?lock=33',
    category: 'miel',
  },
  {
    name: 'Miel de Mokarana de Madagascar — 250 g',
    slug: 'miel-mokarana-250g',
    price: 14.9,
    stock: 50,
    description:
      'Miel de Mokarana, arbre mellifère endémique de la région de Manakara. Une saveur prodigieuse introuvable ailleurs dans le monde.',
    imageUrl: 'https://loremflickr.com/600/600/honey,spoon?lock=34',
    category: 'miel',
  },
];

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  const categoryDocIds = {};
  for (const cat of CATEGORIES) {
    let existing = await app.documents('api::category.category').findFirst({
      filters: { slug: cat.slug },
    });
    if (!existing) {
      existing = await app.documents('api::category.category').create({ data: cat });
      console.log(`category created: ${cat.name}`);
    }
    categoryDocIds[cat.slug] = existing.documentId;
  }

  let created = 0;
  let skipped = 0;
  for (const product of PRODUCTS) {
    const existing = await app.documents('api::product.product').findFirst({
      filters: { slug: product.slug },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    const { category, ...data } = product;
    await app.documents('api::product.product').create({
      data: { ...data, category: categoryDocIds[category] },
      status: 'published',
    });
    created += 1;
  }

  console.log(`done: ${created} products created, ${skipped} skipped`);
  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
