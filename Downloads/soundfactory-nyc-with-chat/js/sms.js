const SFSMS = {
    baseUrl: '/',
    
    configure(options) {
        if (options.baseUrl) {
            this.baseUrl = options.baseUrl;
        }
    },
    
    async sendVerification(phone) {
        const response = await fetch(`${this.baseUrl}.netlify/functions/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send verification code');
        }
        
        return await response.json();
    },
    
    async verifyCode(phone, code) {
        const response = await fetch(`${this.baseUrl}.netlify/functions/verify-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Verification failed');
        }
        
        return await response.json();
    }
};

window.SFSMS = SFSMS;
