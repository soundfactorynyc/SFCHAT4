// Drink Tips Integration for Sound Factory
(function() {
    'use strict';

    // Tip configuration
    const TIP_CONFIG = {
        defaultPercentage: 18,
        options: [
            { percentage: 0, label: 'No Tip', amount: 0 },
            { percentage: 15, label: 'Standard', amount: 0 },
            { percentage: 18, label: 'Good Service', amount: 0 },
            { percentage: 20, label: 'Excellent', amount: 0 },
            { percentage: 25, label: 'Outstanding', amount: 0 },
            { percentage: 'custom', label: 'Custom Amount', amount: 0 }
        ],
        drinkPrices: {
            cocktail: 15.00,
            beer: 8.00,
            wine: 12.00,
            bottle: 200.00,
            premium: 25.00
        }
    };

    // Initialize tip system
    function initTipSystem() {
        console.log('🍹 Initializing drink tip system...');
        
        // Add tip options to existing drink buttons
        addTipOptionsToDrinkButtons();
        
        // Create tip modal if it doesn't exist
        createTipModal();
        
        console.log('✅ Tip system initialized');
    }

    // Add tip options to drink purchase buttons
    function addTipOptionsToDrinkButtons() {
        const drinkButtons = document.querySelectorAll('[data-drink-purchase]');
        
        drinkButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const drinkType = this.dataset.drinkType || 'cocktail';
                const drinkPrice = TIP_CONFIG.drinkPrices[drinkType] || 15.00;
                showTipModal(drinkType, drinkPrice);
            });
        });
    }

    // Create tip selection modal
    function createTipModal() {
        const modal = document.createElement('div');
        modal.id = 'tipModal';
        modal.className = 'tip-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div class="tip-modal-content" style="
                background: linear-gradient(135deg, #1a0033, #330066);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                border: 2px solid #00ff88;
                box-shadow: 0 20px 60px rgba(0, 255, 136, 0.3);
            ">
                <h2 style="
                    font-size: 24px;
                    color: #00ff88;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                ">Add Tip</h2>
                
                <div class="drink-info" style="
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 25px;
                ">
                    <div id="drinkName" style="font-size: 18px; font-weight: 600; margin-bottom: 5px;"></div>
                    <div id="drinkPrice" style="font-size: 24px; color: #00ff88; font-weight: 700;"></div>
                </div>

                <div class="tip-options" style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 25px;
                " id="tipOptions">
                    <!-- Tip options will be inserted here -->
                </div>

                <div class="custom-tip" style="margin-bottom: 25px; display: none;" id="customTipSection">
                    <label style="display: block; color: #aaa; margin-bottom: 8px; font-size: 14px;">Custom Tip Amount</label>
                    <input type="number" id="customTipAmount" placeholder="0.00" step="0.01" min="0" style="
                        width: 100%;
                        padding: 12px;
                        background: #000;
                        border: 1px solid #333;
                        border-radius: 8px;
                        color: #fff;
                        font-size: 16px;
                        text-align: center;
                    ">
                </div>

                <div class="total-amount" style="
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid #00ff88;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 25px;
                ">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Drink:</span>
                        <span id="displayDrinkPrice">$0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Tip:</span>
                        <span id="displayTipAmount">$0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 700; color: #00ff88; border-top: 1px solid rgba(0, 255, 136, 0.3); padding-top: 8px;">
                        <span>Total:</span>
                        <span id="displayTotalAmount">$0.00</span>
                    </div>
                </div>

                <div class="tip-buttons" style="display: flex; gap: 12px;">
                    <button id="cancelTip" style="
                        flex: 1;
                        padding: 12px 24px;
                        background: transparent;
                        border: 1px solid #333;
                        color: #666;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">Cancel</button>
                    <button id="confirmTip" style="
                        flex: 1;
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #00ff88, #00dd77);
                        border: none;
                        color: #000;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">Confirm Purchase</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setupTipModalEvents();
    }

    // Setup tip modal event handlers
    function setupTipModalEvents() {
        const modal = document.getElementById('tipModal');
        const cancelBtn = document.getElementById('cancelTip');
        const confirmBtn = document.getElementById('confirmTip');
        const customTipSection = document.getElementById('customTipSection');
        const customTipAmount = document.getElementById('customTipAmount');

        // Cancel button
        cancelBtn.addEventListener('click', closeTipModal);

        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeTipModal();
        });

        // Confirm button
        confirmBtn.addEventListener('click', function() {
            processTipPurchase();
        });

        // Custom tip amount input
        customTipAmount.addEventListener('input', function() {
            updateTipCalculation();
        });

        // Add hover effects
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 20px rgba(0, 255, 136, 0.3)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });
    }

    // Show tip modal
    function showTipModal(drinkType, drinkPrice) {
        const modal = document.getElementById('tipModal');
        const drinkName = document.getElementById('drinkName');
        const drinkPriceEl = document.getElementById('drinkPrice');
        const displayDrinkPrice = document.getElementById('displayDrinkPrice');
        
        // Set drink information
        drinkName.textContent = getDrinkDisplayName(drinkType);
        drinkPriceEl.textContent = `$${drinkPrice.toFixed(2)}`;
        displayDrinkPrice.textContent = `$${drinkPrice.toFixed(2)}`;
        
        // Store current drink data
        modal.dataset.drinkType = drinkType;
        modal.dataset.drinkPrice = drinkPrice;
        
        // Create tip options
        createTipOptions(drinkPrice);
        
        // Show modal
        modal.style.display = 'flex';
        updateTipCalculation();
    }

    // Create tip option buttons
    function createTipOptions(drinkPrice) {
        const tipOptions = document.getElementById('tipOptions');
        tipOptions.innerHTML = '';

        TIP_CONFIG.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'tip-option';
            button.dataset.percentage = option.percentage;
            
            if (option.percentage === 'custom') {
                button.innerHTML = `
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Custom</div>
                    <div style="font-size: 12px; color: #888;">Enter Amount</div>
                `;
            } else {
                const tipAmount = (drinkPrice * option.percentage) / 100;
                button.innerHTML = `
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${option.percentage}%</div>
                    <div style="font-size: 12px; color: #888;">$${tipAmount.toFixed(2)}</div>
                `;
            }
            
            button.style.cssText = `
                background: #111;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 15px;
                color: #fff;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            `;
            
            button.addEventListener('click', function() {
                selectTipOption(this);
            });
            
            button.addEventListener('mouseenter', function() {
                this.style.borderColor = '#00ff88';
                this.style.background = 'rgba(0, 255, 136, 0.1)';
            });
            
            button.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected')) {
                    this.style.borderColor = '#333';
                    this.style.background = '#111';
                }
            });
            
            tipOptions.appendChild(button);
        });
    }

    // Select tip option
    function selectTipOption(button) {
        // Remove previous selection
        document.querySelectorAll('.tip-option').forEach(btn => {
            btn.classList.remove('selected');
            btn.style.borderColor = '#333';
            btn.style.background = '#111';
        });
        
        // Add selection to clicked button
        button.classList.add('selected');
        button.style.borderColor = '#00ff88';
        button.style.background = 'rgba(0, 255, 136, 0.2)';
        
        const percentage = button.dataset.percentage;
        const customTipSection = document.getElementById('customTipSection');
        
        if (percentage === 'custom') {
            customTipSection.style.display = 'block';
            document.getElementById('customTipAmount').focus();
        } else {
            customTipSection.style.display = 'none';
            updateTipCalculation();
        }
    }

    // Update tip calculation
    function updateTipCalculation() {
        const modal = document.getElementById('tipModal');
        const drinkPrice = parseFloat(modal.dataset.drinkPrice);
        const selectedOption = document.querySelector('.tip-option.selected');
        const customTipAmount = document.getElementById('customTipAmount');
        const displayTipAmount = document.getElementById('displayTipAmount');
        const displayTotalAmount = document.getElementById('displayTotalAmount');
        
        let tipAmount = 0;
        
        if (selectedOption) {
            const percentage = selectedOption.dataset.percentage;
            
            if (percentage === 'custom') {
                tipAmount = parseFloat(customTipAmount.value) || 0;
            } else {
                tipAmount = (drinkPrice * parseFloat(percentage)) / 100;
            }
        }
        
        const totalAmount = drinkPrice + tipAmount;
        
        displayTipAmount.textContent = `$${tipAmount.toFixed(2)}`;
        displayTotalAmount.textContent = `$${totalAmount.toFixed(2)}`;
    }

    // Process tip purchase
    function processTipPurchase() {
        const modal = document.getElementById('tipModal');
        const drinkType = modal.dataset.drinkType;
        const drinkPrice = parseFloat(modal.dataset.drinkPrice);
        const selectedOption = document.querySelector('.tip-option.selected');
        const customTipAmount = document.getElementById('customTipAmount');
        
        let tipAmount = 0;
        let tipPercentage = 0;
        
        if (selectedOption) {
            const percentage = selectedOption.dataset.percentage;
            
            if (percentage === 'custom') {
                tipAmount = parseFloat(customTipAmount.value) || 0;
                tipPercentage = (tipAmount / drinkPrice) * 100).toFixed(1);
            } else {
                tipPercentage = parseFloat(percentage);
                tipAmount = (drinkPrice * tipPercentage) / 100;
            }
        }
        
        const totalAmount = drinkPrice + tipAmount;
        
        // Create purchase data
        const purchaseData = {
            drinkType: drinkType,
            drinkPrice: drinkPrice,
            tipAmount: tipAmount,
            tipPercentage: tipPercentage,
            totalAmount: totalAmount,
            timestamp: new Date().toISOString()
        };
        
        console.log('🍹 Processing drink purchase with tip:', purchaseData);
        
        // Show success message
        showTipSuccess(purchaseData);
        
        // Close modal
        closeTipModal();
        
        // Process payment (integrate with existing Stripe system)
        processDrinkPayment(purchaseData);
    }

    // Process drink payment with tip
    function processDrinkPayment(purchaseData) {
        // This would integrate with your existing Stripe payment system
        const paymentData = {
            amount: Math.round(purchaseData.totalAmount * 100), // Convert to cents
            currency: 'usd',
            description: `${getDrinkDisplayName(purchaseData.drinkType)} with ${purchaseData.tipPercentage}% tip`,
            metadata: {
                drinkType: purchaseData.drinkType,
                tipAmount: purchaseData.tipAmount,
                tipPercentage: purchaseData.tipPercentage,
                timestamp: purchaseData.timestamp
            }
        };
        
        console.log('💳 Processing payment:', paymentData);
        
        // Call existing payment function
        if (window.buyDrink) {
            // Modify the existing buyDrink function to include tip
            window.buyDrinkWithTip(paymentData);
        } else {
            console.log('Payment system not available - demo mode');
        }
    }

    // Show tip success message
    function showTipSuccess(purchaseData) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00dd77);
            color: #000;
            padding: 20px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 8px;">🍹 Drink Ordered!</div>
            <div style="font-size: 14px; margin-bottom: 4px;">${getDrinkDisplayName(purchaseData.drinkType)}: $${purchaseData.drinkPrice.toFixed(2)}</div>
            <div style="font-size: 14px; margin-bottom: 4px;">Tip (${purchaseData.tipPercentage}%): $${purchaseData.tipAmount.toFixed(2)}</div>
            <div style="font-size: 16px; font-weight: 700; border-top: 1px solid rgba(0,0,0,0.2); padding-top: 8px;">Total: $${purchaseData.totalAmount.toFixed(2)}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Close tip modal
    function closeTipModal() {
        const modal = document.getElementById('tipModal');
        modal.style.display = 'none';
        
        // Reset form
        document.querySelectorAll('.tip-option').forEach(btn => {
            btn.classList.remove('selected');
            btn.style.borderColor = '#333';
            btn.style.background = '#111';
        });
        
        document.getElementById('customTipSection').style.display = 'none';
        document.getElementById('customTipAmount').value = '';
    }

    // Get drink display name
    function getDrinkDisplayName(drinkType) {
        const names = {
            cocktail: 'Premium Cocktail',
            beer: 'Craft Beer',
            wine: 'House Wine',
            bottle: 'Premium Bottle',
            premium: 'Premium Drink'
        };
        return names[drinkType] || 'Drink';
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTipSystem);
    } else {
        initTipSystem();
    }

    // Export functions for global access
    window.SoundFactoryTips = {
        showTipModal,
        closeTipModal,
        processTipPurchase,
        initTipSystem
    };

})();



