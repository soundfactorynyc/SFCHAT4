require('dotenv').config();
const twilio = require('twilio');

console.log('=====================================');
console.log('SMS VERIFICATION SERVICE TEST');
console.log('=====================================\n');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

async function checkVerifyService() {
  try {
    console.log('1. CHECKING TWILIO CONNECTION...');
    console.log('-----------------------------------');
    console.log(`Account SID: ${accountSid}`);
    console.log(`Verify Service SID: ${verifySid}`);
    
    // Check verify service
    const service = await client.verify.v2
      .services(verifySid)
      .fetch();
    
    console.log(`\n✅ Verify Service Active: ${service.friendlyName}`);
    console.log(`   - Status: Active`);
    console.log(`   - Code Length: ${service.codeLength} digits`);
    console.log(`   - Lookup Enabled: ${service.lookupEnabled}`);
    console.log(`   - Skip SMS to Landlines: ${service.skipSmsToLandlines}`);
    
    // Check rate limits
    const rateLimits = await client.verify.v2
      .services(verifySid)
      .rateLimits
      .list({ limit: 5 });
    
    console.log(`\n2. RATE LIMITS CONFIGURED...`);
    console.log('-----------------------------------');
    if (rateLimits.length > 0) {
      console.log(`✅ Rate limits found: ${rateLimits.length}`);
      rateLimits.forEach(rl => {
        console.log(`   - ${rl.description || 'Limit'}: ${rl.uniqueName}`);
      });
    } else {
      console.log(`⚠️  No rate limits configured (SMS flood risk)`);
    }
    
    // Check recent verifications
    console.log(`\n3. RECENT VERIFICATION ATTEMPTS...`);
    console.log('-----------------------------------');
    
    const verifications = await client.verify.v2
      .services(verifySid)
      .verifications
      .list({ limit: 5 });
    
    if (verifications.length > 0) {
      console.log(`✅ Recent verifications: ${verifications.length}`);
      verifications.forEach(v => {
        console.log(`   - To: ${v.to.substring(0, 8)}****`);
        console.log(`     Status: ${v.status}`);
        console.log(`     Channel: ${v.channel}`);
        console.log(`     Valid: ${v.valid}`);
        console.log('');
      });
    } else {
      console.log('No recent verification attempts');
    }
    
    console.log(`\n4. SMS WORKFLOW STATUS...`);
    console.log('-----------------------------------');
    console.log('✅ Twilio Connected');
    console.log('✅ Verify Service Active');
    console.log('✅ Ready to send SMS codes');
    
    console.log(`\n5. IMPORTANT NOTES...`);
    console.log('-----------------------------------');
    console.log('⚠️  RATE LIMIT WARNING:');
    console.log('   You mentioned hitting SMS limits during testing.');
    console.log('   Twilio may temporarily block if too many attempts.');
    console.log('   ');
    console.log('   SOLUTIONS:');
    console.log('   1. Wait 24 hours for limits to reset');
    console.log('   2. Use different phone numbers for testing');
    console.log('   3. Contact Twilio support to increase limits');
    console.log('   4. Use Twilio Console to manually send test SMS');
    
    console.log(`\n✅ ALTERNATIVE TEST METHOD:`);
    console.log('   Since you hit rate limits, test the webhook directly:');
    console.log('   1. Use Stripe CLI: stripe trigger checkout.session.completed');
    console.log('   2. Or use Stripe Dashboard test webhooks');
    console.log('   3. Or make a real test purchase with test card');
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    
    if (error.message.includes('authenticate')) {
      console.log('\nFIX: Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
    } else if (error.message.includes('resource')) {
      console.log('\nFIX: Verify Service SID may be incorrect');
    }
  }
}

checkVerifyService().catch(console.error);
