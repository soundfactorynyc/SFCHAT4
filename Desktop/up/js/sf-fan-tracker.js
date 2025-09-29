(() => {
  const API = '/.netlify/functions/fans';
  function parseUTM() {
    const p = new URLSearchParams(location.search);
    const keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
    const out = {};
    keys.forEach(k=>{ if (p.get(k)) out[k] = p.get(k); });
    return Object.keys(out).length ? out : null;
  }
  function refCode() {
    const p = new URLSearchParams(location.search);
    return p.get('ref') || null;
  }
  async function sendFan(payload) {
    try {
      await fetch(API, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    } catch (e) { console.warn('fans post failed', e); }
  }
  // Capture SMS auth success (from existing SMS auth modal integration)
  window.addEventListener('sf:auth', (e) => {
    try {
      const phone = e?.detail?.phone;
      const name = (JSON.parse(localStorage.getItem('sf_user')||'{}').name)||null;
      const email = (JSON.parse(localStorage.getItem('sf_user')||'{}').email)||null;
      const utm = parseUTM();
      const ref = refCode();
      const body = { phone, email, name, consent: true, source: 'sms' };
      if (utm) Object.assign(body, utm);
      if (ref) body.invite_code = ref;
      if (phone || email) sendFan(body);
    } catch {}
  });
  // Capture join.html form save fallback
  try {
    const joinUser = JSON.parse(localStorage.getItem('sf_join_user')||'null');
    if (joinUser && (joinUser.phone || joinUser.email)) {
      const body = { phone: joinUser.phone, email: joinUser.email, name: joinUser.name, consent: true, source: 'web' };
      const ref = refCode(); if (ref) body.invite_code = ref; else if (joinUser.inviteCode) body.invite_code = joinUser.inviteCode;
      const utm = parseUTM(); if (utm) Object.assign(body, utm);
      sendFan(body);
    }
  } catch {}
})();
