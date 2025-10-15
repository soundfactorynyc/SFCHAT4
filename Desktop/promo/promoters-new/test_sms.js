require('dotenv').config();
const handler = require('./netlify/functions/send-sms-code').handler;

async function test() {
  const result = await handler({
    httpMethod: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+19293629534' })
  });
  
  console.log('Status:', result.statusCode);
  console.log('Body:', result.body);
}

test().catch(console.error);
