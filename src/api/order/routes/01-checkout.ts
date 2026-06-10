export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/checkout-session',
      handler: 'order.createCheckoutSession',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/orders/stripe-webhook',
      handler: 'order.webhook',
      config: {
        auth: false,
      },
    },
  ],
};
