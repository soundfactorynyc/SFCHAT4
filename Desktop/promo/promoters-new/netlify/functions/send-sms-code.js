// Deprecated endpoint: SMS auth has been removed. Use Stripe OAuth login.
exports.handler = async () => {
  return {
    statusCode: 410,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: 'Deprecated: SMS login disabled. Use Stripe OAuth login.',
      next: '/public/stripe-auth-login.html'
    })
  };
};
