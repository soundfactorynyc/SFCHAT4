/**
 * STAGE FIT
 * Perfect flyer display with aspect ratio management (contain/cover/zoom modes)
 */

window.StageFit = (() => {
  let canvas, ctx, currentImage = null, mode = 'contain';
  let ratio = 1, cw = 1080, ch = 1920;

  function init() {
    canvas = document.getElementById('gl');
    if (!canvas) {
      console.error('StageFit: canvas #gl not found.');
      return;
    }
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    console.log('✅ StageFit initialized');
  }

  function resizeCanvas() {
    if (!canvas) return;
    cw = canvas.clientWidth;
    ch = canvas.clientHeight;
    canvas.width = cw;
    canvas.height = ch;
    redraw();
  }

  async function setFlyerImage(src) {
    if (!ctx) init();
    try {
      const img = await loadImage(src);
      currentImage = img;
      redraw();
      console.log('✅ Flyer loaded:', src);
      return img;
    } catch (err) {
      console.error('❌ StageFit: Failed to load flyer image', err);
    }
  }

  function loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = typeof src === 'string' ? src : URL.createObjectURL(src);
    });
  }

  function redraw() {
    if (!ctx || !currentImage) return;
    ctx.clearRect(0, 0, cw, ch);
    const ir = currentImage.width / currentImage.height;
    const cr = cw / ch;
    let iw, ih, ix, iy;
    if (mode === 'contain') {
      if (ir > cr) {
        iw = cw; ih = cw / ir; ix = 0; iy = (ch - ih) / 2;
      } else {
        ih = ch; iw = ch * ir; iy = 0; ix = (cw - iw) / 2;
      }
    } else {
      iw = cw; ih = ch; ix = iy = 0;
    }
    ctx.drawImage(currentImage, ix, iy, iw, ih);
  }

  function setMode(m) {
    mode = m;
    redraw();
  }

  function draw() {
    // Alias for redraw
    redraw();
  }

  function addGlow(intensity = 0.4) {
    if (!canvas) return;
    
    const blur = Math.round(intensity * 50);
    const spread = Math.round(intensity * 30);
    const glowColor = `rgba(0, 255, 255, ${intensity})`;
    
    canvas.style.filter = `drop-shadow(0 0 ${blur}px ${glowColor})`;
    canvas.style.boxShadow = `0 0 ${blur}px ${spread}px ${glowColor}`;
    
    console.log(`✨ Canvas glow added: ${intensity}`);
  }

  return { 
    init, 
    setFlyerImage, 
    setMode, 
    redraw, 
    draw,
    addGlow,
    get canvas() { return canvas; },
    get ctx() { return ctx; },
    get currentImage() { return currentImage; },
    get flyerImage() { return currentImage; }
  };
})();
