exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        twilio: !!process.env.TWILIO_ACCOUNT_SID,
        supabase: !!process.env.SUPABASE_URL,
        stripe: !!process.env.STRIPE_SECRET_KEY
      },
      version: '1.0.0',
      defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '+1'
    })
  };
};
