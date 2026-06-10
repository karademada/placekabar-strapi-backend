import { factories } from '@strapi/strapi';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

const getStripe = (): Stripe => {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
};

const FREE_SHIPPING_THRESHOLD_EUR = 60;
const SHIPPING_FEE_EUR = 6;

interface CheckoutItemInput {
  id: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async createCheckoutSession(ctx) {
    const { items } = (ctx.request.body ?? {}) as { items?: CheckoutItemInput[] };

    if (!Array.isArray(items) || items.length === 0) {
      return ctx.badRequest('items must be a non-empty array');
    }
    for (const item of items) {
      if (
        !Number.isInteger(item.id) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return ctx.badRequest('each item needs a valid id and a quantity between 1 and 99');
      }
    }

    const ids = [...new Set(items.map((item) => item.id))];
    const products = await strapi.db.query('api::product.product').findMany({
      where: { id: { $in: ids }, publishedAt: { $notNull: true } },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productsById.get(item.id);
      if (!product) {
        return ctx.badRequest(`product ${item.id} not found`);
      }
      if (typeof product.stock === 'number' && product.stock < item.quantity) {
        return ctx.badRequest(`insufficient stock for "${product.name}"`);
      }
      // Price always comes from the database, never from the client.
      const price = Number(product.price);
      const variant = [item.size, item.color].filter(Boolean).join(' / ');
      subtotal += price * item.quantity;
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(price * 100),
          product_data: {
            name: variant ? `${product.name} (${variant})` : product.name,
          },
        },
      });
    }

    const shippingEur = subtotal > FREE_SHIPPING_THRESHOLD_EUR ? 0 : SHIPPING_FEE_EUR;
    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

    const order = await strapi.documents('api::order.order').create({
      data: {
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          size: item.size ?? null,
          color: item.color ?? null,
        })),
        amountTotal: subtotal + shippingEur,
        currency: 'eur',
        checkoutStatus: 'pending',
      },
    });

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: shippingEur === 0 ? 'Livraison offerte' : 'Livraison standard',
            fixed_amount: { amount: shippingEur * 100, currency: 'eur' },
          },
        },
      ],
      success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cart`,
      metadata: { order_document_id: order.documentId },
    });

    await strapi.documents('api::order.order').update({
      documentId: order.documentId,
      data: { stripeSessionId: session.id },
    });

    ctx.body = { url: session.url };
  },

  async webhook(ctx) {
    const signature = ctx.request.headers['stripe-signature'];
    const rawBody = (ctx.request.body ?? {})[Symbol.for('unparsedBody')];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !rawBody || !webhookSecret) {
      return ctx.badRequest('invalid webhook request');
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(rawBody, signature as string, webhookSecret);
    } catch (err) {
      strapi.log.warn(`Stripe webhook signature verification failed: ${(err as Error).message}`);
      return ctx.badRequest('invalid signature');
    }

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const order = await strapi.db.query('api::order.order').findOne({
        where: { stripeSessionId: session.id },
      });

      if (!order) {
        strapi.log.warn(`Stripe webhook: no order found for session ${session.id}`);
      } else if (event.type === 'checkout.session.completed') {
        await strapi.documents('api::order.order').update({
          documentId: order.documentId,
          data: {
            checkoutStatus: 'paid',
            customerEmail: session.customer_details?.email ?? undefined,
            amountTotal: (session.amount_total ?? 0) / 100,
          },
        });
      } else {
        await strapi.documents('api::order.order').update({
          documentId: order.documentId,
          data: { checkoutStatus: 'canceled' },
        });
      }
    }

    ctx.body = { received: true };
  },
}));
