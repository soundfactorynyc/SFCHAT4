function initSMSAuth() {
    const session = localStorage.getItem('sf_user_session');
    if (session) {
        const userData = JSON.parse(session);
        console.log('✅ User authenticated:', userData.phone);
        return;
    }

    const smsModal = document.getElementById('sms-modal');
    const phoneInput = document.getElementById('sms-phone-input');
    const sendBtn = document.getElementById('sms-send-btn');
    const verifyBtn = document.getElementById('sms-verify-btn');
    const backBtn = document.getElementById('sms-back-btn');
    const codeInput = document.getElementById('sms-code-input');
    const phoneStep = document.getElementById('sms-phone-step');
    const codeStep = document.getElementById('sms-code-step');
    const phoneDisplay = document.getElementById('sms-phone-display');
    const statusEl = document.getElementById('sms-status');

    if (smsModal) smsModal.classList.add('active');

    function showStatus(message, type) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.className = `sms-status ${type}`;
        statusEl.style.display = 'block';
        setTimeout(() => statusEl.style.display = 'none', 5000);
    }

    let cooldownTimer = null;
    const COOLDOWN_SECONDS = 45;
    function startCooldown() {
        let remaining = COOLDOWN_SECONDS;
        sendBtn.disabled = true;
        sendBtn.textContent = `Resend (${remaining})`;
        cooldownTimer = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(cooldownTimer);
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send Code';
            } else {
                sendBtn.textContent = `Resend (${remaining})`;
            }
        }, 1000);
    }

    async function sendCodeViaSupabase(phone) {
        const { getSupabaseClient } = window;
        if (!getSupabaseClient) throw new Error('Supabase client not initialized');
        const supa = getSupabaseClient();
        const { error } = await supa.auth.signInWithOtp({ phone });
        if (error) throw error;
    }

    async function sendCodeCustom(phone) {
        const data = await SFSMS.sendVerification(phone);
        if (data.demo_code) console.log('Demo code:', data.demo_code);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', async () => {
            let phone = phoneInput.value.trim();
            if (!phone) return showStatus('Please enter a phone number', 'error');

            if (!phone.startsWith('+')) {
                phone = phone.replace(/\D/g, '');
                if (phone.length === 10) phone = '+1' + phone;
                else if (phone.length === 11 && phone.startsWith('1')) phone = '+' + phone;
                else phone = '+1' + phone;
            }

            if (sendBtn.disabled) return; // Avoid double click during cooldown
            showStatus('📱 Sending code...', 'info');
            sendBtn.disabled = true;

            try {
                if (CONFIG.USE_SUPABASE_PHONE_OTP) {
                    await sendCodeViaSupabase(phone);
                } else {
                    await sendCodeCustom(phone);
                }
                showStatus('✅ Code sent! Check your phone.', 'success');
                phoneDisplay.textContent = phone;
                phoneStep.style.display = 'none';
                codeStep.style.display = 'block';
                codeInput.focus();
                startCooldown();
            } catch (error) {
                showStatus('❌ ' + (error.message || 'Failed to send'), 'error');
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send Code';
            }
        });
    }

    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            const code = codeInput.value.trim();
            const phone = phoneDisplay.textContent;
            if (!code || code.length !== 6) return showStatus('Please enter the 6-digit code', 'error');

            verifyBtn.disabled = true;
            showStatus('🔐 Verifying...', 'info');

            try {
                if (CONFIG.USE_SUPABASE_PHONE_OTP) {
                    const supa = window.getSupabaseClient();
                    const { data, error } = await supa.auth.verifyOtp({ phone, token: code, type: 'sms' });
                    if (error) throw error;
                    // Supabase returns a session & user
                    const sessionData = { phone, verified: true, supabaseUserId: data.user?.id, timestamp: Date.now() };
                    localStorage.setItem('sf_user_session', JSON.stringify(sessionData));
                } else {
                    await SFSMS.verifyCode(phone, code);
                    const sessionData = { phone, verified: true, timestamp: Date.now() };
                    localStorage.setItem('sf_user_session', JSON.stringify(sessionData));
                }
                showStatus('✅ Welcome to Sound Factory NYC!', 'success');
                setTimeout(() => smsModal.classList.remove('active'), 1200);
            } catch (error) {
                showStatus('❌ ' + (error.message || 'Verification failed'), 'error');
                verifyBtn.disabled = false;
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            codeStep.style.display = 'none';
            phoneStep.style.display = 'block';
            codeInput.value = '';
            sendBtn.disabled = false;
        });
    }

    if (phoneInput) phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    if (codeInput) codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyBtn.click();
    });
}

if (window.SFSMS) {
    SFSMS.configure({ baseUrl: '/' });
}

window.initSMSAuth = initSMSAuth;
