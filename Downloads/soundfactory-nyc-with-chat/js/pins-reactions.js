
let selectedType = null;
let selectedColor = null;
let pendingPosition = null;
let selectedImage = null;
const pins = [];
let currentMode = 'explore';

class ReactionSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.reactions = [];
        this.particles = [];
        this.scaleFactor = 0.6;
        this.speedMultiplier = 1.0;
        this.effectMode = 'classic';
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
    }
    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
        if (window.showToast) window.showToast(`⚡ Speed: ${multiplier}x`);
    }
    setEffect(mode) {
        this.effectMode = mode;
        const names = { classic: 'Classic', bouncy: 'Bouncy', explosive: 'Explosive' };
        if (window.showToast) window.showToast(`✨ Effect: ${names[mode] || mode}`);
    }
    resizeCanvas(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    triggerReaction(type, data={}){
        const x = data.x ?? (window.innerWidth/2);
        const y = data.y ?? (window.innerHeight - 100);
        if (type === 'money') return this.createMoneyReaction(x,y,data.amount||1);
        if (type === 'heel') return this.createHeelReaction(x,y);
        if (type === 'pride') return this.createPrideReaction(x,y);
        if (type === 'text') return this.createTextReaction(x,y,data.text||'WERK');
        if (type === 'emoji') return this.createEmojiReaction(x,y,data.emoji||'❤️', data.emojiType||'love');
    }
    createEmojiReaction(x,y,emoji,type){
        const speed = this.speedMultiplier;
        const effectMult = this.effectMode === 'explosive' ? 1.5 : this.effectMode === 'bouncy' ? 0.8 : 1.0;
        const grav = this.effectMode === 'bouncy' ? 0.3 : 0.5;
        this.reactions.push({ x,y, vx:(Math.random()-0.5)*10*speed*effectMult, vy:(-20-Math.random()*10)*speed*effectMult, emoji, type, size:30*this.scaleFactor, opacity:1, gravity:grav*speed });
        const particleCount = this.effectMode === 'explosive' ? 12 : 5;
        for(let i=0;i<particleCount;i++) this.particles.push({ x,y, vx:(Math.random()-0.5)*5*speed*effectMult, vy:(Math.random()-0.5)*5*speed*effectMult, size:Math.random()*3+1, color:this.getReactionColor(type), life:1, decay:0.02/speed });
    }
    createMoneyReaction(x,y,amount){
        const speed = this.speedMultiplier;
        const effectMult = this.effectMode === 'explosive' ? 1.8 : this.effectMode === 'bouncy' ? 0.7 : 1.0;
        const grav = this.effectMode === 'bouncy' ? 0.4 : 0.6;
        this.reactions.push({ x,y, vx:(Math.random()-0.5)*8*speed*effectMult, vy:(-25-Math.random()*10)*speed*effectMult, amount, type:'money', size:40*this.scaleFactor, opacity:1, rotation:0, rotationSpeed:(Math.random()-0.5)*0.3*speed, gravity:grav*speed });
        const particleCount = this.effectMode === 'explosive' ? 20 : 10;
        for(let i=0;i<particleCount;i++) this.particles.push({ x,y, vx:(Math.random()-0.5)*10*speed*effectMult, vy:(Math.random()-0.5)*10*speed*effectMult, size:Math.random()*4+2, color:'#FFD700', life:1, decay:0.015/speed, sparkle:true });
    }
    createTextReaction(x,y,text){
        const speed = this.speedMultiplier;
        const effectMult = this.effectMode === 'explosive' ? 1.5 : this.effectMode === 'bouncy' ? 0.8 : 1.0;
        const grav = this.effectMode === 'bouncy' ? 0.3 : 0.5;
        this.reactions.push({ x,y, vx:(Math.random()-0.5)*12*speed*effectMult, vy:(-22-Math.random()*8)*speed*effectMult, text, type:'text', size:25*this.scaleFactor, opacity:1, rotation:0, rotationSpeed:(Math.random()-0.5)*0.2*speed, gravity:grav*speed, color:this.getTextColor(text) });
    }
    createHeelReaction(x,y){
        const speed = this.speedMultiplier;
        const effectMult = this.effectMode === 'explosive' ? 1.6 : this.effectMode === 'bouncy' ? 0.8 : 1.0;
        const grav = this.effectMode === 'bouncy' ? 0.3 : 0.5;
        this.reactions.push({ x,y, vx:(Math.random()-0.5)*15*speed*effectMult, vy:(-25-Math.random()*10)*speed*effectMult, type:'heel', size:35*this.scaleFactor, opacity:1, rotation:0, rotationSpeed:(Math.random()-0.5)*0.4*speed, gravity:grav*speed });
        const particleCount = this.effectMode === 'explosive' ? 16 : 8;
        for(let i=0;i<particleCount;i++) this.particles.push({ x,y, vx:(Math.random()-0.5)*8*speed*effectMult, vy:(Math.random()-0.5)*8*speed*effectMult, size:Math.random()*3+1, color:'#ff1493', life:1, decay:0.02/speed, sparkle:true });
    }
    createPrideReaction(x,y){
        const speed = this.speedMultiplier;
        const effectMult = this.effectMode === 'explosive' ? 1.7 : this.effectMode === 'bouncy' ? 0.8 : 1.0;
        const grav = this.effectMode === 'bouncy' ? 0.3 : 0.5;
        this.reactions.push({ x,y, vx:(Math.random()-0.5)*10*speed*effectMult, vy:(-20-Math.random()*10)*speed*effectMult, type:'pride', size:40*this.scaleFactor, opacity:1, rotation:0, rotationSpeed:(Math.random()-0.5)*0.15*speed, gravity:grav*speed });
        const cols=['#e40303','#ff8c00','#ffed00','#008026','#004cff','#750787'];
        const repeats = this.effectMode === 'explosive' ? 2 : 1;
        for(let r=0;r<repeats;r++) cols.forEach(c=>this.particles.push({ x,y, vx:(Math.random()-0.5)*6*speed*effectMult, vy:(Math.random()-0.5)*6*speed*effectMult, size:Math.random()*4+2, color:c, life:1, decay:0.018/speed }));
    }
    getReactionColor(type){
        const colors={ love:'#ff006e', fire:'#ff6b35', laugh:'#ffbe0b', party:'#8338ec' };
        return colors[type]||'#ffffff';
    }
    getTextColor(text){
        const colors={ 'WERK':'#ff00ff', 'SF':'#00ffff', 'JP':'#ffd700' };
        return colors[text]||'#ffffff';
    }
    draw(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(let i=this.particles.length-1;i>=0;i--){
            const p=this.particles[i];
            if(p.life<=0){ this.particles.splice(i,1); continue; }
            this.ctx.save(); this.ctx.globalAlpha=p.life;
            if(p.sparkle){ const s=p.size*(1+Math.sin(Date.now()*0.01)*0.3); this.ctx.fillStyle=p.color; this.drawStar(p.x,p.y,4,s,s/2); }
            else{ this.ctx.beginPath(); this.ctx.arc(p.x,p.y,p.size,0,Math.PI*2); this.ctx.fillStyle=p.color; this.ctx.fill(); }
            this.ctx.restore(); p.x+=p.vx; p.y+=p.vy; p.vy+=0.3; p.life-=p.decay;
        }
        for(let i=this.reactions.length-1;i>=0;i--){
            const r=this.reactions[i];
            if(r.opacity<=0 || r.y>this.canvas.height){ this.reactions.splice(i,1); continue; }
            this.ctx.save(); this.ctx.translate(r.x,r.y); this.ctx.rotate(r.rotation||0); this.ctx.globalAlpha=r.opacity;
            if(r.type==='money'){
                const g=this.ctx.createLinearGradient(-r.size/2,0,r.size/2,0); g.addColorStop(0,'#85bb65'); g.addColorStop(0.5,'#a5d6a7'); g.addColorStop(1,'#85bb65');
                this.ctx.fillStyle=g; this.ctx.fillRect(-r.size/2,-r.size/4,r.size,r.size/2);
                this.ctx.fillStyle='#2a5434'; this.ctx.font=`bold ${r.size/3}px Arial`; this.ctx.textAlign='center'; this.ctx.textBaseline='middle'; this.ctx.fillText(`$${r.amount}`,0,0);
                r.rotation += r.rotationSpeed;
            } else if (r.type==='heel'){
                this.ctx.font=`${r.size}px Arial`; this.ctx.textAlign='center'; this.ctx.textBaseline='middle'; this.ctx.fillText('👠',0,0); r.rotation+=r.rotationSpeed;
            } else if (r.type==='pride'){
                this.ctx.font=`${r.size}px Arial`; this.ctx.textAlign='center'; this.ctx.textBaseline='middle'; this.ctx.fillText('🏳️‍🌈',0,0); r.rotation+=r.rotationSpeed;
            } else if (r.type==='text'){
                this.ctx.fillStyle=r.color; this.ctx.font=`bold ${r.size}px Arial`; this.ctx.textAlign='center'; this.ctx.textBaseline='middle'; this.ctx.shadowBlur=10; this.ctx.shadowColor=r.color; this.ctx.fillText(r.text,0,0); r.rotation+=r.rotationSpeed;
            } else {
                this.ctx.font=`${r.size}px Arial`; this.ctx.textAlign='center'; this.ctx.textBaseline='middle'; this.ctx.fillText(r.emoji,0,0);
            }
            this.ctx.restore(); r.x+=r.vx; r.y+=r.vy; r.vy+=r.gravity; r.vx*=0.99;
            if (r.y < r.size) r.vy = Math.abs(r.vy) * 0.5;
            if (r.x < r.size || r.x > this.canvas.width - r.size) r.vx = -r.vx * 0.8;
        }
    }
    drawStar(x,y,spikes,outer,inner){
        let rot=Math.PI/2*3; const step=Math.PI/spikes; this.ctx.beginPath(); this.ctx.moveTo(x, y-outer);
        for(let i=0;i<spikes;i++){ this.ctx.lineTo(x+Math.cos(rot)*outer, y+Math.sin(rot)*outer); rot+=step; this.ctx.lineTo(x+Math.cos(rot)*inner, y+Math.sin(rot)*inner); rot+=step; }
        this.ctx.lineTo(x, y-outer); this.ctx.closePath(); this.ctx.fill();
    }
    animate(){ this.draw(); requestAnimationFrame(()=>this.animate()); }
}

