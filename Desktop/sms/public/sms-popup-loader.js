/* SMS Popup Loader (single-file embed)
 * Drop one <script> tag on your site and this will:
 * - Load the SMS widget from this server
 * - Inject a branded popup modal
 * - Auto-open on page load if not verified
 *
 * Optional globals you can set BEFORE this script:
 *   window.SMS_LOGO_URL = 'https://your-site.com/path/logo.png'
 *   window.SMS_POPUP_REDIRECT = '/welcome'  // reload/redirect after verify
 */
(function(){
  function scriptBase(){
    try { return new URL(document.currentScript.src).origin; } catch(_) { return ''; }
  }
  function hasCookie(name){ return document.cookie.split('; ').some(r=>r.startsWith(name+'=')); }

  // 1) Load the SMS widget from the same origin as this loader
  (function loadWidget(){
    var s = document.createElement('script');
    s.src = scriptBase() + '/public/sf-sms-login.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  // 2) Inject styles
  var css = `:root{--sf-magenta:#ff2fd2;--sf-text:#e9e9f1;--sf-card:#0f0a1a}
  .sms-overlay{position:fixed;inset:0;background:radial-gradient(1200px 800px at 30% 20%, rgba(11,0,255,.25), transparent 60%),radial-gradient(1000px 700px at 70% 80%, rgba(255,47,210,.15), transparent 55%),rgba(3,0,10,.82);backdrop-filter:blur(2px);display:none;align-items:center;justify-content:center;z-index:99999}
  .sms-modal{width:min(560px,92vw);background:var(--sf-card);color:var(--sf-text);border:1px solid rgba(255,47,210,.35);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.55),0 0 40px rgba(11,0,255,.25) inset;overflow:hidden}
  .sms-header{padding:14px 16px;background:linear-gradient(180deg,#0c061a,#080313);color:var(--sf-magenta);font-weight:700;display:flex;align-items:center;justify-content:space-between;letter-spacing:.5px;border-bottom:1px solid rgba(255,47,210,.25)}
  .sms-brand{display:flex;align-items:center;gap:12px}
  .sms-logo{width:40px;height:40px;border-radius:8px;background:#000;display:grid;place-items:center;box-shadow:0 0 0 1px rgba(255,47,210,.4),0 0 20px rgba(255,47,210,.25)}
  .sms-title{font-size:16px;color:var(--sf-magenta);text-shadow:0 0 12px rgba(255,47,210,.45)}
  .sms-body{padding:18px}
  .sms-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
  .sms-row input{flex:1;min-width:200px;padding:12px 12px;background:#0c0718;color:var(--sf-text);border:1px solid rgba(255,47,210,.35);border-radius:8px;outline:none;transition:box-shadow .15s ease,border-color .15s ease}
  .sms-row input:focus{border-color:var(--sf-magenta);box-shadow:0 0 0 3px rgba(255,47,210,.18)}
  .sms-row button{padding:12px 16px;border:0;background:var(--sf-magenta);color:#14061f;font-weight:700;border-radius:8px;cursor:pointer;box-shadow:0 8px 22px rgba(255,47,210,.22)}
  .sms-row button:hover{filter:brightness(1.05) saturate(1.05)}
  .sms-out{margin-top:12px;background:#0b0814;color:#7bff7b;padding:12px;border:1px solid rgba(27,255,123,.25);border-radius:8px;min-height:44px;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:inset 0 0 24px rgba(0,0,0,.35)}
  `;
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // 3) Build modal markup
  var overlay = document.createElement('div');
  overlay.className = 'sms-overlay';
  overlay.innerHTML = '\n  <div class="sms-modal">\n    <div class="sms-header">\n      <div class="sms-brand">\n        <div class="sms-logo">\n          ' + (window.SMS_LOGO_URL ? ('<img src="'+window.SMS_LOGO_URL+'" alt="Logo" style="width:30px;height:30px;display:block" />') : ('\n          <svg width="30" height="30" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SF logo">\n            <rect x="0" y="0" width="64" height="64" rx="10" fill="#000"/>\n            <text x="8" y="45" fill="#fff" font-size="38" font-family="\'Times New Roman\', Georgia, serif" font-weight="700">SF<\/text>\n          <\/svg>\n          ')) + '\n        <\/div>\n        <div class="sms-title">Sound Factory Séance<\/div>\n      <\/div>\n    <\/div>\n    <div class="sms-body">\n      <div class="sms-row">\n        <input data-sf-phone type="tel" placeholder="+15551234567" />\n        <button data-sf-send>Send Code<\/button>\n      <\/div>\n      <div class="sms-row">\n        <input data-sf-code type="text" placeholder="123456" maxlength="6" />\n        <button data-sf-verify>Verify<\/button>\n      <\/div>\n      <pre data-sf-out class="sms-out">Please verify to access the site…<\/pre>\n    <\/div>\n  <\/div>';
  document.body.appendChild(overlay);

  function show(){ overlay.style.display = 'flex'; }
  function hide(){ overlay.style.display = 'none'; }

  function openIfNeeded(){ if (!hasCookie('sf_token')) show(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openIfNeeded); else openIfNeeded();

  // Close after successful auth and optionally redirect
  window.addEventListener('sf:auth', function(){
    hide();
    if (window.SMS_POPUP_REDIRECT) {
      try { window.location.assign(window.SMS_POPUP_REDIRECT); } catch(_) {}
    }
  });
})();
