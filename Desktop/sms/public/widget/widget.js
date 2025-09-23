(function(){
  const qs=(s)=>document.querySelector(s);
  const msg=qs('#smsw-msg');
  function setMsg(t,kind){ msg.textContent=t; msg.className='msg '+(kind||''); }

  const apiBase = (window.SMS_API_BASE || '').replace(/\/$/,'');
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
      await post('/api/send-code', { phone: phone.value.trim() });
      setMsg('Code sent. Check your SMS.','ok');
      step2.style.display='block';
    } catch(e){ setMsg(e.message,'err'); }
  });

  qs('#smsw-verify').addEventListener('click', async ()=>{
    setMsg('');
    try {
      const { ok, token, phone: p } = await post('/api/verify-code', { phone: phone.value.trim(), code: code.value.trim() });
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
