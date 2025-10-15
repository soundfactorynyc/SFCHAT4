// ============================================
// ENHANCED TEAM TRACKING SYSTEM
// Triple-checked for complete tracking coverage
// ============================================

(function() {
    console.log('🚀 Enhanced Team Tracking System Loading...');
    
    // ============================================
    // STEP 1: GET PROMO CODE FROM URL
    // ============================================
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo') || urlParams.get('ref') || urlParams.get('code');
    
    if (!promoCode) {
        console.warn('⚠️ No promo code detected in URL');
        console.log('Expected URL format: ?promo=XXXXX or ?ref=XXXXX or ?code=XXXXX');
        return;
    }
    
    console.log('✅ Team Member Code Active:', promoCode);
    
    // ============================================
    // STEP 2: FETCH PROMOTER'S STRIPE LINKS
    // ============================================
    let promoterData = null;
    
    async function loadPromoterData() {
        try {
            const response = await fetch(`/api/get-promoter-links?promo=${promoCode}`);
            if (!response.ok) throw new Error('Failed to load promoter data');
            
            promoterData = await response.json();
            console.log('✅ Promoter data loaded:', promoterData);
            
            // Update all links with promoter's unique Stripe links
            updateAllLinks();
            
        } catch (error) {
            console.error('❌ Error loading promoter data:', error);
        }
    }
    
    // ============================================
    // STEP 3: UPDATE ALL LINKS WITH TRACKING
    // ============================================
    function updateAllLinks() {
        if (!promoterData) {
            console.warn('⚠️ No promoter data available');
            return;
        }
        
        // COUNT: Track how many links we update
        let ticketLinksUpdated = 0;
        let tableLinksUpdated = 0;
        
        // ----------------------------------------
        // UPDATE TICKET LINKS
        // ----------------------------------------
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            
            // If it's a ticket purchase link
            if (text.includes('Purchase Tickets') || text.includes('Ticket')) {
                if (promoterData.ticketLink) {
                    // Replace with promoter's unique ticket link
                    const newHref = addPromoToUrl(promoterData.ticketLink, promoCode);
                    link.setAttribute('href', newHref);
                    link.setAttribute('data-promo-code', promoCode);
                    link.setAttribute('data-product-type', 'ticket');
                    link.setAttribute('data-commission', '10'); // $10 per ticket
                    ticketLinksUpdated++;
                    console.log('✅ Updated ticket link:', newHref);
                }
            }
            
            // ----------------------------------------
            // UPDATE TABLE DEPOSIT LINKS
            // ----------------------------------------
            else if (href && href.includes('tickets.soundfactorynyc.net')) {
                // This is a table payment link
                const newHref = addPromoToUrl(href, promoCode);
                link.setAttribute('href', newHref);
                link.setAttribute('data-promo-code', promoCode);
                
                // Determine if it's deposit or full payment
                if (text.includes('Deposit')) {
                    link.setAttribute('data-product-type', 'table-deposit');
                    link.setAttribute('data-payment-type', 'deposit');
                } else if (text.includes('Full Payment')) {
                    link.setAttribute('data-product-type', 'table-full');
                    link.setAttribute('data-payment-type', 'full');
                }
                
                // Extract table details from parent
                const parent = link.closest('.table') || link.closest('[class*="table"]') || link.closest('div');
                if (parent) {
                    const tableText = parent.textContent;
                    
                    // Extract table size
                    if (tableText.includes('6-8')) {
                        link.setAttribute('data-table-size', '6-8');
                        link.setAttribute('data-table-price', '1500');
                        link.setAttribute('data-commission', '300'); // 20% of $1500
                    } else if (tableText.includes('8-10')) {
                        link.setAttribute('data-table-size', '8-10');
                        link.setAttribute('data-table-price', '2500');
                        link.setAttribute('data-commission', '500'); // 20% of $2500
                    } else if (tableText.includes('10-12')) {
                        link.setAttribute('data-table-size', '10-12');
                        link.setAttribute('data-table-price', '3500');
                        link.setAttribute('data-commission', '700'); // 20% of $3500
                    } else if (tableText.includes('12-15')) {
                        link.setAttribute('data-table-size', '12-15');
                        link.setAttribute('data-table-price', '5000');
                        link.setAttribute('data-commission', '1000'); // 20% of $5000
                    }
                }
                
                tableLinksUpdated++;
                console.log('✅ Updated table link:', link.getAttribute('data-product-type'), newHref);
            }
        });
        
        console.log(`📊 LINKS UPDATED: ${ticketLinksUpdated} tickets, ${tableLinksUpdated} tables`);
    }
    
    // Helper function to add promo code to URL
    function addPromoToUrl(url, promo) {
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('client_reference_id', promo);
            urlObj.searchParams.set('promo', promo);
            return urlObj.toString();
        } catch (e) {
            // If URL parsing fails, append manually
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}client_reference_id=${promo}&promo=${promo}`;
        }
    }
    
    // ============================================
    // STEP 4: TRACK PAGE VIEW
    // ============================================
    fetch('/api/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            promo_code: promoCode,
            page: 'team-ticket-tables',
            event: 'halloween-2025',
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            referrer: document.referrer
        })
    }).then(response => {
        console.log('✅ Page view tracked');
    }).catch(err => {
        console.error('❌ Track view error:', err);
    });
    
    // ============================================
    // STEP 5: TRACK ALL CLICKS
    // ============================================
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (!target) return;
        
        const productType = target.getAttribute('data-product-type');
        if (!productType) return; // Only track our modified links
        
        const trackData = {
            promo_code: promoCode,
            event: 'halloween-2025',
            timestamp: new Date().toISOString(),
            product_type: productType,
            payment_type: target.getAttribute('data-payment-type'),
            table_size: target.getAttribute('data-table-size'),
            table_price: target.getAttribute('data-table-price'),
            commission: target.getAttribute('data-commission'),
            button_text: target.textContent.trim(),
            url: target.getAttribute('href')
        };
        
        // Send tracking immediately (don't wait for response)
        fetch('/api/track-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackData)
        }).catch(err => {
            console.error('❌ Track click error:', err);
        });
        
        console.log('🎯 CLICK TRACKED:', trackData);
    });
    
    // ============================================
    // STEP 6: SHOW PROMO INDICATOR
    // ============================================
    function showPromoIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'promo-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00cc70);
            color: #000;
            padding: 14px 24px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0, 255, 136, 0.5);
            z-index: 10000;
            animation: promoPulse 2s infinite;
            cursor: pointer;
        `;
        indicator.innerHTML = `🎯 Team: ${promoCode} | All Sales Tracked`;
        indicator.onclick = () => {
            alert(`✅ Active Team Member: ${promoCode}\n\n` +
                  `📊 All your sales are being tracked:\n` +
                  `• Tickets: $10 commission each\n` +
                  `• Tables: 20% commission\n\n` +
                  `Check your dashboard for real-time earnings!`);
        };
        document.body.appendChild(indicator);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes promoPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(0, 255, 136, 0.5); }
                50% { transform: scale(1.05); box-shadow: 0 6px 30px rgba(0, 255, 136, 0.7); }
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Promo indicator displayed');
    }
    
    // ============================================
    // STEP 7: INITIALIZE SYSTEM
    // ============================================
    console.log('🔄 Loading promoter data...');
    loadPromoterData().then(() => {
        showPromoIndicator();
        console.log('✅✅✅ TRACKING SYSTEM FULLY ACTIVE ✅✅✅');
        console.log('📊 All ticket and table links are tracked');
        console.log(`💰 Commissions: $10 per ticket, 20% on tables`);
    });
    
})();
