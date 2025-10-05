// Minimal frontend helper for new Twilio Verify endpoints
// Provides functions: sendVerifyCode(phone), checkVerifyCode(phone, code)
// and a basic attachWidget(containerSelector)

async function sendVerifyCode(phone) {
  const res = await fetch('/api/verify/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send code');
  return data;
}

async function checkVerifyCode(phone, code) {
  const res = await fetch('/api/verify/check-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Verification failed');
  try { localStorage.setItem('sf_verify_session', JSON.stringify(data.session)); } catch {}
  return data;
}

export function mountSMSWidget(root) {
  if (!root) return;
  root.innerHTML = `
    <div class="sf-sms-widget">
      <input type="tel" placeholder="Phone" class="sfw-phone" />
      <button class="sfw-send">Send Code</button>
      <div class="sfw-code-row" style="margin-top:8px; display:none;">
        <input type="text" maxlength="10" placeholder="Code" class="sfw-code" />
        <button class="sfw-check">Verify</button>
      </div>
      <div class="sfw-status" style="margin-top:6px;font-size:12px;color:#666;"></div>
    </div>`;
  const phoneEl = root.querySelector('.sfw-phone');
  const sendBtn = root.querySelector('.sfw-send');
  const codeRow = root.querySelector('.sfw-code-row');
  const codeEl = root.querySelector('.sfw-code');
  const checkBtn = root.querySelector('.sfw-check');
  const statusEl = root.querySelector('.sfw-status');

  function setStatus(msg, ok=true) {
    statusEl.textContent = msg;
    statusEl.style.color = ok ? '#0a0' : '#c00';
  }

  sendBtn.addEventListener('click', async () => {
    const phone = phoneEl.value.trim();
    setStatus('Sending...');
    sendBtn.disabled = true;
    try {
      await sendVerifyCode(phone);
      codeRow.style.display = 'flex';
      setStatus('Code sent. Check your phone.');
      codeEl.focus();
    } catch (e) {
      setStatus(e.message, false);
    } finally {
      sendBtn.disabled = false;
    }
  });

  checkBtn.addEventListener('click', async () => {
    const phone = phoneEl.value.trim();
    const code = codeEl.value.trim();
    setStatus('Verifying...');
    checkBtn.disabled = true;
    try {
      await checkVerifyCode(phone, code);
      setStatus('Phone verified ✔');
    } catch (e) {
      setStatus(e.message, false);
    } finally {
      checkBtn.disabled = false;
    }
  });
}

// Provide global (optional)
window.SFVerify = { sendVerifyCode, checkVerifyCode, mountSMSWidget };