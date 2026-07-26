import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::partner.partner', {
  config: {
    find: { middlewares: ['api::partner.default-populate'] },
    findOne: { middlewares: ['api::partner.default-populate'] },
  },
});
