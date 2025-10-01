// Initialize SMS auth helpers and UI bindings
(function(){
  // If you have your own modal with id="authModal", the binder will inject inputs and open it.
  // Otherwise, you can switch to the popup variant by including the popup loader instead of the binder.

  // Example hook after successful auth
  window.addEventListener('sf:auth', (e)=>{
    const { phone } = e.detail || {};
    console.log('[SMS] Authenticated:', phone);
    // TODO: optionally notify your app backend with the token
    // fetch('/api/session', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token: e.detail.token }) });
  });
})();
