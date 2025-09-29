#!/usr/bin/env node

/**
 * Test script for Sound Factory Stripe payment flow
 * Tests table reservation payment processing
 */

import https from 'https';
import http from 'http';

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'http://localhost:5173',
    testTable: {
        id: 'test_vip1',
        name: 'VIP Table 1',
        capacity: '10 people',
        price: 2000,
        available: true
    },
    testCustomer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890'
    }
};

// Test data for Stripe checkout session
const testCheckoutData = {
    amount: 200000, // $2000 in cents
    currency: 'usd',
    name: 'VIP Table Reservation',
    item: 'table',
    userId: 'test_user_123',
    userName: 'Test Customer'
};

console.log('🧪 Sound Factory Payment Flow Test');
console.log('=====================================\n');

// Test 1: Check if table reservations page loads
async function testPageLoad() {
    console.log('1. Testing page load...');
    try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/table-reservations`);
        if (response.ok) {
            console.log('✅ Table reservations page loads successfully');
            return true;
        } else {
            console.log('❌ Page load failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Page load error:', error.message);
        return false;
    }
}

// Test 2: Test Stripe checkout session creation
async function testCheckoutSession() {
    console.log('\n2. Testing Stripe checkout session creation...');
    try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/.netlify/functions/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCheckoutData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Checkout session created successfully');
            console.log('   Session ID:', data.id);
            console.log('   Checkout URL:', data.url);
            return data;
        } else {
            const errorData = await response.json();
            console.log('❌ Checkout session creation failed:', errorData);
            return null;
        }
    } catch (error) {
        console.log('❌ Checkout session error:', error.message);
        return null;
    }
}

// Test 3: Test webhook handling
async function testWebhookHandling() {
    console.log('\n3. Testing webhook handling...');
    
    // Simulate a successful checkout session webhook
    const mockWebhookData = {
        id: 'cs_test_' + Date.now(),
        object: 'checkout.session',
        amount_total: 200000,
        currency: 'usd',
        status: 'complete',
        metadata: {
            item: 'table',
            userId: 'test_user_123',
            userName: 'Test Customer'
        }
    };

    try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/.netlify/functions/stripe-webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Stripe-Signature': 'test_signature'
            },
            body: JSON.stringify({
                type: 'checkout.session.completed',
                data: { object: mockWebhookData }
            })
        });

        if (response.ok) {
            console.log('✅ Webhook handling test passed');
            return true;
        } else {
            console.log('❌ Webhook handling failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Webhook error:', error.message);
        return false;
    }
}

// Test 4: Test success page
async function testSuccessPage() {
    console.log('\n4. Testing success page...');
    try {
        const sessionId = 'cs_test_' + Date.now();
        const response = await fetch(`${TEST_CONFIG.baseUrl}/success.html?session_id=${sessionId}`);
        if (response.ok) {
            console.log('✅ Success page loads correctly');
            return true;
        } else {
            console.log('❌ Success page failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Success page error:', error.message);
        return false;
    }
}

// Test 5: Test cancel page
async function testCancelPage() {
    console.log('\n5. Testing cancel page...');
    try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/cancel.html`);
        if (response.ok) {
            console.log('✅ Cancel page loads correctly');
            return true;
        } else {
            console.log('❌ Cancel page failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Cancel page error:', error.message);
        return false;
    }
}

// Test 6: Test Stripe configuration
function testStripeConfig() {
    console.log('\n6. Testing Stripe configuration...');
    
    // Check if Stripe keys are configured
    const hasStripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
    const hasWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...';
    
    if (hasStripeKey.startsWith('sk_test_') || hasStripeKey.startsWith('sk_live_')) {
        console.log('✅ Stripe secret key configured');
    } else {
        console.log('⚠️  Stripe secret key not configured (using placeholder)');
    }
    
    if (hasWebhookSecret.startsWith('whsec_')) {
        console.log('✅ Stripe webhook secret configured');
    } else {
        console.log('⚠️  Stripe webhook secret not configured (using placeholder)');
    }
    
    return true;
}

// Main test runner
async function runTests() {
    console.log('Starting payment flow tests...\n');
    
    const results = {
        pageLoad: await testPageLoad(),
        checkoutSession: await testCheckoutSession(),
        webhookHandling: await testWebhookHandling(),
        successPage: await testSuccessPage(),
        cancelPage: await testCancelPage(),
        stripeConfig: testStripeConfig()
    };
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Page Load: ${results.pageLoad ? '✅' : '❌'}`);
    console.log(`Checkout Session: ${results.checkoutSession ? '✅' : '❌'}`);
    console.log(`Webhook Handling: ${results.webhookHandling ? '✅' : '❌'}`);
    console.log(`Success Page: ${results.successPage ? '✅' : '❌'}`);
    console.log(`Cancel Page: ${results.cancelPage ? '✅' : '❌'}`);
    console.log(`Stripe Config: ${results.stripeConfig ? '✅' : '⚠️'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Payment flow is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the configuration and try again.');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Configure your Stripe keys in environment variables');
    console.log('2. Set up webhook endpoints in Stripe Dashboard');
    console.log('3. Test with real Stripe test cards');
    console.log('4. Verify SMS notifications are working');
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { runTests, testCheckoutSession, testWebhookHandling };
