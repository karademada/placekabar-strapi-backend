'use strict';

/**
 * Seed Madagascar partners (fermiers, coopératives, collecteurs, distilleries)
 * et les engagements qu'ils portent, puis les relie aux produits existants.
 *
 * Run with the dev server STOPPED (SQLite single-writer):
 *   node scripts/seed-partners.js
 *
 * Idempotent: existing slugs are skipped. Run seed-products.js first — the
 * product links are resolved by slug and silently ignored if absent.
 */

const { createStrapi, compileStrapi } = require('@strapi/strapi');

const COMMITMENTS = [
  {
    name: 'Bio',
    slug: 'bio',
    category: 'bio',
    certifier: 'Ecocert',
    rank: 0,
    description:
      "Culture sans intrant de synthèse, contrôlée chaque année sur la parcelle et sur les registres de récolte.",
  },
  {
    name: 'Équitable',
    slug: 'equitable',
    category: 'fair-trade',
    certifier: 'Fairtrade International',
    rank: 1,
    description:
      "Prix minimum garanti au producteur, indépendant des cours mondiaux, et prime de développement versée à la coopérative.",
  },
  {
    name: 'Impact social',
    slug: 'impact-social',
    category: 'social',
    rank: 2,
    description:
      "Une part du chiffre d'affaires finance l'école et le dispensaire du village. Engagement volontaire, sans organisme tiers.",
  },
  {
    name: 'Agroforesterie',
    slug: 'agroforesterie',
    category: 'ecological',
    rank: 3,
    description:
      "Cultures conduites sous couvert forestier : pas de défriche, ombrage naturel, sols vivants et biodiversité maintenue.",
  },
  {
    name: 'Filière responsable',
    slug: 'filiere-responsable',
    category: 'responsible',
    rank: 4,
    description:
      "Achat en direct, sans intermédiaire, avec contrat pluriannuel et traçabilité de la parcelle jusqu'au colis.",
  },
];

const p = (text) => ({ type: 'paragraph', children: [{ type: 'text', text }] });
const h2 = (text) => ({ type: 'heading', level: 2, children: [{ type: 'text', text }] });
const quote = (text) => ({ type: 'quote', children: [{ type: 'text', text }] });

