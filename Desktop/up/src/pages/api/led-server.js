// LED Display Backend Server
// WebSocket server for controlling the LED display

export async function GET() {
  return new Response(JSON.stringify({
    message: 'LED Display Server API',
    endpoints: [
      'POST /api/led/clear',
      'POST /api/led/fill',
      'POST /api/led/pixel',
      'POST /api/led/pixels',
      'POST /api/led/rect',
      'POST /api/led/line',
      'POST /api/led/frame',
      'POST /api/led/text',
      'POST /api/led/stream',
      'POST /api/led/sound-factory'
    ]
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Clear display
export async function POST({ request }) {
  const url = new URL(request.url);
  const action = url.pathname.split('/').pop();
  
  try {
    const data = await request.json();
    
    switch (action) {
      case 'clear':
        return new Response(JSON.stringify({ 
          type: 'clear',
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'fill':
        const { color = 'white', brightness = 'bright' } = data;
        return new Response(JSON.stringify({ 
          type: 'fill', 
          color, 
          brightness,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'pixel':
        const { row, col, color: pixelColor = 'white', brightness: pixelBrightness = 'bright' } = data;
        return new Response(JSON.stringify({ 
          type: 'pixel', 
          row, 
          col, 
          color: pixelColor, 
          brightness: pixelBrightness,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'pixels':
        const { pixels } = data;
        return new Response(JSON.stringify({ 
          type: 'pixels', 
          data: pixels,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'rect':
        const { x, y, width, height, color: rectColor = 'white' } = data;
        return new Response(JSON.stringify({ 
          type: 'rect', 
          x, 
          y, 
          width, 
          height, 
          color: rectColor,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'line':
        const { x1, y1, x2, y2, color: lineColor = 'white' } = data;
        return new Response(JSON.stringify({ 
          type: 'line', 
          x1, 
          y1, 
          x2, 
          y2, 
          color: lineColor,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'frame':
        const { frame } = data;
        return new Response(JSON.stringify({ 
          type: 'frame', 
          data: frame,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'text':
        const { text, color: textColor = 'white', speed = 50 } = data;
        const frames = generateTextFrames(text, textColor);
        return new Response(JSON.stringify({ 
          type: 'animation', 
          frames, 
          fps: 1000 / speed,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'stream':
        const { frameData } = data;
        return new Response(JSON.stringify({ 
          type: 'frame', 
          data: frameData,
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'sound-factory':
        return new Response(JSON.stringify({ 
          type: 'sound-factory',
          success: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action',
          success: false 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Generate text frames (simplified)
function generateTextFrames(text, color) {
  // This would generate pixel data for scrolling text
  // Implementation depends on your font system
  const frames = [];
  
  // Simple implementation - create frames with text pattern
  for (let i = 0; i < text.length * 8; i++) {
    const frame = Array(200).fill(null).map(() => Array(100).fill(null));
    
    // Simple text rendering (would need proper font system)
    const startCol = Math.max(0, 100 - i);
    if (startCol < 100) {
      for (let row = 90; row < 110; row++) {
        if (frame[row] && frame[row][startCol] !== undefined) {
          frame[row][startCol] = { color, brightness: 'bright' };
        }
      }
    }
    
    frames.push(frame);
  }
  
  return frames;
}