const MONEY_LINKS = {
    1: window.STRIPE_TIP_LINK_1 || '',
    5: window.STRIPE_TIP_LINK_5 || '',
    10: window.STRIPE_TIP_LINK_10 || ''
};

function handleMoneyTip(amount, e, reactions){
    const coords = { x: e.clientX, y: e.clientY };
    const onboarded = localStorage.getItem('sf_tip_onboarded') === '1';
    if (!onboarded){
        showTipOnboarding(amount, coords, reactions);
        return;
    }
    reactions.triggerReaction('money', { x: coords.x, y: coords.y, amount });
    showTipConfirm(amount, coords);
}

function showTipOnboarding(amount, coords, reactions){
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 10050;
        display: flex; align-items: center; justify-content: center; padding: 20px;`;
    const box = document.createElement('div');
    box.style.cssText = `
        width: min(90vw, 360px); background: #141414; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px; padding: 16px; color: #fff; box-shadow: 0 20px 60px rgba(0,0,0,0.6);`;
    box.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 8px; font-size: 16px;">Enable Tips</div>
        <div style="font-size: 12px; color: #bbb; margin-bottom: 12px;">Open Stripe to send your first $${amount} tip. After that, you can keep tipping with one tap.</div>
        <div style="display:flex; gap:8px;">
            <button id="tip-pay" style="flex:1; padding:10px; background:#00ff88; border:none; border-radius:10px; color:#000; font-weight:700; cursor:pointer;">Pay $${amount}</button>
            <button id="tip-done" style="flex:1; padding:10px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:10px; color:#fff; cursor:pointer;">Done</button>
        </div>`;
    modal.appendChild(box);
    document.body.appendChild(modal);

    const link = MONEY_LINKS[amount];
    document.getElementById('tip-pay').onclick = ()=>{
        if (!link) { if (window.showToast) window.showToast('Stripe link not configured'); return; }
        window.open(link, '_blank');
    };
    document.getElementById('tip-done').onclick = ()=>{
        localStorage.setItem('sf_tip_onboarded','1');
        try { document.body.removeChild(modal); } catch(_){}
        if (reactions) reactions.triggerReaction('money', { x: coords.x, y: coords.y, amount });
        showTipConfirm(amount, coords);
    };
}

function showTipConfirm(amount, coords){
    const pill = document.createElement('div');
    pill.style.cssText = `
        position: fixed; left: ${Math.min(window.innerWidth-200, Math.max(20, coords.x-60))}px; top: ${Math.max(60, coords.y-60)}px;
        background: rgba(0,0,0,0.9); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 8px 12px; z-index: 10060;
        display:flex; align-items:center; gap:8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);`;
    pill.innerHTML = `<span>Tip $${amount} now?</span>`;
    const btn = document.createElement('button');
    btn.textContent = 'Pay';
    btn.style.cssText = 'background:#00ff88; color:#000; border:none; padding:6px 10px; border-radius:14px; font-weight:700; cursor:pointer;';
    pill.appendChild(btn);
    document.body.appendChild(pill);
    const link = MONEY_LINKS[amount];
    btn.onclick = ()=>{
        if (!link) { if (window.showToast) window.showToast('Stripe link not configured'); return; }
        window.open(link, '_blank');
        try { pill.remove(); } catch(_){}
    };
    setTimeout(()=>{ try { pill.remove(); } catch(_){} }, 4000);
}

setTimeout(() => {
    const reactions = new ReactionSystem('reaction-canvas');
    const handler = (type, payload) => (e) => {
        reactions.triggerReaction(type, { x: e.clientX, y: e.clientY, ...payload });
    };

    const binds = [
        ['btn-love', handler('emoji', { emoji: '❤️', emojiType: 'love' })],
        ['btn-fire', handler('emoji', { emoji: '🔥', emojiType: 'fire' })],
        ['btn-laugh', handler('emoji', { emoji: '😂', emojiType: 'laugh' })],
        ['btn-party', handler('emoji', { emoji: '🎉', emojiType: 'party' })],
        ['btn-heel', handler('heel')],
        ['btn-pride', handler('pride')],
    ];
    binds.forEach(([id, fn]) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); });
}, 500);

function setDropMode(mode) {
    currentMode = mode;
    const btn = document.getElementById('btnDropPin');
    if (!btn) return;
    
    if (mode === 'drop') {
        btn.textContent = '❌ Cancel';
        btn.style.background = 'linear-gradient(135deg, #ff3333, #ff6666)';
        if (window.showToast) window.showToast('📍 Tap anywhere to drop a pin');
    } else {
        btn.textContent = '📍 DROP PIN';
        btn.style.background = 'linear-gradient(135deg, #ff0066, #ff3399)';
    }
}

function dropPin() {
    if (currentMode === 'drop') {
        setDropMode('explore');
        return;
    }
    setDropMode('drop');
}

document.addEventListener('click', (e) => {
    if (currentMode !== 'drop') return;
    if (e.target.closest('.bottom-layout') || e.target.closest('.pin-popup') || e.target.closest('.profile-hover')) return;
    
    pendingPosition = { x: e.clientX, y: e.clientY };
    setDropMode('explore');
    openPinPopup();
});

function openPinPopup() {
    const popup = document.getElementById('pinPopup');
    if (!popup) return;
    popup.style.display = 'flex';
    selectedType = null;
    selectedColor = null;
    selectedImage = null;
    
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.style.display = 'none';
}

function closePopup() {
    const popup = document.getElementById('pinPopup');
    if (popup) popup.style.display = 'none';
    pendingPosition = null;
}

function selectPinType(type) {
    selectedType = type;
    document.querySelectorAll('.pin-type-btn').forEach(btn => {
        btn.style.background = 'rgba(255,255,255,0.1)';
    });
    event.target.style.background = 'linear-gradient(135deg, #ff0066, #ff3399)';
}

function selectPinColor(color) {
    selectedColor = color;
    document.querySelectorAll('.pin-color-btn').forEach(btn => {
        btn.style.transform = 'scale(1)';
    });
    event.target.style.transform = 'scale(1.2)';
}

function uploadPinImage() {
    const input = document.getElementById('pinImageInput');
    if (!input) return;
    input.click();
}

if (typeof document !== 'undefined') {
    const imageInput = document.getElementById('pinImageInput');
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                selectedImage = event.target.result;
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.src = selectedImage;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

function confirmPin() {
    if (!pendingPosition) return;
    if (!selectedType && !selectedImage) {
        if (window.showToast) window.showToast('⚠️ Select a pin type or upload an image');
        return;
    }
    
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.left = pendingPosition.x + 'px';
    pin.style.top = pendingPosition.y + 'px';
    
    if (selectedColor) {
        pin.style.background = selectedColor;
    }
    
    const captionInput = document.getElementById('pinCaption');
    if (captionInput && captionInput.value) {
        pin.dataset.caption = captionInput.value;
        captionInput.value = '';
    }
    
    pin.dataset.type = selectedType || 'photo';
    
    if (selectedImage) {
        pin.dataset.image = selectedImage;
        pin.style.width = '12px';
        pin.style.height = '12px';
        pin.innerHTML = '<span style="position: absolute; top: -18px; left: -5px; font-size: 10px;">📷</span>';
    }
    
    attachPinHandlers(pin);
    
    pin.addEventListener('mouseenter', (e)=>{
        const title = pin.dataset.caption || `${pin.dataset.type} pin`;
        if (window.showProfileHoverNear) window.showProfileHoverNear(pin, { name: title, avatar: '📍' });
    });
    pin.addEventListener('mouseleave', ()=>{
        setTimeout(()=>{
            const hover = document.getElementById('profileHover');
            if (hover && !hover.matches(':hover')) {
                if (window.hideProfileHoverCard) window.hideProfileHoverCard();
            }
        }, 120);
    });
    
    document.getElementById('pinOverlay').appendChild(pin);
    pins.push(pin);
    const pc = document.getElementById('pinCount');
    if (pc) pc.textContent = pins.length;
    closePopup();
    if (window.showToast) window.showToast(selectedImage ? '📷 Photo pin dropped!' : '📍 Pin dropped!');
}

function attachPinHandlers(pin){
    pin.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pin.dataset.image) {
            showPinImage(pin);
        } else {
            const title = pin.dataset.caption || `${pin.dataset.type} pin`;
            if (window.showToast) window.showToast(`📍 ${title}`);
        }
    });
    
    pin.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (confirm('Delete this pin?')) deletePin(pin);
    });
    
    pin.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Delete this pin?')) deletePin(pin);
    });
    
    let holdTimer;
    pin.addEventListener('touchstart', (e) => {
        holdTimer = setTimeout(() => {
            if (confirm('Delete this pin?')) deletePin(pin);
        }, 600);
    });
    pin.addEventListener('touchend', () => clearTimeout(holdTimer));
    pin.addEventListener('touchmove', () => clearTimeout(holdTimer));
}

function deletePin(pin){
    try { pin.remove(); } catch(_){}
    const idx = pins.indexOf(pin);
    if (idx > -1) pins.splice(idx, 1);
    const pc = document.getElementById('pinCount');
    if (pc) pc.textContent = pins.length;
    if (window.showToast) window.showToast('🗑️ Pin deleted');
}

function showPinImage(pin) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 5000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = pin.dataset.image;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 10px;
        box-shadow: 0 0 30px rgba(255,0,102,0.5);
    `;
    
    const caption = document.createElement('div');
    caption.textContent = pin.dataset.caption || '';
    caption.style.cssText = `
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        padding: 10px 20px;
        background: rgba(0,0,0,0.8);
        border-radius: 20px;
        font-size: 14px;
    `;
    
    modal.appendChild(img);
    if (pin.dataset.caption) modal.appendChild(caption);
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
}

