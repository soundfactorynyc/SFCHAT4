/* Bind to existing modal (#authModal) and wire SMS login automatically.
 * Drop these two tags into your site and you're done (choose one style):
 * Absolute URLs (from your SMS site):
 *   <script src="https://sf-sms-service.netlify.app/public/sf-sms-login.js" defer></script>
 *   <script src="https://sf-sms-service.netlify.app/public/sms-bind-existing-modal.js" defer></script>
 * Or if you're hosting these files on the same site, use relative paths:
 *   <script src="/public/sf-sms-login.js" defer></script>
 *   <script src="/public/sms-bind-existing-modal.js" defer></script>
 */
(function(){
  function qs(s,c){return (c||document).querySelector(s);} 
  function hasCookie(name){ return document.cookie.split('; ').some(r=>r.startsWith(name+'=')); }
  function openAuthModal(){ const el = qs('#authModal'); if(!el) return; el.style.display='flex'; setTimeout(()=>el.classList.add('active'), 10); }
  function closeAuthModal(){ const el = qs('#authModal'); if(!el) return; el.classList.add('closing'); setTimeout(()=>{ el.style.display='none'; el.classList.remove('active','closing'); }, 300); }

  function ensureControls(){
    const host = qs('#authModal');
    if(!host) return;
    // If controls already present, do nothing
    if (qs('[data-sf-phone]', host) && qs('[data-sf-code]', host)) return;

    // Inject minimal controls
    const wrap = document.createElement('div');
    wrap.id = 'sms-auth';
    wrap.innerHTML = `
      <div style="max-width:520px;margin:0 auto;">
        <label style="display:block;margin:8px 0 4px;">Phone</label>
        <input data-sf-phone type="tel" placeholder="+15551234567" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;" />
        <div style="display:flex;gap:8px;align-items:center;margin:10px 0 0;">
          <button data-sf-send style="padding:10px 14px;border:0;background:#111;color:#fff;border-radius:6px;cursor:pointer;">Send Code</button>
        </div>
        <label style="display:block;margin:14px 0 4px;">Verification Code</label>
        <input data-sf-code type="text" placeholder="123456" maxlength="6" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;" />
        <div style="display:flex;gap:8px;align-items:center;margin:10px 0 0;">
          <button data-sf-verify style="padding:10px 14px;border:0;background:#111;color:#fff;border-radius:6px;cursor:pointer;">Verify</button>
        </div>
        <pre data-sf-out style="margin-top:12px;background:#111;color:#0f0;padding:10px;border-radius:6px;min-height:44px;white-space:pre-wrap;"></pre>
      </div>`;
    host.appendChild(wrap);
  }

  function gate(){ if(!hasCookie('sf_token')) openAuthModal(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>{ ensureControls(); gate(); });
  else { ensureControls(); gate(); }

  // Close on success
  window.addEventListener('sf:auth', function(){ closeAuthModal(); });
})();
