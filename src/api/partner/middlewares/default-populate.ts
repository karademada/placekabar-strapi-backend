/**
 * Populate par defaut sur /api/partners.
 * Sans ca, un appel direct renvoie une fiche sans photo ni engagements, et chaque
 * consommateur (front, sitemap, export) doit repeter la meme query.
 * Une query `populate` explicite envoyee par le client reste prioritaire.
 */
export default (_config: unknown, { strapi: _strapi }: { strapi: unknown }) => {
  const defaultPopulate = {
    portrait: true,
    gallery: true,
    location: true,
    keyFigures: true,
    commitments: true,
    products: {
      fields: ['name', 'price'],
      populate: { image: true },
    },
  }

  return async (ctx: any, next: () => Promise<void>) => {
    if (!ctx.query.populate) {
      ctx.query.populate = defaultPopulate
    }
    await next()
  }
}
