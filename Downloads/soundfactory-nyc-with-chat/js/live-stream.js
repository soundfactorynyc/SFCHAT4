let livestreamHLS = null;
let isStreamLive = false;

function playStream() {
    const video = document.getElementById('stream-video');
    const overlay = document.getElementById('stream-overlay');
    if (video) {
        video.play();
        overlay.style.display = 'none';
    }
}

function toggleStreamSize() {
    const container = document.getElementById('sf-live-stream');
    if (container) {
        container.classList.toggle('minimized');
    }
}

function scrollToStream() {
    const container = document.getElementById('sf-live-stream');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth' });
        container.classList.remove('minimized');
    }
}

function initLivestream(streamUrl) {
    if (!streamUrl) return;
    
    const container = document.getElementById('sf-live-stream');
    const video = document.getElementById('stream-video');
    const overlay = document.getElementById('stream-overlay');

    if (!container || !video) return;

    container.classList.add('is-live');
    isStreamLive = true;

    if (window.Hls && Hls.isSupported()) {
        livestreamHLS = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferLength: 10,
        });

        livestreamHLS.loadSource(streamUrl);
        livestreamHLS.attachMedia(video);

        livestreamHLS.on(Hls.Events.MANIFEST_PARSED, () => {
            video.muted = true;
            video.play().then(() => {
                if (overlay) overlay.style.display = 'none';
                if (window.showToast) showToast('🔴 Live stream started!');
            }).catch(() => {
                if (overlay) overlay.style.display = 'flex';
            });
        });

        livestreamHLS.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                console.error('HLS error:', data);
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        livestreamHLS.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        livestreamHLS.recoverMediaError();
                        break;
                    default:
                        stopLivestream();
                        break;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
            video.muted = true;
            video.play().then(() => {
                if (overlay) overlay.style.display = 'none';
                if (window.showToast) showToast('🔴 Live stream started!');
            }).catch(() => {
                if (overlay) overlay.style.display = 'flex';
            });
        });
    }
}

function stopLivestream() {
    isStreamLive = false;
    const container = document.getElementById('sf-live-stream');
    if (container) {
        container.classList.remove('is-live');
    }
    
    if (livestreamHLS) {
        livestreamHLS.destroy();
        livestreamHLS = null;
    }
    
    const video = document.getElementById('stream-video');
    if (video) {
        video.pause();
        video.src = '';
    }
}

function initStreamListener() {
    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!supabase) return;
    
    const streamChannel = supabase.channel('livestream_control');
    
    streamChannel.on('broadcast', { event: 'stream_status' }, ({ payload }) => {
        console.log('📡 Stream status update:', payload);
        
        if (payload.isLive && payload.streamUrl) {
            initLivestream(payload.streamUrl);
        } else {
            stopLivestream();
        }
    });
    
    streamChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('✅ Listening for livestream control from admin');
        }
    });
}

window.playStream = playStream;
window.toggleStreamSize = toggleStreamSize;
window.scrollToStream = scrollToStream;
window.initLivestream = initLivestream;
window.stopLivestream = stopLivestream;
window.initStreamListener = initStreamListener;
