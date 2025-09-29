// social-media-embed.js - Make your livestream shareable on social media

class SocialMediaLiveShare {
  constructor(streamUrl, streamTitle = 'DJ Livestream') {
    this.streamUrl = streamUrl;
    this.streamTitle = streamTitle;
    this.isLive = true;
    this.viewerCount = 0;
    
    this.init();
  }

  init() {
    // Add meta tags for social sharing
    this.setupMetaTags();
    
    // Create share buttons
    this.createShareButtons();
    
    // Setup live preview generator
    this.setupLivePreview();
    
    // Setup deep linking
    this.setupDeepLinking();
  }

  // 1. Meta Tags for Rich Preview
  setupMetaTags() {
    // Open Graph tags (Facebook, LinkedIn)
    this.addMetaTag('og:title', `🔴 LIVE: ${this.streamTitle}`);
    this.addMetaTag('og:description', 'Join the live DJ set now! Epic beats and amazing vibes 🎵');
    this.addMetaTag('og:image', this.generateLivePreviewImage());
    this.addMetaTag('og:url', this.streamUrl);
    this.addMetaTag('og:type', 'video.other');
    this.addMetaTag('og:video', `${this.streamUrl}/embed`);
    this.addMetaTag('og:video:type', 'text/html');
    this.addMetaTag('og:video:width', '1280');
    this.addMetaTag('og:video:height', '720');
    
    // Twitter Card tags
    this.addMetaTag('twitter:card', 'player');
    this.addMetaTag('twitter:title', `🔴 LIVE: ${this.streamTitle}`);
    this.addMetaTag('twitter:description', 'Live DJ set happening now!');
    this.addMetaTag('twitter:player', `${this.streamUrl}/embed`);
    this.addMetaTag('twitter:player:width', '1280');
    this.addMetaTag('twitter:player:height', '720');
    this.addMetaTag('twitter:image', this.generateLivePreviewImage());
  }

  addMetaTag(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`) || 
                document.querySelector(`meta[name="${property}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property.startsWith('og:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  }

  // 2. Generate Live Preview Image
  generateLivePreviewImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0a0a15');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Live indicator
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(100, 100, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('LIVE', 150, 115);
    
    // Stream title
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.streamTitle, canvas.width / 2, canvas.height / 2);
    
    // Viewer count
    ctx.font = '36px Arial';
    ctx.fillText(`${this.viewerCount} watching now`, canvas.width / 2, canvas.height / 2 + 80);
    
    return canvas.toDataURL('image/png');
  }

  // 3. Create Share Buttons
  createShareButtons() {
    const shareContainer = document.createElement('div');
    shareContainer.className = 'social-share-buttons';
    shareContainer.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      display: flex;
      gap: 10px;
      z-index: 1000;
    `;

    const platforms = [
      {
        name: 'Facebook',
        icon: '📘',
        share: () => this.shareToFacebook()
      },
      {
        name: 'Twitter',
        icon: '🐦',
        share: () => this.shareToTwitter()
      },
      {
        name: 'Instagram',
        icon: '📷',
        share: () => this.shareToInstagram()
      },
      {
        name: 'TikTok',
        icon: '🎵',
        share: () => this.shareToTikTok()
      },
      {
        name: 'Copy Link',
        icon: '🔗',
        share: () => this.copyLink()
      }
    ];

    platforms.forEach(platform => {
      const button = document.createElement('button');
      button.innerHTML = platform.icon;
      button.title = `Share on ${platform.name}`;
      button.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s;
      `;
      
      button.addEventListener('click', platform.share);
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
      });
      
