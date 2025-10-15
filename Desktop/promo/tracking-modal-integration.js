// ============================================
// TRACKING SYSTEM MODAL INTEGRATION
// Add this to your main site JavaScript
// ============================================

/**
 * OPTION 1: TRIGGER VIA BUTTON
 * Add a button anywhere on your site:
 * <button onclick="openTrackingModal()">How It Works</button>
 */

/**
 * OPTION 2: AUTO-SHOW FOR NEW PROMOTERS
 * Automatically show when promoter first visits
 */

/**
 * OPTION 3: HELP ICON IN DASHBOARD
 * Add a floating help icon that opens modal
 */

// ============================================
// MODAL HTML (Inject into page)
// ============================================

const trackingModalHTML = `
<div id="trackingSystemModal" class="tracking-modal-overlay" style="display: none;">
    <style>
        .tracking-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            z-index: 999999;
            animation: fadeIn 0.3s ease;
            overflow-y: auto;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .tracking-modal-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .tracking-modal-content {
            background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            max-width: 1200px;
            width: 100%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            animation: slideUp 0.4s ease;
            overflow: hidden;
        }
        
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(30px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .tracking-modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            color: white;
        }
        
        .tracking-modal-header h1 {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0 0 8px 0;
        }
        
        .tracking-modal-header p {
            font-size: 15px;
            opacity: 0.9;
            margin: 0;
        }
        
        .tracking-close-btn {
            position: absolute;
            top: 25px;
            right: 30px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: white;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .tracking-close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
        }
        
        .tracking-modal-body {
            padding: 40px;
            max-height: 70vh;
            overflow-y: auto;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
        
        .tracking-modal-body::-webkit-scrollbar {
            width: 8px;
        }
        
        .tracking-modal-body::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .tracking-modal-body::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }
        
        .tracking-flow-step {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
            position: relative;
        }
        
        .tracking-flow-step::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        }
        
        .tracking-step-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 15px 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .tracking-step-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
        }
        
        .tracking-step-content {
            padding-left: 44px;
        }
        
        .tracking-data-box {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 13px;
        }
        
        .tracking-check-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin: 12px 0;
            padding: 12px;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 8px;
        }
        
        .tracking-check-icon {
            background: #10b981;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 14px;
            font-weight: 700;
        }
        
        .tracking-arrow {
            text-align: center;
            margin: 20px 0;
            color: rgba(255, 255, 255, 0.3);
            font-size: 24px;
        }
        
        .tracking-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #10b981;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            margin: 30px auto;
            display: flex;
            justify-content: center;
        }
        
        .tracking-pulse-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @media (max-width: 768px) {
            .tracking-modal-header {
                padding: 20px;
            }
            
            .tracking-modal-header h1 {
                font-size: 22px;
            }
            
            .tracking-modal-body {
                padding: 20px;
            }
            
            .tracking-flow-step {
                padding: 20px;
            }
        }
    </style>
    
    <div class="tracking-modal-container">
        <div class="tracking-modal-content">
            <div class="tracking-modal-header">
                <h1>🎯 Promoter Tracking System</h1>
                <p>Enterprise-grade commission tracking with end-to-end verification</p>
                <button class="tracking-close-btn" onclick="closeTrackingModal()">&times;</button>
            </div>
            
            <div class="tracking-modal-body">
                <div class="tracking-flow-step">
                    <h3 class="tracking-step-title">
                        <span class="tracking-step-number">1</span>
                        Unique Tracking Link
                    </h3>
                    <div class="tracking-step-content">
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 12px;">
                            Each promoter receives a personalized tracking URL
                        </p>
                        <div class="tracking-data-box">
                            <div style="color: #a8dadc;">
                                <strong style="color: #f1fa8c;">Promoter:</strong> DJ Sarah<br>
                                <strong style="color: #f1fa8c;">Code:</strong> DJ_SARAH_456<br>
                                <strong style="color: #f1fa8c;">Link:</strong> soundfactorynyc.com/halloween?promo=DJ_SARAH_456
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-arrow">↓</div>
                
                <div class="tracking-flow-step">
                    <h3 class="tracking-step-title">
                        <span class="tracking-step-number">2</span>
                        Intelligent Page Load
                    </h3>
                    <div class="tracking-step-content">
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 15px;">
                            Advanced JavaScript detects promo code and personalizes experience
                        </p>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Promo code detected and validated in real-time</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Promoter's Stripe payment links fetched from API</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>All purchase buttons updated with tracking</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Page view recorded with full metadata</span>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-arrow">↓</div>
                
                <div class="tracking-flow-step">
                    <h3 class="tracking-step-title">
                        <span class="tracking-step-number">3</span>
                        Click Tracking
                    </h3>
                    <div class="tracking-step-content">
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 12px;">
                            Every button click captured before payment
                        </p>
                        <div class="tracking-data-box">
                            <div style="color: #a8dadc;">
                                <strong style="color: #f1fa8c;">Tracked:</strong><br>
                                • Product Type (ticket/table)<br>
                                • Commission Amount<br>
                                • Promo Code<br>
                                • Timestamp
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-arrow">↓</div>
                
                <div class="tracking-flow-step">
                    <h3 class="tracking-step-title">
                        <span class="tracking-step-number">4</span>
                        Secure Payment Processing
                    </h3>
                    <div class="tracking-step-content">
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 12px;">
                            Stripe Checkout with embedded tracking reference
                        </p>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Card charged successfully</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Payment Intent created</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>client_reference_id captured</span>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-arrow">↓</div>
                
                <div class="tracking-flow-step">
                    <h3 class="tracking-step-title">
                        <span class="tracking-step-number">5</span>
                        Webhook Verification
                    </h3>
                    <div class="tracking-step-content">
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 15px;">
                            Secure webhook validates and processes payment
                        </p>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Stripe signature verified</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Promo code extracted</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Commission calculated</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Duplicate check passed</span>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-arrow">↓</div>
                
                <div class="tracking-flow-step">
                    <h3 class="tracking-step-title">
                        <span class="tracking-step-number">6</span>
                        Commission Recorded
                    </h3>
                    <div class="tracking-step-content">
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 12px;">
                            Sale permanently recorded with full audit trail
                        </p>
                        <div class="tracking-data-box">
                            <div style="color: #a8dadc;">
                                <strong style="color: #f1fa8c;">Database Record:</strong><br>
                                promo_code: DJ_SARAH_456<br>
                                amount: $50.00<br>
                                commission: $10.00<br>
                                status: completed
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-arrow">↓</div>
                
                <div class="tracking-flow-step">
                    <h3 class="tracking-step-title">
                        <span class="tracking-step-number">7</span>
                        Real-Time Dashboard Update
                    </h3>
                    <div class="tracking-step-content">
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 12px;">
                            Promoter sees earnings instantly
                        </p>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Total earnings updated</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Sales counter incremented</span>
                        </div>
                        <div class="tracking-check-item">
                            <span class="tracking-check-icon">✓</span>
                            <span>Recent activity displayed</span>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-status-badge">
                    <span class="tracking-pulse-dot"></span>
                    SYSTEM STATUS: PRODUCTION READY
                </div>
            </div>
        </div>
    </div>
</div>
`;

