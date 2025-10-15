// Team Member Tracking Script for Halloween 2025
// Add this script at the bottom of Team Ticket and Tables.html before </body>

(function() {
    // Get promo code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo') || urlParams.get('ref') || urlParams.get('code');
    
    if (!promoCode) {
        console.log('No promo code detected');
        return;
    }
    
    console.log('✅ Team Member Code Active:', promoCode);
    
    // Track page view
    fetch('/api/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            promo_code: promoCode,
            page: 'team-ticket-tables',
            event: 'halloween-2025',
            timestamp: new Date().toISOString()
        })
    }).catch(err => console.log('Track view:', err));
    
    // Track all button clicks
    document.querySelectorAll('a.btn, a.btn-lg').forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const buttonText = this.textContent.trim();
            
            // Determine what was clicked
            let trackData = {
                promo_code: promoCode,
                event: 'halloween-2025',
                timestamp: new Date().toISOString(),
                button_text: buttonText,
                url: href
            };
            
            // Identify ticket vs table
            if (buttonText.includes('Purchase Tickets') || buttonText.includes('Ticket')) {
                trackData.type = 'ticket';
                trackData.price = 50; // $50 member ticket
                trackData.commission = 10; // $10 commission
            } else if (buttonText.includes('Deposit')) {
                trackData.type = 'table-deposit';
                trackData.payment_type = 'deposit';
                // Extract table size from parent element if possible
                const parent = this.closest('[class*="table"]') || this.closest('div');
                trackData.table_info = parent ? parent.textContent.substring(0, 100) : '';
            } else if (buttonText.includes('Full Payment')) {
                trackData.type = 'table-full';
                trackData.payment_type = 'full';
                const parent = this.closest('[class*="table"]') || this.closest('div');
                trackData.table_info = parent ? parent.textContent.substring(0, 100) : '';
            }
            
            // Send tracking data
            fetch('/api/track-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trackData)
            }).catch(err => console.log('Track click:', err));
            
            console.log('🎯 Click tracked:', trackData.type, '- Team Member:', promoCode);
        });
    });
    
    // Show promo banner if one exists
    const promoBanner = document.getElementById('promoBanner') || document.querySelector('[class*="promo"]');
    if (promoBanner) {
        promoBanner.style.display = 'block';
        if (promoBanner.querySelector('p')) {
            promoBanner.querySelector('p').textContent = `Team Member ${promoCode} - All sales tracked`;
        }
    }
    
    // Add promo indicator to page
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00ff88, #00cc70);
        color: #000;
        padding: 12px 20px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
        z-index: 10000;
        animation: pulse 2s infinite;
    `;
    indicator.innerHTML = `🎯 Team Member: ${promoCode}`;
    document.body.appendChild(indicator);
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Tracking Active - Team Member:', promoCode);
    console.log('📊 All clicks will be tracked with commission data');
})();
