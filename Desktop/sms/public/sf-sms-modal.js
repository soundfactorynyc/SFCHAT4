(function(){
  // Minimal styles can be loaded separately; see sf-sms-modal.css

  class SoundFactorySMSAuth {
    constructor(options = {}) {
      this.apiBase = (options.apiBase || 'https://seance.soundfactorynyc.com').replace(/\/$/, '');
      this.redirectAfterLogin = !!options.redirectAfterLogin;
      this.redirectUrl = options.redirectUrl || '/members';
      this.autoShowModal = options.autoShowModal !== false;
      this.requireAuth = options.requireAuth !== false;
      this.onAuthSuccess = typeof options.onAuthSuccess === 'function' ? options.onAuthSuccess : null;
      this.onAuthFailure = typeof options.onAuthFailure === 'function' ? options.onAuthFailure : null;

      // State
      this.isAuthenticated = false;
      this.authToken = null;
      this.userPhone = null;
      this.userId = null; // optional mapping in your app

      // Elements
      this.elements = {
        modal: null,
        phoneInput: null,
        codeInputs: null,
        sendCodeBtn: null,
        verifyCodeBtn: null,
        resendCodeBtn: null,
        phoneError: null,
        codeError: null,
        displayPhone: null,
        steps: {}
      };

      this.init();
    }

    init() {
      this.checkExistingAuth();
      this.setupElements();
      this.setupEventListeners();
      if (this.autoShowModal && !this.isAuthenticated && this.requireAuth) this.showAuthModal();
      document.dispatchEvent(new CustomEvent('sf:auth:init', { detail: { authenticated: this.isAuthenticated } }));
    }

    checkExistingAuth() {
      try {
        // Prefer cookie (server sets sf_token); fallback to localStorage if your app used it
        const hasCookie = document.cookie.split('; ').some(r=>r.startsWith('sf_token='));
        if (hasCookie) { this.isAuthenticated = true; return true; }
        const authData = localStorage.getItem('sf_auth_data');
        if (authData) {
          const data = JSON.parse(authData);
          if (data && data.token && data.phone && data.expiry > Date.now()) {
            this.isAuthenticated = true; this.authToken = data.token; this.userPhone = data.phone; this.userId = data.userId || null; return true;
          }
        }
      } catch {}
      this.clearAuth();
      return false;
    }

    clearAuth() {
      this.isAuthenticated = false; this.authToken = null; this.userPhone = null; this.userId = null;
      try { localStorage.removeItem('sf_auth_data'); localStorage.removeItem('smsVerified'); } catch {}
    }

    setupElements() {
      // If host page already has elements, wire them; otherwise created in modal
      this.elements.phoneInput = document.querySelector('[data-sf-phone]') || null;
      this.elements.codeInputs = document.querySelectorAll('.code-input');
      this.elements.sendCodeBtn = document.querySelector('[data-sf-send]') || null;
      this.elements.verifyCodeBtn = document.querySelector('[data-sf-verify]') || null;
      this.elements.resendCodeBtn = document.querySelector('#resendCodeBtn') || null;
    }

    setupEventListeners() {
      if (this.elements.sendCodeBtn) this.elements.sendCodeBtn.addEventListener('click', () => this.sendVerificationCode());
      if (this.elements.verifyCodeBtn) this.elements.verifyCodeBtn.addEventListener('click', () => this.verifyCode());
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); this.logout(); });
    }

    showAuthModal() {
      if (this.elements.modal) { this.elements.modal.style.display = 'flex'; return; }
      this.createAuthModal();
      this.elements.modal.style.display = 'flex';
    }

    createAuthModal() {
      const modal = document.createElement('div');
      modal.className = 'sms-modal-overlay';
      modal.id = 'smsModalOverlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="sms-modal" id="smsModal">
          <div class="sms-step active" id="step1">
            <div class="sms-modal-header">
              <h2 class="sms-modal-title">Verify Your Phone</h2>
              <p class="sms-modal-subtitle">Enter your phone number to continue</p>
            </div>
            <div class="sms-form-group">
              <label class="sms-label">Phone Number</label>
              <input type="tel" class="sms-input" placeholder="+1 (555) 123-4567" autocomplete="tel" data-sf-phone>
              <div class="sms-error-message" id="phoneError">Please enter a valid phone number</div>
            </div>
            <button class="sms-btn sms-btn-primary" data-sf-send>Send Verification Code</button>
          </div>
          <div class="sms-step" id="step2">
            <div class="sms-modal-header">
              <h2 class="sms-modal-title">Enter Verification Code</h2>
              <p class="sms-modal-subtitle">We sent a 6-digit code to <span id="displayPhone"></span></p>
            </div>
            <div class="sms-form-group">
              <label class="sms-label">Verification Code</label>
              <div class="verification-code-container">
                <input type="text" class="code-input" maxlength="1" inputmode="numeric" pattern="[0-9]">
                <input type="text" class="code-input" maxlength="1" inputmode="numeric" pattern="[0-9]">
                <input type="text" class="code-input" maxlength="1" inputmode="numeric" pattern="[0-9]">
                <input type="text" class="code-input" maxlength="1" inputmode="numeric" pattern="[0-9]">
                <input type="text" class="code-input" maxlength="1" inputmode="numeric" pattern="[0-9]">
                <input type="text" class="code-input" maxlength="1" inputmode="numeric" pattern="[0-9]">
              </div>
              <div class="sms-error-message" id="codeError">Invalid verification code</div>
            </div>
            <button class="sms-btn sms-btn-primary" data-sf-verify>Verify Code</button>
            <button class="sms-btn sms-btn-secondary" id="resendCodeBtn">Resend Code</button>
          </div>
          <div class="sms-step" id="step3">
            <div class="sms-modal-header">
              <h2 class="sms-modal-title">Verifying</h2>
              <p class="sms-modal-subtitle">Please wait…</p>
            </div>
            <div class="spinner"></div>
          </div>
          <div class="sms-step" id="step4">
            <div class="sms-modal-header">
              <h2 class="sms-modal-title">Verification Successful</h2>
              <p class="sms-modal-subtitle">You're verified</p>
            </div>
          </div>
        </div>`;

      document.body.appendChild(modal);

      // Bind elements
      this.elements.modal = modal;
      this.elements.phoneInput = modal.querySelector('[data-sf-phone]');
      this.elements.phoneError = modal.querySelector('#phoneError');
      this.elements.sendCodeBtn = modal.querySelector('[data-sf-send]');
      this.elements.displayPhone = modal.querySelector('#displayPhone');
      this.elements.codeInputs = modal.querySelectorAll('.code-input');
      this.elements.codeError = modal.querySelector('#codeError');
      this.elements.verifyCodeBtn = modal.querySelector('[data-sf-verify]');
      this.elements.resendCodeBtn = modal.querySelector('#resendCodeBtn');

      this.setupModalEventListeners();
    }

    setupModalEventListeners() {
      const formatDigits = (val)=> val.replace(/\D/g,'');
      if (this.elements.phoneInput) {
        this.elements.phoneInput.addEventListener('input', (e)=>{
          // Keep it simple: do not over-format; let server normalize
          e.target.value = e.target.value.replace(/[^\d+()\-\s]/g,'');
        });
      }

      if (this.elements.sendCodeBtn) this.elements.sendCodeBtn.addEventListener('click', ()=> this.sendVerificationCode());

      if (this.elements.codeInputs && this.elements.codeInputs.length) {
        this.elements.codeInputs.forEach((input, idx)=>{
          input.addEventListener('input', (e)=>{
            e.target.value = e.target.value.replace(/\D/g,'').slice(0,1);
            if (e.target.value && idx < this.elements.codeInputs.length - 1) this.elements.codeInputs[idx+1].focus();
          });
          input.addEventListener('keydown', (e)=>{
            if (e.key === 'Backspace' && !e.target.value && idx > 0) this.elements.codeInputs[idx-1].focus();
          });
        });
      }

      if (this.elements.verifyCodeBtn) this.elements.verifyCodeBtn.addEventListener('click', ()=> this.verifyCode());
      if (this.elements.resendCodeBtn) this.elements.resendCodeBtn.addEventListener('click', ()=>{
        this.sendVerificationCode(true);
        this.elements.resendCodeBtn.disabled = true;
        const t = this.elements.resendCodeBtn;
        const old = t.textContent;
        t.textContent = 'Code Sent!';
        setTimeout(()=>{ t.textContent = old; t.disabled = false; }, 3000);
      });
    }

    validatePhone(phone){ return String(phone||'').replace(/\D/g,'').length >= 10; }
    displayPhone(phone){ this.elements.displayPhone && (this.elements.displayPhone.textContent = phone); }
    getCode(){ return Array.from(this.elements.codeInputs||[]).map(i=>i.value||'').join(''); }

    async sendVerificationCode(isResend=false){
      const phone = this.elements.phoneInput?.value?.trim() || '';
      if (!this.validatePhone(phone)) {
        this.elements.phoneInput?.classList.add('error');
        this.elements.phoneError?.classList.add('visible');
        return;
      }
      this.elements.phoneInput?.classList.remove('error');
      this.elements.phoneError?.classList.remove('visible');

      this.userPhone = phone;
      this.displayPhone(phone);
      if (!isResend) {
        this.elements.steps.step1?.classList.remove('active');
        this.elements.steps.step2?.classList.add('active');
        this.elements.codeInputs?.[0]?.focus();
      } else {
        (this.elements.codeInputs||[]).forEach(i=> i.value = '');
      }

      try {
        const res = await fetch(`${this.apiBase}/api/send-code`, { method:'POST', headers:{ 'Content-Type':'application/json' }, credentials:'include', body: JSON.stringify({ phone }) });
        const data = await res.json().catch(()=>({}));
        if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to send code');
      } catch (err) {
        console.error('send-code error', err);
        this.onAuthFailure && this.onAuthFailure(err);
      }
    }

    async verifyCode(){
      const code = this.getCode();
      if (!code || code.length !== 6) { this.elements.codeError?.classList.add('visible'); return; }
      this.elements.codeError?.classList.remove('visible');
      this.elements.steps.step2?.classList.remove('active');
      this.elements.steps.step3?.classList.add('active');
      try {
        const res = await fetch(`${this.apiBase}/api/verify-code`, { method:'POST', headers:{ 'Content-Type':'application/json' }, credentials:'include', body: JSON.stringify({ phone: this.userPhone, code }) });
        const data = await res.json().catch(()=>({}));
        if (!res.ok || !data.ok) throw new Error(data.error || 'Invalid code');
        // success
        this.isAuthenticated = true;
        this.authToken = data.token;
        // also store for convenience (optional)
        try { localStorage.setItem('sf_auth_data', JSON.stringify({ token: data.token, phone: data.phone, userId: this.userId || null, expiry: Date.now()+3600*1000 })); } catch {}
        // show success
        this.elements.steps.step3?.classList.remove('active');
        this.elements.steps.step4?.classList.add('active');
        // fire event
        window.dispatchEvent(new CustomEvent('sf:auth', { detail: { token: data.token, phone: data.phone } }));
        if (this.onAuthSuccess) this.onAuthSuccess({ token: data.token, phone: data.phone });
        setTimeout(()=>{
          this.hideAuthModal();
          if (this.redirectAfterLogin) location.href = this.redirectUrl;
        }, 1200);
      } catch (err) {
        console.error('verify-code error', err);
        this.elements.steps.step3?.classList.remove('active');
        this.elements.steps.step2?.classList.add('active');
        this.elements.codeError && (this.elements.codeError.textContent = err.message || 'Invalid code');
        this.elements.codeError?.classList.add('visible');
        this.onAuthFailure && this.onAuthFailure(err);
      }
    }

    hideAuthModal(){ if (this.elements.modal) this.elements.modal.style.display = 'none'; }
    logout(){
      this.clearAuth();
      window.dispatchEvent(new CustomEvent('sf:logout'));
      location.href = 'index.html?logout=true';
    }
  }

  // Expose globally and auto-init if requested
  window.SoundFactorySMSAuth = SoundFactorySMSAuth;
  document.addEventListener('DOMContentLoaded', ()=>{
    if (window.SF_SMS_MODAL_AUTO_INIT !== false) {
      window.sfAuth = new SoundFactorySMSAuth({ apiBase: window.SMS_API_BASE || 'https://seance.soundfactorynyc.com', autoShowModal: true, requireAuth: true });
    }
  });
})();