const PARTNERS = [
  {
    name: 'Coopérative Soa Vanilla',
    slug: 'cooperative-soa-vanilla',
    kind: 'cooperative',
    specialty: 'Vanille Bourbon préparée et extraits',
    tagline: '58 familles de Sambava réunies autour d’un même séchoir depuis 2017.',
    location: { region: 'Sava', town: 'Sambava', country: 'Madagascar', altitude: 15 },
    partnerSince: 2017,
    featured: true,
    rank: 0,
    keyFigures: [
      { value: '58', label: 'familles adhérentes' },
      { value: '94 ha', label: 'surface cultivée' },
      { value: '9 mois', label: 'affinage moyen' },
    ],
    commitments: ['bio', 'equitable', 'impact-social'],
    products: [
      'vanille-bourbon-botte-10',
      'vanille-bourbon-botte-25',
      'poudre-vanille-bourbon-50g',
      'extrait-vanille-madagascar-60g',
    ],
    story: [
      p("La coopérative s'est montée en 2017, après une saison cyclonique qui avait ruiné les prix d'achat sur le marché de Sambava. Cinquante-huit familles ont mis en commun leurs séchoirs plutôt que de vendre leur récolte verte au premier collecteur venu."),
      h2('Une préparation qui prend neuf mois'),
      p("L'échaudage, l'étuvage, le séchage au soleil puis l'affinage en malles de bois : chaque gousse passe entre les mains des mêmes préparateurs, du champ jusqu'au tri final par calibre. C'est ce temps long qui donne la souplesse et le givrage caractéristiques de la vanille de la SAVA."),
      quote("Vendre vert, c'est vendre son travail au tiers de sa valeur. On a préféré apprendre à préparer nous-mêmes."),
      p("La prime de développement du label équitable a financé un second séchoir couvert en 2021, puis la remise en état de la piste qui relie le village à la route nationale."),
    ],
  },
  {
    name: 'Ferme Rakotomalala',
    slug: 'ferme-rakotomalala',
    kind: 'farmer',
    specialty: 'Vanille Bourbon en sous-bois',
    tagline: 'Deux hectares de lianes conduites sous couvert forestier, à Andapa.',
    location: { region: 'Sava', town: 'Andapa', country: 'Madagascar', altitude: 480 },
    partnerSince: 2019,
    rank: 1,
    keyFigures: [
      { value: '2,1 ha', label: 'surface cultivée' },
      { value: '480 m', label: 'altitude de la parcelle' },
      { value: '3 200', label: 'lianes en production' },
    ],
    commitments: ['bio', 'agroforesterie'],
    products: ['gousse-vanille-bourbon-detail', 'vanille-bourbon-botte-10'],
    story: [
      p("Jean-Claude Rakotomalala cultive la vanille sur la parcelle héritée de son père, dans la cuvette d'Andapa. Aucune liane n'est plantée en plein soleil : toutes grimpent sur des tuteurs vivants, sous le couvert des grands arbres laissés en place."),
      h2("L'altitude change tout"),
      p("À 480 mètres, la floraison arrive trois semaines plus tard qu'en bord de mer. La pollinisation manuelle s'étale donc davantage, et les gousses mûrissent plus lentement — un profil aromatique plus boisé, moins sucré."),
    ],
  },
  {
    name: 'Distillerie Manongarivo',
    slug: 'distillerie-manongarivo',
    kind: 'processor',
    specialty: 'Huiles essentielles distillées à la vapeur',
    tagline: 'Distillation lente au bois, en lisière de la réserve de Manongarivo.',
    location: { region: 'Diana', town: 'Ambanja', country: 'Madagascar', altitude: 45 },
    partnerSince: 2020,
    rank: 2,
    keyFigures: [
      { value: '4 h', label: 'durée de distillation' },
      { value: '11', label: 'cueilleurs partenaires' },
    ],
    commitments: ['bio', 'filiere-responsable'],
    products: ['he-ravintsara-10ml', 'he-niaouli-10ml', 'he-menthe-poivree-10ml'],
    story: [
      p("La distillerie travaille en cycle court : les feuilles récoltées le matin sont dans l'alambic avant midi. Passé douze heures, le rendement chute et le profil aromatique se dégrade."),
      h2('Pourquoi la distillation est lente'),
      p("Une distillation poussée à la vapeur trop chaude va plus vite mais casse les molécules les plus volatiles. Ici la vapeur monte doucement pendant quatre heures, chauffée au bois de récupération des plantations voisines."),
    ],
  },
  {
    name: 'Coopérative Ylang de Nosy Be',
    slug: 'cooperative-ylang-nosy-be',
    kind: 'cooperative',
    specialty: 'Ylang-ylang et géranium rosat',
    tagline: 'Quarante-trois cueilleuses, une récolte à la fraîche avant huit heures.',
    location: { region: 'Diana', town: 'Hell-Ville', country: 'Madagascar', altitude: 20 },
    partnerSince: 2021,
    rank: 3,
    keyFigures: [
      { value: '43', label: 'cueilleuses' },
      { value: '6 h – 8 h', label: 'fenêtre de récolte' },
    ],
    commitments: ['equitable', 'impact-social', 'filiere-responsable'],
    products: ['he-ylang-ylang-10ml', 'he-geranium-10ml'],
    story: [
      p("Les fleurs d'ylang-ylang sont cueillies avant huit heures du matin, quand la concentration en essence est maximale. Passé cette fenêtre, le rendement baisse d'un tiers."),
      quote("On cueille à la fraîche, on distille dans la journée. Une fleur qui attend, c'est une fleur perdue."),
      p("La coopérative est dirigée par un bureau majoritairement féminin, ce qui reste rare dans la filière des huiles essentielles à Madagascar."),
    ],
  },
  {
    name: 'Union des apiculteurs de Manakara',
    slug: 'union-apiculteurs-manakara',
    kind: 'cooperative',
    specialty: 'Miels monofloraux de la côte est',
    tagline: 'Le mokarana ne pousse nulle part ailleurs. Son miel non plus.',
    location: { region: 'Vatovavy', town: 'Manakara', country: 'Madagascar', altitude: 10 },
    partnerSince: 2022,
    rank: 4,
    keyFigures: [
      { value: '310', label: 'ruches en production' },
      { value: '27', label: 'apiculteurs' },
      { value: '2', label: 'récoltes par an' },
    ],
    commitments: ['bio', 'agroforesterie', 'impact-social'],
    products: ['miel-mokarana-250g', 'miel-litchi-250g'],
    story: [
      p("Le mokarana est un arbre mellifère endémique de la côte est. Sa floraison ne dure que quelques semaines, et le miel qu'elle donne n'existe nulle part ailleurs dans le monde."),
      h2('Deux récoltes, deux miels'),
      p("La récolte de novembre suit la floraison des litchis : un miel clair, très floral. Celle de mars donne le mokarana, plus sombre et résineux. Entre les deux, les ruches sont laissées au repos."),
    ],
  },
  {
    name: 'Rucher d’Ankarafantsika',
    slug: 'rucher-ankarafantsika',
    kind: 'farmer',
    specialty: 'Miels d’eucalyptus et de niaouli',
    tagline: 'Ruches posées en lisière du parc, déplacées au rythme des floraisons.',
    location: { region: 'Boeny', town: 'Marovoay', country: 'Madagascar', altitude: 90 },
    partnerSince: 2023,
    rank: 5,
    keyFigures: [
      { value: '140', label: 'ruches' },
      { value: '4', label: 'emplacements saisonniers' },
    ],
    commitments: ['bio', 'agroforesterie'],
    products: ['miel-eucalyptus-250g', 'miel-niaouli-250g'],
    story: [
      p("Les ruches suivent les floraisons : eucalyptus en saison sèche, niaouli après les premières pluies. Quatre emplacements, déplacés au camion, en lisière du parc national d'Ankarafantsika."),
    ],
  },
  {
    name: 'Collecte Be Tsiky',
    slug: 'collecte-be-tsiky',
    kind: 'collector',
    specialty: 'Collecte et contrôle qualité au départ de Toamasina',
    tagline: 'Le maillon qui pèse, trie et scelle avant le départ du port.',
    location: { region: 'Atsinanana', town: 'Toamasina', country: 'Madagascar', altitude: 5 },
    partnerSince: 2018,
    rank: 6,
    keyFigures: [
      { value: '38', label: 'producteurs collectés' },
      { value: '100 %', label: 'lots tracés au village' },
    ],
    commitments: ['filiere-responsable', 'equitable'],
    products: [],
    story: [
      p("Be Tsiky ne cultive rien. Son métier : passer dans les villages, peser, contrôler l'humidité, refuser les lots non conformes et payer comptant le jour même."),
      h2('Pourquoi un collecteur figure ici'),
      p("La plupart des marques s'arrêtent au producteur dans leur récit. Le collecteur est pourtant le maillon où la traçabilité se gagne ou se perd : c'est là que les lots de plusieurs villages sont mélangés — ou pas."),
      quote("Un sac mal étiqueté au départ, et plus personne ne sait d'où vient la gousse. On étiquette au village, jamais au port."),
    ],
  },
];

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  // --- Engagements ---
  const commitmentDocIds = {};
  for (const commitment of COMMITMENTS) {
    let existing = await app.documents('api::commitment.commitment').findFirst({
      filters: { slug: commitment.slug },
    });
    if (!existing) {
      existing = await app.documents('api::commitment.commitment').create({ data: commitment });
      console.log(`commitment created: ${commitment.name}`);
    }
    commitmentDocIds[commitment.slug] = existing.documentId;
  }

  // --- Produits existants, indexés par slug ---
  const productDocIds = {};
  const products = await app.documents('api::product.product').findMany({
    fields: ['slug'],
    pagination: { pageSize: 200 },
    status: 'published',
  });
  for (const product of products) {
    productDocIds[product.slug] = product.documentId;
  }

  // --- Partenaires ---
  let created = 0;
  let relinked = 0;
  const missingProducts = new Set();

  for (const partner of PARTNERS) {
    const existing = await app.documents('api::partner.partner').findFirst({
      filters: { slug: partner.slug },
    });

    const { commitments, products: productSlugs, ...data } = partner;

    const linkedProducts = [];
    for (const slug of productSlugs) {
      if (productDocIds[slug]) linkedProducts.push(productDocIds[slug]);
      else missingProducts.add(slug);
    }

    const relations = {
      commitments: commitments.map((slug) => commitmentDocIds[slug]),
      products: linkedProducts,
    };

    // Un partenaire deja present voit seulement ses relations reconciliees :
    // seed-products.js peut avoir tourne apres ce script, auquel cas les liens
    // produits n'ont jamais pu etre resolus. Les champs editoriaux ne sont pas
    // ecrases, une retouche faite dans l'admin survit donc au reseed.
    if (existing) {
      await app.documents('api::partner.partner').update({
        documentId: existing.documentId,
        data: relations,
        status: 'published',
      });
      relinked += 1;
      continue;
    }

    await app.documents('api::partner.partner').create({
      data: { ...data, ...relations },
      status: 'published',
    });
    created += 1;
  }

  console.log(`done: ${created} partners created, ${relinked} relations reconciled`);
  if (missingProducts.size > 0) {
    console.log(
      `warning: unknown product slugs, run seed-products.js first → ${[...missingProducts].join(', ')}`,
    );
  }

  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
