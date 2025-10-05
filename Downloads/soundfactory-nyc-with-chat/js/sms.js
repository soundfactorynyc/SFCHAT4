const SFSMS = {
    baseUrl: '/',

    configure(options = {}) {
        if (options.baseUrl) {
            this.baseUrl = options.baseUrl;
        }
    },

    async sendVerification(phone) {
        // Deprecated legacy path remapped to Twilio Verify send
        const response = await fetch(`${this.baseUrl}api/verify/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        if (!response.ok) {
            const err = await response.json().catch(()=>({}));
            throw new Error(err.error || 'Failed to send verification code');
        }
        return response.json();
    },

    async verifyCode(phone, code) {
        // Deprecated legacy path remapped to Twilio Verify check
        const response = await fetch(`${this.baseUrl}api/verify/check-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code })
        });
        if (!response.ok) {
            const err = await response.json().catch(()=>({}));
            throw new Error(err.error || 'Verification failed');
        }
        return response.json();
    }
};

window.SFSMS = SFSMS;
