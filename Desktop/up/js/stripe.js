// Stripe Integration Module
(function() {
    'use strict';

    // Stripe Configuration - LIVE PRODUCTION
    const STRIPE_CONFIG = {
        publicKey: 'pk_live_51MEoQSKgJ6MFAw17UUfBzjJYIYHjLfwGCr9cvkTdG2DPRMPb4r0f1Y4POPcxrXqPnHSGRiGGZIDdKdAJU6dCECkR00eG5VhZUy',
        currency: 'usd',
        ticketPrice: 5000, // $50.00 in cents
        tableDeposit: 50000, // $500.00 in cents
        vipTablePrice: 200000, // $2000.00 in cents
        mainTablePrice: 150000, // $1500.00 in cents
        loungeTablePrice: 80000, // $800.00 in cents
        successUrl: window.location.origin + '/success.html',
        cancelUrl: window.location.origin + '/cancel.html'
    };

    // Initialize Stripe (when loaded)
    let stripe = null;
    
    // Initialize Stripe when ready
    function initStripe() {
        // In production, load Stripe.js library first
        // stripe = Stripe(STRIPE_CONFIG.publicKey);
        console.log('Stripe integration ready (placeholder)');
    }

    // Create Checkout Session for Tickets
    window.purchaseTickets = async function(quantity = 1) {
        try {
            showLoading('Processing...');
            
            // Simulate API call to create checkout session
            const sessionData = await createCheckoutSession('ticket', quantity);
            
            if (sessionData.url) {
                // In production: redirect to Stripe Checkout
                console.log('Redirecting to Stripe checkout:', sessionData.url);
                // window.location.href = sessionData.url;
                
                // For demo: show success message
                hideLoading();
                showSuccessModal('Ticket Purchase', `${quantity} ticket(s) would be purchased via Stripe`);
            }
        } catch (error) {
            hideLoading();
            showError('Failed to process payment. Please try again.');
            console.error('Payment error:', error);
        }
    };

    // Create Checkout Session for Tables
    window.purchaseTable = async function(tableId, packageType) {
        try {
            showLoading('Processing table booking...');
            
            // Simulate API call
            const sessionData = await createCheckoutSession('table', 1, {
                tableId: tableId,
                package: packageType
            });
            
            if (sessionData.url) {
                console.log('Table booking checkout:', sessionData.url);
                
                // For demo: show success message
                hideLoading();
                showSuccessModal('Table Booking', `Table ${tableId} (${packageType} package) would be booked via Stripe`);
            }
        } catch (error) {
            hideLoading();
            showError('Failed to process table booking. Please try again.');
            console.error('Booking error:', error);
        }
    };

    // Create Checkout Session (simulated)
    async function createCheckoutSession(type, quantity, metadata = {}) {
        // In production, this would call your backend API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'cs_test_' + Date.now(),
                    url: 'https://checkout.stripe.com/pay/cs_test_example',
                    type: type,
                    quantity: quantity,
                    metadata: metadata
                });
            }, 1000);
        });
        
        /* Production code:
        const response = await fetch('/.netlify/functions/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                quantity: quantity,
                metadata: metadata,
                successUrl: STRIPE_CONFIG.successUrl,
                cancelUrl: STRIPE_CONFIG.cancelUrl
            })
        });
        
        if (!response.ok) throw new Error('Checkout creation failed');
        return response.json();
        */
    }

    // Handle Payment Success
    window.handlePaymentSuccess = function(sessionId) {
        // Verify payment with backend
        verifyPayment(sessionId).then(result => {
            if (result.success) {
                showSuccessModal('Payment Successful!', 'Your purchase has been confirmed.');
                updateUserPurchases(result.purchase);
            }
        });
    };

    // Verify Payment (simulated)
    async function verifyPayment(sessionId) {
        // In production, verify with your backend
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    purchase: {
                        id: 'purchase_' + Date.now(),
                        sessionId: sessionId,
                        timestamp: Date.now()
                    }
                });
            }, 500);
        });
    }

    // Update User Purchases
    function updateUserPurchases(purchase) {
        const purchases = JSON.parse(localStorage.getItem('sf_purchases') || '[]');
        purchases.push(purchase);
        localStorage.setItem('sf_purchases', JSON.stringify(purchases));
        
        // Update UI if on dashboard
        if (window.updateDashboard) {
            window.updateDashboard();
        }
    }

    // Create Payment Link
    window.createPaymentLink = async function(type, amount, description) {
        try {
            // In production, call your backend to create a payment link
            const link = await generatePaymentLink(type, amount, description);
            
            // Copy to clipboard
            navigator.clipboard.writeText(link).then(() => {
                showNotification('Payment link copied to clipboard!');
            });
            
            return link;
        } catch (error) {
            console.error('Failed to create payment link:', error);
            showError('Failed to create payment link');
        }
    };

    // Generate Payment Link (simulated)
    async function generatePaymentLink(type, amount, description) {
        // In production, this would call Stripe API via your backend
        return new Promise((resolve) => {
            setTimeout(() => {
                const link = `https://buy.stripe.com/test_${Date.now()}`;
                resolve(link);
            }, 500);
        });
    }

    // Show Success Modal
    function showSuccessModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'payment-success-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">✓</div>
                <h2>${title}</h2>
                <p>${message}</p>
                <button class="close-modal-btn">Close</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a0033, #330066);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            color: white;
            max-width: 400px;
            animation: slideUp 0.4s ease;
        `;
        
        const successIcon = modal.querySelector('.success-icon');
        successIcon.style.cssText = `
            width: 80px;
            height: 80px;
            border: 3px solid #00ff88;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: #00ff88;
            margin: 0 auto 20px;
            animation: successPulse 0.5s ease;
        `;
        
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        document.body.appendChild(modal);
    }

    // Helper Functions
    function showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            const loader = overlay.querySelector('.loader');
            if (loader && message !== 'Loading...') {
                loader.insertAdjacentHTML('afterend', `<p style="color: white; margin-top: 20px;">${message}</p>`);
            }
        }
    }

    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            const message = overlay.querySelector('p');
            if (message) message.remove();
        }
    }

    function showError(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff3366;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 3000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 3000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes successPulse {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        .close-modal-btn {
            margin-top: 20px;
            padding: 12px 30px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .close-modal-btn:hover {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);

    // Check URL for payment success/cancel
    function checkPaymentStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
            handlePaymentSuccess(sessionId);
        }
        
        const canceled = urlParams.get('canceled');
        if (canceled === 'true') {
            showNotification('Payment was canceled');
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initStripe();
            checkPaymentStatus();
        });
    } else {
        initStripe();
        checkPaymentStatus();
    }

})();