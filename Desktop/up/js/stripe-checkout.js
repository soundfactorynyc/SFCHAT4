// Stripe Checkout Integration
(function() {
    'use strict';

    // Stripe configuration
    const STRIPE_CONFIG = {
        publishableKey: 'pk_test_51234567890abcdef', // Replace with your key
        successUrl: window.location.origin + '/success.html',
        cancelUrl: window.location.origin,
        currency: 'usd'
    };

    // Table prices only (tickets handled by TicketSpice)
    const PRODUCTS = {
        tables: {
            jp: {
                name: 'JP Exclusive',
                price: 0, // Price on inquiry
                description: 'Ultra-exclusive experience - Email for details',
                special: true
            },
            table10: {
                name: 'VIP Table - 10 People',
                price: 200000, // $2000.00
                description: 'Premium table reservation (bottles sold separately by venue)'
            },
            table8: {
                name: 'VIP Table - 8 People',
                price: 160000, // $1600.00
                description: 'VIP table reservation (bottles sold separately by venue)'
            },
            table6: {
                name: 'Table - 6 People',
                price: 120000, // $1200.00
                description: 'Prime table reservation (bottles sold separately by venue)'
            },
            table4: {
                name: 'Table - 4 People',
                price: 80000, // $800.00
                description: 'Table reservation (bottles sold separately by venue)'
            },
            table2: {
                name: 'Table - 2 People',
                price: 40000, // $400.00
                description: 'Intimate table reservation (bottles sold separately by venue)'
            }
        }
    };

    // Initialize Stripe
    let stripe = null;

    function initStripe() {
        // Load Stripe.js dynamically
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => {
            stripe = window.Stripe(STRIPE_CONFIG.publishableKey);
            setupCheckoutButtons();
            console.log('Stripe initialized');
        };
        document.head.appendChild(script);
    }

    // Setup checkout buttons
    function setupCheckoutButtons() {
        // Ticket button goes directly to TicketSpice
        const ticketBtn = document.getElementById('ticketBtn');
        if (ticketBtn) {
            ticketBtn.onclick = (e) => {
                e.preventDefault();
                window.open('https://soundfactory.ticketspice.com/soundfactory-sance', '_blank');
            };
        }

        // Tables button shows table options
        const tablesBtn = document.getElementById('tablesBtn');
        if (tablesBtn) {
            tablesBtn.onclick = (e) => {
                e.preventDefault();
                showTableOptions();
            };
        }
    }

    // Show table options modal
    function showTableOptions() {
        const modal = createModal('Reserve Table', 'tables');
        document.body.appendChild(modal);
    }

    // Create selection modal
    function createModal(title, type) {
        const modal = document.createElement('div');
        modal.className = 'stripe-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(10, 10, 10, 0.98);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
        `;

        // Header
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin: 0;">${title}</h2>
                <button id="close-modal" style="background: transparent; border: 1px solid #333; color: #666; width: 24px; height: 24px; cursor: pointer; border-radius: 4px;">×</button>
            </div>
            <div style="font-size: 9px; color: #555; margin-bottom: 16px; padding: 8px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 4px;">
                ⚠️ Table reservation only. Bottle service purchased separately at venue.
            </div>
            <div id="options-container"></div>
        `;

        const optionsContainer = content.querySelector('#options-container');
        const products = PRODUCTS[type];

        // Add product options
        for (const [key, product] of Object.entries(products)) {
            const option = document.createElement('div');
            option.style.cssText = `
                background: #0a0a0a;
                border: 1px solid #222;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            option.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 12px; color: ${product.special ? '#FFD700' : '#aaa'}; font-weight: 500;">
                            ${product.name} ${product.special ? '⭐' : ''}
                        </div>
                        <div style="font-size: 10px; color: #666; margin-top: 4px;">${product.description}</div>
                    </div>
                    <div style="font-size: 14px; color: ${product.special ? '#FFD700' : '#00ff88'}; font-weight: bold;">
                        ${product.special ? 'INQUIRE' : '$' + (product.price / 100).toFixed(2)}
                    </div>
                </div>
            `;

            option.onmouseover = () => {
                option.style.background = '#111';
                option.style.borderColor = '#333';
            };

            option.onmouseout = () => {
                option.style.background = '#0a0a0a';
                option.style.borderColor = '#222';
            };

            option.onclick = () => {
                checkoutProduct(product, type);
                modal.remove();
            };

            optionsContainer.appendChild(option);
        }

        modal.appendChild(content);

        // Close button
        content.querySelector('#close-modal').onclick = () => modal.remove();

        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        return modal;
    }

    // Process checkout
    async function checkoutProduct(product, type) {
        if (!stripe) {
            alert('Payment system initializing. Please try again.');
            return;
        }

        // Show loading
        const loading = showLoading();

        try {
            // Create checkout session (this would normally call your backend)
            // For demo, we'll simulate the session creation
            const sessionId = await createCheckoutSession(product, type);
            
            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
                sessionId: sessionId
            });

            if (error) {
                console.error('Stripe error:', error);
                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Unable to process payment. Please try again.');
        } finally {
            loading.remove();
        }
    }

    // Simulate creating a checkout session (replace with actual backend call)
    async function createCheckoutSession(product, type) {
        // For JP exclusive, show special contact
        if (product.special) {
            showJPContact();
        } else {
            // For regular table reservations, show contact info with table details
            showTableContact(product);
        }
        return null;
    }
    
    // Show JP exclusive contact
    function showJPContact() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(15, 15, 15, 0.98), rgba(25, 20, 10, 0.98));
            border: 2px solid #FFD700;
            border-radius: 8px;
            padding: 32px;
            z-index: 2100;
            max-width: 450px;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
        `;

        modal.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
            <h3 style="font-size: 16px; color: #FFD700; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 3px;">
                JP EXCLUSIVE
            </h3>
            <p style="font-size: 12px; color: #aaa; margin-bottom: 24px; line-height: 1.6;">
                Experience the ultimate VIP treatment with our exclusive JP section. 
                This ultra-premium experience is limited and by invitation only.
            </p>
            <div style="
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 24px;
            ">
                <div style="font-size: 11px; color: #FFD700; margin-bottom: 8px;">Includes:</div>
                <div style="font-size: 10px; color: #999; line-height: 1.8;">
                    • Private entrance & security<br>
                    • Dedicated VIP host all night<br>
                    • Premium location with exclusive access<br>
                    • Complimentary champagne on arrival<br>
                    • Priority bottle service ordering
                </div>
            </div>
            <p style="font-size: 11px; color: #888; margin-bottom: 20px;">
                To inquire about JP section availability and pricing:
            </p>
            <a href="mailto:djjonathanpeters@gmail.com?subject=JP%20Exclusive%20Section%20Inquiry%20-%20Halloween" style="
                display: inline-block;
                padding: 12px 24px;
                background: linear-gradient(135deg, #FFD700, #FFA500);
                border: none;
                color: #000;
                text-decoration: none;
                font-size: 12px;
                font-weight: 600;
                border-radius: 4px;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 20px rgba(255,215,0,0.4)';" 
               onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                Email JP
            </a>
            <div style="font-size: 10px; color: #666; margin-top: 12px;">
                djjonathanpeters@gmail.com
            </div>
            <button onclick="this.parentElement.remove()" style="
                display: block;
                margin: 24px auto 0;
                padding: 8px 16px;
                background: transparent;
                border: 1px solid #333;
                color: #666;
                font-size: 10px;
                cursor: pointer;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            ">Close</button>
        `;

        document.body.appendChild(modal);
    }

    // Show table reservation contact
    function showTableContact(product) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 10, 0.98);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 24px;
            z-index: 2100;
            max-width: 400px;
            text-align: center;
        `;

        const tableInfo = product ? `
            <div style="
                background: #0a0a0a;
                border: 1px solid #222;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 20px;
                text-align: left;
            ">
                <div style="font-size: 11px; color: #888; margin-bottom: 8px;">Selected:</div>
                <div style="font-size: 12px; color: #aaa; font-weight: 500;">${product.name}</div>
                <div style="font-size: 10px; color: #666; margin-top: 4px;">${product.description}</div>
                <div style="font-size: 14px; color: #00ff88; font-weight: bold; margin-top: 8px;">
                    $${(product.price / 100).toFixed(2)}
                </div>
            </div>
        ` : '';

        modal.innerHTML = `
            <h3 style="font-size: 12px; color: #888; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">
                Complete Table Reservation
            </h3>
            ${tableInfo}
            <div style="
                background: rgba(255, 200, 0, 0.1);
                border: 1px solid #333;
                border-radius: 4px;
                padding: 10px;
                margin-bottom: 16px;
                font-size: 10px;
                color: #777;
                line-height: 1.5;
            ">
                <strong style="color: #999;">Important:</strong><br>
                • Table reservation only<br>
                • Bottle service available for purchase at venue<br>
                • Prices and selection handled by Sound Factory
            </div>
            <p style="font-size: 11px; color: #666; margin-bottom: 20px; line-height: 1.6;">
                To complete your table reservation, please contact:
            </p>
            <a href="mailto:djjonathanpeters@gmail.com?subject=Table%20Reservation%20-%20${product ? encodeURIComponent(product.name) : 'Halloween'}" style="
                display: inline-block;
                padding: 10px 20px;
                background: #1a1a1a;
                border: 1px solid #333;
                color: #888;
                text-decoration: none;
                font-size: 11px;
                border-radius: 4px;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='#222'; this.style.color='#aaa';" 
               onmouseout="this.style.background='#1a1a1a'; this.style.color='#888';">
                djjonathanpeters@gmail.com
            </a>
            <button onclick="this.parentElement.remove()" style="
                display: block;
                margin: 20px auto 0;
                padding: 6px 12px;
                background: transparent;
                border: 1px solid #222;
                color: #555;
                font-size: 10px;
                cursor: pointer;
                border-radius: 4px;
            ">Close</button>
        `;

        document.body.appendChild(modal);
    }

    // Show loading indicator
    function showLoading() {
        const loading = document.createElement('div');
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
        `;

        loading.innerHTML = `
            <div style="text-align: center;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 2px solid #333;
                    border-top-color: #666;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                "></div>
                <div style="font-size: 11px; color: #666;">Processing...</div>
            </div>
        `;

        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(loading);
        return loading;
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStripe);
    } else {
        initStripe();
    }

    // Export for global access
    window.SoundFactoryStripe = {
        checkout: checkoutProduct,
        showTables: showTableOptions
    };
})();