// ============================================
// FUNCTIONS
// ============================================

function openTrackingModal() {
    // Inject modal if not already in DOM
    if (!document.getElementById('trackingSystemModal')) {
        document.body.insertAdjacentHTML('beforeend', trackingModalHTML);
    }
    
    // Show modal
    const modal = document.getElementById('trackingSystemModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeTrackingModal() {
    const modal = document.getElementById('trackingSystemModal');
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.opacity = '1';
        document.body.style.overflow = ''; // Restore scrolling
    }, 300);
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('trackingSystemModal');
        if (modal && modal.style.display === 'block') {
            closeTrackingModal();
        }
    }
});

// Close on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('trackingSystemModal');
    if (e.target === modal) {
        closeTrackingModal();
    }
});

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Add button to your navigation
/*
<button onclick="openTrackingModal()" class="info-button">
    How Tracking Works
</button>
*/

// Example 2: Show modal on first promoter visit
/*
if (isFirstVisit && hasPromoCode) {
    setTimeout(openTrackingModal, 2000); // Show after 2 seconds
}
*/

// Example 3: Add floating help button
/*
const helpButton = document.createElement('button');
helpButton.innerHTML = '❓';
helpButton.onclick = openTrackingModal;
helpButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 28px;
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    z-index: 9999;
    transition: transform 0.2s;
`;
helpButton.onmouseover = () => helpButton.style.transform = 'scale(1.1)';
helpButton.onmouseout = () => helpButton.style.transform = 'scale(1)';
document.body.appendChild(helpButton);
*/

// ============================================
// AUTO-INITIALIZE
// ============================================
console.log('✅ Tracking System Modal loaded and ready');
console.log('Call openTrackingModal() to show the modal');