      shareContainer.appendChild(button);
    });

    document.body.appendChild(shareContainer);
  }

  // 4. Platform-Specific Sharing
  shareToFacebook() {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.streamUrl)}&quote=${encodeURIComponent('🔴 LIVE NOW: ' + this.streamTitle)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  shareToTwitter() {
    const text = `🔴 LIVE NOW: ${this.streamTitle}\n\nJoin the party! 🎵\n\n`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.streamUrl)}&hashtags=LiveDJ,DJStream,LiveMusic`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  shareToInstagram() {
    // Instagram doesn't allow direct URL sharing, but we can create a story-ready image
    this.generateStoryImage();
  }

  shareToTikTok() {
    // Generate a QR code for TikTok bio link
    this.generateQRCode();
  }

  copyLink() {
    const tempInput = document.createElement('input');
    tempInput.value = this.streamUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // Show notification
    this.showNotification('Link copied! 🔗');
  }

  // 5. Generate Story-Ready Image
  generateStoryImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(0.5, '#00ffff');
    gradient.addColorStop(1, '#ff00ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Live badge
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, canvas.width, 200);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔴 LIVE NOW', canvas.width / 2, 140);
    
    // Stream info
    ctx.font = 'bold 80px Arial';
    ctx.fillText(this.streamTitle, canvas.width / 2, canvas.height / 2);
    
    // Link
    ctx.font = '60px Arial';
    ctx.fillText('Link in Bio 👆', canvas.width / 2, canvas.height - 200);
    
    // Download the image
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dj-live-story.png';
      a.click();
      URL.revokeObjectURL(url);
    });
    
    this.showNotification('Story image saved! Share on Instagram 📷');
  }

  // 6. Generate QR Code
  generateQRCode() {
    const qrContainer = document.createElement('div');
    qrContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 2000;
      text-align: center;
    `;
    
    qrContainer.innerHTML = `
      <h3 style="color: black; margin-bottom: 20px;">Scan for Live Stream</h3>
      <div id="qrcode"></div>
      <p style="color: black; margin-top: 20px;">Add to TikTok bio!</p>
      <button onclick="this.parentElement.remove()" style="
        margin-top: 20px;
        padding: 10px 30px;
        background: #000;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
      ">Close</button>
    `;
    
    document.body.appendChild(qrContainer);
    
    // Generate QR code (using qrcode.js library)
    if (window.QRCode) {
      new QRCode(document.getElementById('qrcode'), {
        text: this.streamUrl,
        width: 256,
        height: 256
      });
    }
  }

  // 7. Live Embed Widget
  createEmbedCode() {
    const embedCode = `
<!-- DJ Livestream Embed -->
<iframe 
  src="${this.streamUrl}/embed"
  width="100%" 
  height="500"
  frameborder="0"
  allowfullscreen
  allow="autoplay; picture-in-picture"
  style="border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);"
></iframe>
<p style="text-align: center;">
  <a href="${this.streamUrl}" target="_blank" style="
    display: inline-block;
    padding: 10px 30px;
    background: linear-gradient(135deg, #ff00ff, #00ffff);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: bold;
  ">Join Live Stream 🔴</a>
</p>`;
    
    return embedCode;
  }

  // 8. Setup Deep Linking
  setupDeepLinking() {
    // Add schema for mobile apps
    this.addMetaTag('al:web:url', this.streamUrl);
    
    // iOS
    this.addMetaTag('al:ios:url', `djlive://stream/${this.getStreamId()}`);
    this.addMetaTag('al:ios:app_name', 'DJ Live');
    
    // Android
    this.addMetaTag('al:android:url', `djlive://stream/${this.getStreamId()}`);
    this.addMetaTag('al:android:app_name', 'DJ Live');
    this.addMetaTag('al:android:package', 'com.djlive.app');
  }

  getStreamId() {
    // Extract stream ID from URL
    return this.streamUrl.split('/').pop() || 'live';
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 18px;
      z-index: 3000;
      animation: fadeInOut 3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // 9. Auto-Update Preview
  updateLiveStatus(isLive, viewerCount) {
    this.isLive = isLive;
    this.viewerCount = viewerCount;
    
    // Update meta tags
    this.setupMetaTags();
    
    // Notify social platforms
    if (window.FB) {
      window.FB.XFBML.parse(); // Refresh Facebook embed
    }
  }
}

// Initialize
const liveShare = new SocialMediaLiveShare(
  window.location.href,
  'Epic DJ Set'
);

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
  }
`;
document.head.appendChild(style);

// Export for use
window.DJLiveShare = liveShare;


