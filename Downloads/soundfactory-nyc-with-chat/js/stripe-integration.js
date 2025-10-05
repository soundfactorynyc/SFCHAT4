let stripe = null;

function initStripe() {
    if (window.Stripe && CONFIG.STRIPE_PUBLISHABLE_KEY && !CONFIG.STRIPE_PUBLISHABLE_KEY.includes('%%')) {
        stripe = Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY);
        console.log('✅ Stripe initialized');
    } else {
        console.warn('⚠️ Stripe not configured');
    }
}

async function buyTickets() {
    const ticketPage = 'https://soundfactorynyc.com/tickets';
    window.open(ticketPage, '_blank');
    if (window.showToast) {
        showToast('🎟️ Opening ticket purchase...');
    }
}

async function buyTables() {
    const tableReservationsUrl = '/table-reservations-links.html';
    const phoneNumber = localStorage.getItem('userPhone') || sessionStorage.getItem('userPhone');
    
    if (!phoneNumber) {
        const redirectUrl = encodeURIComponent(tableReservationsUrl);
        window.location.href = `/universal-login.html?redirect=${redirectUrl}`;
        if (window.showToast) {
            showToast('🔐 Please login to reserve tables...');
        }
    } else {
        window.location.href = tableReservationsUrl;
        if (window.showToast) {
            showToast('🍾 Opening table reservations...');
        }
    }
}

async function createTableCheckout(tableSize, customerPhone) {
    try {
        const response = await fetch('/.netlify/functions/create-table-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tableSize: tableSize,
                customerPhone: customerPhone
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const { sessionId } = await response.json();
        
        if (stripe) {
            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) {
                console.error('Stripe redirect error:', error);
                if (window.showToast) {
                    showToast('❌ Payment error. Please try again.');
                }
            }
        }
    } catch (error) {
        console.error('Checkout error:', error);
        if (window.showToast) {
            showToast('❌ Error creating checkout. Please try again.');
        }
    }
}

function bookStudio() {
    window.open('https://buy.stripe.com/YOUR_STUDIO_BOOKING_LINK', '_blank');
    if (window.showToast) {
        showToast('📹 Opening studio booking...');
    }
}

async function sendDrink() {
    const recipientName = document.getElementById('hoverName')?.textContent || 'guest';
    const link = window.HOVER_PURCHASE_LINKS?.DRINK_10 || '';
    
    if (!link || link.includes('test_DRINK_10_LINK')) {
        if (window.showToast) {
            showToast('❗ Stripe $10 drink link not configured');
        }
    } else {
        window.open(link, '_blank');
        if (window.showToast) {
            showToast(`🍹 $10 drink for ${recipientName} — opening Stripe...`);
        }
    }
    
    const profileHover = document.getElementById('profileHover');
    if (profileHover) {
        profileHover.style.display = 'none';
    }
}

async function giftTicket() {
    const url = window.HOVER_PURCHASE_LINKS?.TICKET_PAGE || 'https://soundfactorynyc.com/tickets';
    window.open(url, '_blank');
    if (window.showToast) {
        showToast('🎟️ Opening ticket page...');
    }
    
    const profileHover = document.getElementById('profileHover');
    if (profileHover) {
        profileHover.style.display = 'none';
    }
}

function inviteToTable() {
    const recipientName = document.getElementById('hoverName')?.textContent || 'guest';
    const link = window.HOVER_PURCHASE_LINKS?.TABLE_100 || '';
    
    if (!link || link.includes('test_TABLE_100_LINK')) {
        if (window.showToast) {
            showToast('❗ Stripe $100 table invite link not configured');
        }
    } else {
        window.open(link, '_blank');
        if (window.showToast) {
            showToast(`🍾 $100 table invite for ${recipientName} — opening Stripe...`);
        }
    }
    
    const profileHover = document.getElementById('profileHover');
    if (profileHover) {
        profileHover.style.display = 'none';
    }
}

async function buyBottleService() {
    const bottleOptions = [
        { name: 'Premium Vodka', price: '$300', link: 'YOUR_VODKA_LINK' },
        { name: 'Champagne', price: '$500', link: 'YOUR_CHAMPAGNE_LINK' },
        { name: 'Tequila Package', price: '$400', link: 'YOUR_TEQUILA_LINK' }
    ];
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a1a, #2a1a2a);
        border: 2px solid #ff0066;
        border-radius: 20px;
        padding: 30px;
        z-index: 9999;
        text-align: center;
        color: white;
    `;
    
    modal.innerHTML = `
        <h2 style="color: #ff0066; margin-bottom: 20px;">🍾 Bottle Service</h2>
        ${bottleOptions.map(bottle => `
            <button onclick="window.open('https://buy.stripe.com/${bottle.link}', '_blank'); this.parentElement.remove();" 
                    style="display: block; width: 100%; padding: 15px; margin: 10px 0; background: rgba(255,0,102,0.2); 
                           border: 1px solid #ff0066; border-radius: 10px; color: white; cursor: pointer;">
                ${bottle.name} - ${bottle.price}
            </button>
        `).join('')}
        <button onclick="this.parentElement.remove()" 
                style="margin-top: 20px; padding: 10px 20px; background: rgba(255,255,255,0.1); 
                       border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; color: white; cursor: pointer;">
            Cancel
        </button>
    `;
    
    document.body.appendChild(modal);
}

window.initStripe = initStripe;
window.buyTickets = buyTickets;
window.buyTables = buyTables;
window.createTableCheckout = createTableCheckout;
window.bookStudio = bookStudio;
window.sendDrink = sendDrink;
window.giftTicket = giftTicket;
window.inviteToTable = inviteToTable;
window.buyBottleService = buyBottleService;
