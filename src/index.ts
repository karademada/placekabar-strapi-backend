import type { Core } from '@strapi/strapi';

type SeedCategory = { name: string; slug: string };
type SeedProduct = {
  name: string;
  slug: string;
  price: number;
  stock: number;
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  categorySlug: string;
  imageUrl: string;
};

const CATEGORIES: SeedCategory[] = [
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Accessories', slug: 'accessories' },
];

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Classic Tee',
    slug: 'classic-tee',
    price: 24.9,
    stock: 120,
    description: 'Soft cotton crew-neck tee.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Navy', hex: '#0A1F44' },
    ],
    categorySlug: 'apparel',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  },
  {
    name: 'Hooded Sweatshirt',
    slug: 'hooded-sweatshirt',
    price: 59.0,
    stock: 60,
    description: 'Fleece-lined hoodie with kangaroo pocket.',
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Olive', hex: '#556B2F' },
    ],
    categorySlug: 'apparel',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80',
  },
  {
    name: 'Runner Sneakers',
    slug: 'runner-sneakers',
    price: 89.5,
    stock: 40,
    description: 'Lightweight mesh runners.',
    sizes: ['40', '41', '42', '43', '44'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Red', hex: '#D7263D' },
    ],
    categorySlug: 'footwear',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  },
  {
    name: 'Leather Belt',
    slug: 'leather-belt',
    price: 35.0,
    stock: 80,
    description: 'Full-grain leather belt, brushed buckle.',
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Brown', hex: '#5C4033' },
      { name: 'Black', hex: '#000000' },
    ],
    categorySlug: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  },
  {
    name: 'Wool Beanie',
    slug: 'wool-beanie',
    price: 18.0,
    stock: 150,
    description: 'Merino wool ribbed beanie.',
    sizes: ['One Size'],
    colors: [
      { name: 'Grey', hex: '#7D7D7D' },
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Forest', hex: '#228B22' },
    ],
    categorySlug: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80',
  },
];

const PUBLIC_READ_ACTIONS = [
  'api::product.product.find',
  'api::product.product.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
];

async function grantPublicReadPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[seed] public role not found — skip permission grant');
    return;
  }

  for (const action of PUBLIC_READ_ACTIONS) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { role: publicRole.id, action } });
    if (existing) continue;
    await strapi.db
      .query('plugin::users-permissions.permission')
      .create({ data: { role: publicRole.id, action } });
    strapi.log.info(`[seed] granted public ${action}`);
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicReadPermissions(strapi);

    const existing = await strapi.documents('api::product.product').count({});
    if (existing > 0) {
      strapi.log.info(`[seed] skipped — ${existing} products already present`);
      return;
    }

    strapi.log.info('[seed] seeding categories…');
    const categoryBySlug: Record<string, string> = {};
    for (const c of CATEGORIES) {
      const created = await strapi.documents('api::category.category').create({
        data: { name: c.name, slug: c.slug },
      });
      categoryBySlug[c.slug] = created.documentId;
    }

    strapi.log.info('[seed] seeding products…');
    for (const p of PRODUCTS) {
      await strapi.documents('api::product.product').create({
        data: {
          name: p.name,
          slug: p.slug,
          price: p.price,
          stock: p.stock,
          description: p.description,
          sizes: p.sizes,
          colors: p.colors,
          imageUrl: p.imageUrl,
          category: categoryBySlug[p.categorySlug],
        },
        status: 'published',
      });
    }

    strapi.log.info(
      `[seed] done — ${CATEGORIES.length} categories, ${PRODUCTS.length} products`,
    );
  },
};
