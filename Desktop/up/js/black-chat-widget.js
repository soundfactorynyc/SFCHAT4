/* Black Chat Widget - minimal, embeddable, pins-aware
   Features:
   - Floating toggle button + compact black chat box
   - 4 style inputs that shape how messages "talk": tone, formality, brevity, emojis
   - WebSocket transport (ws://localhost:8080 by default)
   - Optional Firebase Realtime DB (enable via window.SF_FIREBASE)
   - Pin hooks: clicks/hover emit small system messages
*/
(function(){
  'use strict';

  // ---------- Config ----------
  const CFG = {
    wsUrl: 'ws://localhost:8080',
    maxMessages: 200,
    z: 20000,
    storageKey: 'sf:blackChat:settings'
  };

  // ---------- State ----------
  const state = {
    ws: null,
    authedUser: null, // { id, name, photo }
    settings: { tone:'chill', formality:'casual', brevity:'short', emojis:true },
    connected: false,
    msgQueue: [],
  };

  // Try to infer a user
  function getUser(){
    const you = (window.currentUser && (window.currentUser.id||window.currentUser.userId)) || 'guest_'+Math.random().toString(36).slice(2,7);
    const name = (window.currentUser && (window.currentUser.name||window.currentUser.username)) || 'You';
    const photo = (window.currentUser && (window.currentUser.photo||window.currentUser.profilePic)) || '';
    return { id:String(you), name:String(name), photo:String(photo) };
  }

  // ---------- Utilities ----------
  const el = (tag, cls, html) => { const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; };
  const clamp = (v,min,max)=>Math.min(max,Math.max(min,v));
  function saveSettings(){ try{ localStorage.setItem(CFG.storageKey, JSON.stringify(state.settings)); }catch(e){} }
  function loadSettings(){ try{ const s=localStorage.getItem(CFG.storageKey); if(s) state.settings = {...state.settings, ...JSON.parse(s)}; }catch(e){} }

  // Lightweight style transform
  function stylizeOutgoing(text){
    let t = (text||'').trim();
    if(!t) return t;

    // brevity
    if(state.settings.brevity==='short'){
      // limit to ~140 chars softly
      if (t.length>140) t = t.slice(0,137)+'…';
    } else if (state.settings.brevity==='long') {
      // allow as-is
    }

    // formality
    if(state.settings.formality==='casual'){
      t = t.replace(/\b(you)\b/ig,'ya').replace(/\b(are)\b/ig,"'re");
    } else if (state.settings.formality==='pro'){
      t = t.replace(/\b(yeah|ya|yep)\b/ig,'yes');
    }

    // tone and emojis
    const add = [];
    if(state.settings.tone==='hyped') add.push('🔥');
    if(state.settings.emojis){
      // add a mild emoji based on sentiment-ish
      if(/(love|great|amazing|wow|best|go|win|vibe|party)/i.test(t)) add.push('✨');
      if(/(drink|cheers|toast)/i.test(t)) add.push('🍹');
      if(/(drop|beat|music|song|dj)/i.test(t)) add.push('🎶');
    }
    if(add.length){ t = t + ' ' + add.join(' '); }

    // tone punctuation
    if(state.settings.tone==='hyped' && !/[!?]$/.test(t)) t = t + '!';

    return t;
  }

  // ---------- DOM: inject widget ----------
  function injectStyles(){
    const css = `
    .bcw-root{position:fixed;right:20px;bottom:20px;z-index:${CFG.z};font-family:-apple-system,system-ui,Segoe UI,Roboto,Arial}
    /* Re-enable selection/focus inside widget (global CSS disables it site-wide) */
    .bcw-root, .bcw-root *{
      -webkit-user-select: text; user-select: text; -webkit-touch-callout: default; caret-color: #fff;
    }
    .bcw-box{ pointer-events: auto; }
    .bcw-fab{width:56px;height:56px;border-radius:50%;background:#000;border:1px solid #222;color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.35)}
    .bcw-fab.active{outline:2px solid rgba(255,255,255,.15)}
    .bcw-box{position:absolute;right:0;bottom:70px;width:min(420px,92vw);height:60vh;max-height:600px;background:#000;border:1px solid #222;border-radius:14px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.45)}
    .bcw-box.active{display:flex}
    .bcw-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #222;background:#0a0a0a}
    .bcw-title{font-weight:800;font-size:13px;letter-spacing:.6px}
    .bcw-controls{display:flex;gap:8px}
    .bcw-chip{background:#0f0f0f;border:1px solid #2a2a2a;border-radius:10px;padding:6px 8px;color:#ddd;font-size:11px;display:flex;align-items:center;gap:6px}
    .bcw-body{flex:1;overflow:auto;padding:12px;background:#070707}
    .bcw-msg{display:flex;gap:8px;margin-bottom:10px}
  .bcw-msg .avatar{width:28px;height:28px;border-radius:50%;background:#1a1a1a;display:grid;place-items:center;font-size:11px;color:#aaa;flex-shrink:0;overflow:hidden}
  .bcw-msg .avatar img{width:100%;height:100%;object-fit:cover;display:block}
    .bcw-msg .bubble{max-width:75%;padding:10px 12px;border-radius:12px;background:#111;border:1px solid #222;color:#eee;font-size:13px}
    .bcw-msg.me .bubble{background:#111;border-color:#333}
    .bcw-msg.sys .bubble{background:#0b0b0b;border-color:#333;color:#cfc}
    .bcw-foot{padding:10px;border-top:1px solid #222;background:#0a0a0a;display:flex;gap:8px;align-items:end}
    .bcw-input{flex:1;background:#0f0f0f;border:1px solid #2a2a2a;border-radius:10px;color:#fff;padding:8px 10px;min-height:38px;max-height:96px;resize:none}
    .bcw-send{background:#111;border:1px solid #2a2a2a;color:#fff;border-radius:10px;height:38px;padding:0 12px;cursor:pointer}
    .bcw-settings{position:absolute;right:8px;top:46px;background:#050505;border:1px solid #222;border-radius:10px;padding:8px;display:none;gap:6px;color:#ddd}
    .bcw-settings.active{display:grid}
    .bcw-row{display:flex;align-items:center;gap:8px;justify-content:space-between}
    .bcw-select,.bcw-checkbox{background:#0f0f0f;border:1px solid #2a2a2a;color:#fff;border-radius:8px;padding:6px 8px}
    @media (max-width:480px){.bcw-box{width:96vw;height:60vh}}
    `;
    const style = el('style'); style.textContent = css; document.head.appendChild(style);
  }

  function buildUI(){
    const root = el('div','bcw-root');
    const fab = el('button','bcw-fab','💬');
    const box = el('div','bcw-box');
    const head = el('div','bcw-head');
    const title = el('div','bcw-title','SOUND FACTORY CHAT');
    const controls = el('div','bcw-controls');
    const settingsChip = el('button','bcw-chip',`⚙️ <span>Style</span>`);
    controls.appendChild(settingsChip);
    head.appendChild(title); head.appendChild(controls);

    const settings = el('div','bcw-settings');
    // 4 inputs
    const toneRow = el('div','bcw-row');
    toneRow.append(el('span',null,'Tone'), createSelect(['chill','hyped'],'tone'));
    const formRow = el('div','bcw-row');
    formRow.append(el('span',null,'Formality'), createSelect(['casual','neutral','pro'],'formality'));
    const brevRow = el('div','bcw-row');
    brevRow.append(el('span',null,'Brevity'), createSelect(['short','normal','long'],'brevity'));
    const emoRow = el('div','bcw-row');
    emoRow.append(el('span',null,'Emojis'), createCheckbox('emojis'));
    settings.append(toneRow,formRow,brevRow,emoRow);

    const body = el('div','bcw-body');
    const foot = el('div','bcw-foot');
    const input = el('textarea','bcw-input'); input.rows=1; input.placeholder='Say something…';
    const send = el('button','bcw-send','Send');
    foot.append(input, send);

    box.append(head, settings, body, foot);
    root.append(fab, box);
    document.body.appendChild(root);

    // interactions
    fab.addEventListener('click', ()=>{
      const open = !box.classList.contains('active');
      box.classList.toggle('active', open);
      fab.classList.toggle('active', open);
      if(open) input.focus();
    });
    settingsChip.addEventListener('click', (e)=>{
      e.stopPropagation();
      settings.classList.toggle('active');
    });
    document.addEventListener('click', (e)=>{
      if(!settings.contains(e.target) && e.target!==settingsChip) settings.classList.remove('active');
    });

    input.addEventListener('input', ()=>{
      input.style.height='auto';
      input.style.height = Math.min(96, input.scrollHeight)+ 'px';
    });

    send.addEventListener('click', ()=> doSend());
    input.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); doSend(); }
    });

    function doSend(){
      const raw = input.value.trim(); if(!raw) return;
      const styled = stylizeOutgoing(raw);
      appendMessage({kind:'me', text: styled, name: state.authedUser.name, photo: state.authedUser.photo});
      // send as raw + style meta, but carry styled text for demo
      sendWS({ type:'chat', userId: state.authedUser.id, name: state.authedUser.name, text: styled, ts: Date.now() });
      input.value=''; input.style.height='auto'; input.focus();
    }

    function appendMessage({kind='other', text, name, photo}){
      const row = el('div','bcw-msg'+(kind==='me'?' me':'')+(kind==='sys'?' sys':''));
      const av = el('div','avatar', (photo?'<img src="'+photo+'" alt=""/>': (kind==='sys'?'⚑': (name? name[0].toUpperCase():'?'))));
      const bub = el('div','bubble'); bub.textContent = text;
      row.append(av,bub); body.append(row); body.scrollTop = body.scrollHeight;
    }

    return { appendMessage };
  }

  function createSelect(options, key){
    const sel = el('select','bcw-select');
    options.forEach(opt=>{ const o=el('option'); o.value=opt; o.textContent=opt; sel.appendChild(o); });
    sel.value = state.settings[key] || options[0];
    sel.addEventListener('change', ()=>{ state.settings[key]=sel.value; saveSettings(); });
    return sel;
  }
  function createCheckbox(key){
    const wrap = el('label');
    const c = el('input','bcw-checkbox'); c.type='checkbox'; c.checked = !!state.settings[key];
    c.addEventListener('change', ()=>{ state.settings[key]=c.checked; saveSettings(); });
    wrap.append(c); return wrap;
  }

  // ---------- WebSocket ----------
  function connectWS(onMsg){
    try{
      const ws = new WebSocket(CFG.wsUrl);
      state.ws = ws;
      ws.addEventListener('open', ()=>{ state.connected=true; flushQueue(); });
      ws.addEventListener('close', ()=>{ state.connected=false; setTimeout(()=>connectWS(onMsg), 1500); });
      ws.addEventListener('message', (evt)=>{
        try{
          const msg = JSON.parse(evt.data);
          onMsg && onMsg(msg);
        }catch{}
      });
    }catch(e){ console.warn('[chat] ws failed', e); }
  }
  function sendWS(obj){
    const s = JSON.stringify(obj);
    if(state.connected && state.ws && state.ws.readyState===1){
      state.ws.send(s);
    } else {
      state.msgQueue.push(s);
    }
  }
  function flushQueue(){
    while(state.msgQueue.length && state.ws && state.ws.readyState===1){
      state.ws.send(state.msgQueue.shift());
    }
  }

  // ---------- Pins hooks ----------
  function hookPins(api){
    const lastEmit = new Map();
    const throttle = (key, ms=1200) => {
      const now = Date.now();
      const t = lastEmit.get(key)||0;
      if (now - t < ms) return false; lastEmit.set(key, now); return true;
    };
    // 1) Attempt to wrap EnhancedPinSystem addExternalPin
    if (window.pinSystem && typeof window.pinSystem.addExternalPin === 'function'){
      const orig = window.pinSystem.addExternalPin.bind(window.pinSystem);
      window.pinSystem.addExternalPin = function(opts){
        const pin = orig(opts);
        try{ attachPinEl(pin, opts); }catch{}
        return pin;
      }
    }
    // 2) MutationObserver for generic .pin or .map-pin elements
    const observer = new MutationObserver((muts)=>{
      for(const m of muts){
        m.addedNodes && m.addedNodes.forEach(n=>{
          if(!(n instanceof HTMLElement)) return;
          if(n.classList && (n.classList.contains('pin') || n.classList.contains('map-pin'))){
            attachPinEl(n, {});
          }
          n.querySelectorAll && n.querySelectorAll('.pin,.map-pin').forEach(x=>attachPinEl(x,{}));
        });
      }
    });
    observer.observe(document.body, {childList:true, subtree:true});

    function attachPinEl(el, meta){
      if (el.__bcwAttached) return; el.__bcwAttached = true;
      const name = (meta && (meta.ownerName||meta.name)) || el.getAttribute('data-owner') || 'Guest';
      el.addEventListener('mouseenter', ()=> {
        if (!throttle('near:'+name)) return;
        const text = `👀 Near ${name}`;
        api.appendMessage({kind:'sys', text, name:'system'});
        sendWS({ type:'system', text, ts: Date.now() });
      });
      el.addEventListener('click', ()=> {
        if (!throttle('like:'+name)) return;
        const text = `❤️ Liked ${name}`;
        api.appendMessage({kind:'sys', text, name:'system'});
        sendWS({ type:'system', text, ts: Date.now() });
      });
    }
  }

  // ---------- Init ----------
  function init(){
    loadSettings(); injectStyles();
    state.authedUser = getUser();
    const api = buildUI();

    // WS connect
    connectWS((msg)=>{
      if(msg && msg.type==='chat' && msg.userId!==state.authedUser.id){
        api.appendMessage({kind:'other', text: msg.text, name: msg.name||'Guest' });
      }
      if(msg && msg.type==='system'){
        api.appendMessage({kind:'sys', text: msg.text, name:'system'});
      }
    });

    // Pin hooks
    hookPins(api);

    // Public API
    window.BlackChatAPI = {
      postSystem(text){ api.appendMessage({kind:'sys', text, name:'system'}); },
      send(text){
        const styled = stylizeOutgoing(text);
        api.appendMessage({kind:'me', text: styled, name: state.authedUser.name});
        sendWS({ type:'chat', userId: state.authedUser.id, name: state.authedUser.name, text: styled, ts: Date.now() });
      },
      setSettings(partial){ Object.assign(state.settings, partial||{}); saveSettings(); }
    };
  }

  // Auto-init
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
