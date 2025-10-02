(function(){
  const qs=(s)=>document.querySelector(s);
  const msg=qs('#smsw-msg');
  function setMsg(t,kind){ msg.textContent=t; msg.className='msg '+(kind||''); }

  const apiBase = (window.SMS_API_BASE || '').replace(/\/$/,'');
  function normalizePhone(input){
    if(!input) return '';
    const s=String(input).trim();
    if(s.startsWith('+')) return s;
    const d=s.replace(/\D/g,'');
    if(d.length===10) return '+1'+d;
    if(d.length===11 && d.startsWith('1')) return '+'+d;
    return '+'+d;
  }
  function post(path, body){
    return fetch(`${apiBase}${path}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body: JSON.stringify(body||{})
    }).then(async r=>{ const data = await r.json().catch(()=>({})); if(!r.ok) throw new Error(data.error||r.statusText); return data; });
  }

  const phone=qs('#smsw-phone');
  const code=qs('#smsw-code');
  const step2=qs('#smsw-step2');

  qs('#smsw-send').addEventListener('click', async ()=>{
    setMsg('');
    try {
      await post('/api/send-code', { phone: normalizePhone(phone.value) });
      setMsg('Code sent. Check your SMS.','ok');
      step2.style.display='block';
    } catch(e){ setMsg(e.message,'err'); }
  });

  qs('#smsw-verify').addEventListener('click', async ()=>{
    setMsg('');
    try {
      const { ok, token, phone: p } = await post('/api/verify-code', { phone: normalizePhone(phone.value), code: code.value.trim() });
      if(ok){
        setMsg('Verified. You are logged in.','ok');
        // Store token in localStorage for host app consumption
        localStorage.setItem('sms_auth_token', token);
        localStorage.setItem('sms_auth_phone', p);
        window.dispatchEvent(new CustomEvent('sms-auth:login', { detail:{ token, phone:p } }));
      }
    } catch(e){ setMsg(e.message,'err'); }
  });
})();