function setReactionSpeed(speed) {
    if (window.reactionSystem) {
        window.reactionSystem.setSpeed(speed);
    }
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'rgba(255,255,255,0.08)';
        btn.style.border = '1px solid rgba(255,255,255,0.2)';
        btn.style.color = 'white';
    });
    const activeBtn = document.querySelector(`.speed-btn[data-speed="${speed}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'rgba(0,255,136,0.2)';
        activeBtn.style.border = '1px solid rgba(0,255,136,0.5)';
        activeBtn.style.color = '#00ff88';
    }
}

function setReactionEffect(effect) {
    if (window.reactionSystem) {
        window.reactionSystem.setEffect(effect);
    }
    document.querySelectorAll('.effect-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'rgba(255,255,255,0.08)';
        btn.style.border = '1px solid rgba(255,255,255,0.2)';
        btn.style.color = 'white';
    });
    const activeBtn = document.querySelector(`.effect-btn[data-effect="${effect}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'rgba(0,255,136,0.2)';
        activeBtn.style.border = '1px solid rgba(0,255,136,0.5)';
        activeBtn.style.color = '#00ff88';
    }
}

window.dropPin = dropPin;
window.closePopup = closePopup;
window.selectPinType = selectPinType;
window.selectPinColor = selectPinColor;
window.uploadPinImage = uploadPinImage;
window.confirmPin = confirmPin;
window.currentMode = currentMode;
window.setReactionSpeed = setReactionSpeed;
window.setReactionEffect = setReactionEffect;
