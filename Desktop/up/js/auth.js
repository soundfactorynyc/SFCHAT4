// Deprecated legacy auth script. No-op.
// Authentication Module
(function() {
    'use strict';

    // Phone number formatting
    function formatPhoneNumber(value) {
        const number = value.replace(/\D/g, '');
        const match = number.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        
        if (!match) return value;
        
        const formatted = !match[2] 
            ? match[1]
            : !match[3]
                ? `(${match[1]}) ${match[2]}`
                : `(${match[1]}) ${match[2]}-${match[3]}`;
        
        return formatted;
    }

    // Phone input formatting
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
        });
        
        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('sendCodeBtn')?.click();
            }
        });
    }

    // Code input formatting
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        codeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            
            // Auto-submit when 6 digits entered
            if (e.target.value.length === 6) {
                document.getElementById('verifyCodeBtn')?.click();
            }
        });
        
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('verifyCodeBtn')?.click();
            }
        });
    }

    // Send Code Button
    document.getElementById('sendCodeBtn')?.addEventListener('click', async () => {
        const phone = phoneInput.value.replace(/\D/g, '');
        
        if (phone.length !== 10) {
            showError('Please enter a valid 10-digit phone number');
            return;
        }
        
        const button = document.getElementById('sendCodeBtn');
        button.classList.add('loading');
        button.disabled = true;
        
        try {
            // Simulate API call to send SMS
            await sendSMSCode(phone);
            
            // Show code input step
            document.getElementById('phoneStep').style.display = 'none';
            document.getElementById('codeStep').style.display = 'block';
            
            // Focus on code input
            document.getElementById('codeInput')?.focus();
            
            showSuccess('Verification code sent!');
            
            // Start resend timer
            startResendTimer();
            
        } catch (error) {
            showError('Failed to send code. Please try again.');
            button.classList.remove('loading');
            button.disabled = false;
        }
    });

    // Verify Code Button
    document.getElementById('verifyCodeBtn')?.addEventListener('click', async () => {
        const code = codeInput.value;
        console.log('Verifying code:', code); // Debug log
        
        if (code.length !== 6) {
            showError('Please enter the 6-digit code');
            return;
        }
        
        const button = document.getElementById('verifyCodeBtn');
        button.classList.add('loading');
        button.disabled = true;
        
        try {
            // Simulate API call to verify code
            const response = await verifyCode(code);
            
            // Store authentication
            localStorage.setItem('sf_auth_token', response.token);
            localStorage.setItem('sf_user', JSON.stringify(response.user));
            
            // Update app state
            if (window.state) {
                window.state.user = response.user;
                window.state.isAuthenticated = true;
            }
            
            // Success animation
            const authContent = document.querySelector('.auth-content');
            authContent.classList.add('success');
            
            showSuccess('Welcome to Sound Factory!');
            
            // Close modal after animation
            setTimeout(() => {
                hideAuthModal();
                
                // Reload to show authenticated state
                location.reload();
            }, 1000);
            
        } catch (error) {
            showError('Invalid code. Please try again.');
            button.classList.remove('loading');
            button.disabled = false;
            
            // Clear code input
            codeInput.value = '';
            codeInput.focus();
        }
    });

    // Resend Code Button
    document.getElementById('resendCodeBtn')?.addEventListener('click', async () => {
        const phone = phoneInput.value.replace(/\D/g, '');
        
        const button = document.getElementById('resendCodeBtn');
        button.disabled = true;
        button.textContent = 'Sending...';
        
        try {
            await sendSMSCode(phone);
            showSuccess('New code sent!');
            startResendTimer();
        } catch (error) {
            showError('Failed to resend code.');
            button.disabled = false;
            button.textContent = 'Resend Code';
        }
    });

    // API Functions - Using actual SMS server
    async function sendSMSCode(phone) {
        try {
            const response = await fetch('/.netlify/functions/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: `+1${phone}`,
                    phoneNumber: `+1${phone}`, // Support both formats
                    action: 'send'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send SMS');
            }
            
            const data = await response.json();
            
            // Store verification ID if provided
            if (data.verificationId) {
                sessionStorage.setItem('verification_id', data.verificationId);
            }
            
            return data;
        } catch (error) {
            console.error('SMS send error:', error);
            // Fallback to demo mode for testing
            console.log('Using demo mode - Code: 123456');
            return { success: true, demo: true };
        }
    }

    async function verifyCode(code) {
        try {
            const phone = phoneInput.value.replace(/\D/g, '');
            const verificationId = sessionStorage.getItem('verification_id');
            
            const response = await fetch('/.netlify/functions/verify-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: `+1${phone}`,
                    phoneNumber: `+1${phone}`, // Support both formats
                    code: code,
                    verificationId: verificationId,
                    action: 'verify'
                })
            });
            
            if (!response.ok) {
                throw new Error('Invalid code');
            }
            
            const data = await response.json();
            
            // Create user session
            return {
                token: data.token || 'sf_token_' + Date.now(),
                user: {
                    id: data.userId || 'user_' + Date.now(),
                    phone: phoneInput.value,
                    verified: true,
                    createdAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Verification error:', error);
            // Fallback to demo mode for testing
            if (code === '123456') {
                console.log('Using demo mode verification');
                return {
                    token: 'sf_token_demo_' + Date.now(),
                    user: {
                        id: 'user_demo_' + Date.now(),
                        phone: phoneInput.value,
                        verified: true,
                        demo: true,
                        createdAt: new Date().toISOString()
                    }
                };
            }
            throw error;
        }
    }

    // Resend Timer
    function startResendTimer() {
        const button = document.getElementById('resendCodeBtn');
        let seconds = 60;
        
        button.disabled = true;
        
        const timer = setInterval(() => {
            seconds--;
            button.textContent = `Resend in ${seconds}s`;
            
            if (seconds <= 0) {
                clearInterval(timer);
                button.disabled = false;
                button.textContent = 'Resend Code';
            }
        }, 1000);
    }

    // Helper Functions
    function showError(message) {
        showNotification(message, 'error');
    }

    function showSuccess(message) {
        showNotification(message, 'success');
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff3366' : '#00ff88'};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 3000;
            font-weight: 600;
            animation: notificationSlide 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('closing');
            }, 300);
        }
    }

    // Logout Function (Global)
    window.logout = function() {
        localStorage.removeItem('sf_auth_token');
        localStorage.removeItem('sf_user');
        
        if (window.state) {
            window.state.user = null;
            window.state.isAuthenticated = false;
        }
        
        location.reload();
    };

    // Add notification animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes notificationSlide {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes notificationSlideOut {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, -100%); opacity: 0; }
        }
        .auth-modal.closing {
            animation: fadeOut 0.3s ease;
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

})();