// Simplified SMS auth version (as requested). Advanced version stored in sms-auth-advanced.js
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
            sendBtn.disabled = true;
            showStatus('📱 Sending code...', 'info');
            try {
                const data = await SFSMS.sendVerification(phone);
                showStatus('✅ Code sent! Check your phone.', 'success');
                phoneDisplay.textContent = phone;
                phoneStep.style.display = 'none';
                codeStep.style.display = 'block';
                codeInput.focus();
                if (data.demo_code) console.log('Demo code:', data.demo_code);
            } catch (error) {
                showStatus('❌ ' + error.message, 'error');
                sendBtn.disabled = false;
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
                await SFSMS.verifyCode(phone, code);
                const sessionData = { phone: phone, verified: true, timestamp: Date.now() };
                localStorage.setItem('sf_user_session', JSON.stringify(sessionData));
                showStatus('✅ Welcome to Sound Factory NYC!', 'success');
                setTimeout(() => smsModal.classList.remove('active'), 1500);
            } catch (error) {
                showStatus('❌ ' + error.message, 'error');
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
    if (phoneInput) phoneInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });
    if (codeInput) codeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') verifyBtn.click(); });
}
if (window.SFSMS) { SFSMS.configure({ baseUrl: '/' }); }
window.initSMSAuth = initSMSAuth;
