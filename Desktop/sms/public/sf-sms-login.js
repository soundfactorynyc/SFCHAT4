/* sf-sms-login.js
 * Drop-in SMS login wiring.
 * Usage in host app HTML:
 * <script src="https://<sms-site>.netlify.app/public/sf-sms-login.js"></script>
 * <input data-sf-phone placeholder="+15551234567">
 * <button data-sf-send>Send Code</button>
 * <input data-sf-code placeholder="123456">
 * <button data-sf-verify>Verify</button>
 * <pre data-sf-out></pre>
 * Optionally set window.SMS_API_BASE = 'https://<sms-site>.netlify.app' before this script.
 */
(function(){
  function $(sel){ return document.querySelector(sel); }
  function attr(sel){ return document.querySelector(`[data-sf-${sel}]`); }
  function msg(t){ const el = attr('out'); if(!el) return; el.textContent = typeof t==='string'?t:JSON.stringify(t,null,2); }

  // Normalize phone toward E.164 (basic US heuristics)
  function normalizePhone(input){
    if(!input) return '';
    const s = String(input).trim();
    if (s.startsWith('+')) {
      const d = s.slice(1).replace(/\D/g,'');
      // If user typed +########## (10 digits) assume US and prefix +1
      if (d.length === 10) return '+1'+d;
      return '+'+d;
    }
    const digits = s.replace(/\D/g,'');
    if (digits.length === 10) return '+1'+digits;
    if (digits.length === 11 && digits.startsWith('1')) return '+'+digits;
    return '+'+digits;
  }

  function apiBase(){
    // Prefer explicit override; else infer from script src origin
    if (window.SMS_API_BASE) return String(window.SMS_API_BASE).replace(/\/$/,'');
    try { return new URL(document.currentScript.src).origin; } catch(_) { return ''; }
  }

  async function post(path, body){
    const url = `${apiBase()}${path}`;
    const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, credentials:'include', body: JSON.stringify(body||{}) });
    const data = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.error || r.statusText);
    return data;
  }

  function setCookie(name, value, seconds){
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    const maxAge = seconds ? `; Max-Age=${seconds}` : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${maxAge}${secure}`;
  }

  function wire(){
    const phoneEl = attr('phone');
    const codeEl = attr('code');
    const sendBtn = attr('send');
    const verifyBtn = attr('verify');

    if (!phoneEl || !sendBtn) return; // require at least send flow

    sendBtn.addEventListener('click', async ()=>{
      msg('');
      try {
        await post('/api/send-code', { phone: normalizePhone(phoneEl.value) });
        msg({ ok:true, info:'Code sent' });
      } catch(e){ msg({ error: e.message }); }
    });

    if (verifyBtn && codeEl) {
      verifyBtn.addEventListener('click', async ()=>{
        msg('');
        try {
          const { ok, token, phone } = await post('/api/verify-code', { phone: normalizePhone(phoneEl.value), code: codeEl.value.trim() });
          if (ok) {
            setCookie('sf_token', token, 3600); // keep for 1h to match JWT
            window.dispatchEvent(new CustomEvent('sf:auth', { detail: { token, phone } }));
            msg({ ok:true, phone });
          } else {
            msg({ ok:false });
          }
        } catch(e){ msg({ error: e.message }); }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
