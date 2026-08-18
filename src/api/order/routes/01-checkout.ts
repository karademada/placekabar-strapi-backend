export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/checkout-session',
      handler: 'order.createCheckoutSession',
      // Auth deliberately NOT disabled: creating a checkout session (and a
      // DB order) requires an authenticated user (users-permissions JWT).
      config: {},
    },
    {
      method: 'POST',
      path: '/orders/stripe-webhook',
      handler: 'order.webhook',
      config: {
        // Signature-verified by Stripe, not by a user session.
        auth: false,
      },
    },
  ],
};
