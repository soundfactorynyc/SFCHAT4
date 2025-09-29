// Livestream Control API
// Manages livestream configuration and status

let streamConfig = {
    main: { on: false, url: "" },
    classics: { on: false, url: "" },
    showPopup: false,
    message: "We are live!",
    updatedAt: Date.now()
};

// In-memory storage for demo. In production, use Redis or database
const configStore = new Map();

exports.handler = async (event, context) => {
    // Handle CORS preflight
    const corsHeaders = {
        'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || 'https://soundfactory.club,https://www.soundfactory.club,https://seance.soundfactorynyc.com',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        // GET: Return current stream configuration
        if (event.httpMethod === 'GET') {
            // Check if we have Redis/Upstash config
            const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
            const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
            
            let config = streamConfig; // Default fallback
            
            if (redisUrl && redisToken) {
                try {
                    // Fetch from Redis
                    const response = await fetch(`${redisUrl}/get/livestream-config`, {
                        headers: {
                            'Authorization': `Bearer ${redisToken}`
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.result) {
                            config = JSON.parse(data.result);
                        }
                    }
                } catch (redisError) {
                    console.log('Redis fetch failed, using memory config');
                }
            } else {
                // Use in-memory store
                const stored = configStore.get('livestream-config');
                if (stored) {
                    config = stored;
                }
            }

            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, max-age=0'
                },
                body: JSON.stringify(config)
            };
        }

        // POST: Update stream configuration (admin only)
        if (event.httpMethod === 'POST') {
            // Check admin authentication
            const adminKey = process.env.ADMIN_API_KEY;
            const authHeader = event.headers.authorization;
            
            if (!adminKey || !authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Unauthorized' })
                };
            }

            const providedKey = authHeader.replace('Bearer ', '');
            if (providedKey !== adminKey) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Invalid admin key' })
                };
            }

            // Parse and validate request body
            let updateData;
            try {
                updateData = JSON.parse(event.body);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Invalid JSON' })
                };
            }

            // Validate and merge configuration
            const newConfig = {
                main: {
                    on: Boolean(updateData.main?.on),
                    url: updateData.main?.url || ""
                },
                classics: {
                    on: Boolean(updateData.classics?.on),
                    url: updateData.classics?.url || ""
                },
                showPopup: Boolean(updateData.showPopup),
                message: updateData.message || "We are live!",
                updatedAt: Date.now()
            };

            // Validate URLs if streams are on
            if (newConfig.main.on && newConfig.main.url && !isValidStreamUrl(newConfig.main.url)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Invalid main stream URL' })
                };
            }

            if (newConfig.classics.on && newConfig.classics.url && !isValidStreamUrl(newConfig.classics.url)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Invalid classics stream URL' })
                };
            }

            // Save configuration
            streamConfig = newConfig; // Update memory
            
            // Try to save to Redis if available
            const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
            const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
            
            if (redisUrl && redisToken) {
                try {
                    await fetch(`${redisUrl}/set/livestream-config`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${redisToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            value: JSON.stringify(newConfig),
                            ex: 86400 // Expire in 24 hours
                        })
                    });
                } catch (redisError) {
                    console.log('Redis save failed, using memory store');
                    configStore.set('livestream-config', newConfig);
                }
            } else {
                // Save to memory store
                configStore.set('livestream-config', newConfig);
            }

            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    config: newConfig,
                    message: 'Stream configuration updated'
                })
            };
        }

        // Method not allowed
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Livestream control error:', error);
        
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};

function isValidStreamUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'https:' && 
               (url.endsWith('.m3u8') || url.includes('stream') || url.includes('live'));
    } catch {
        return false;
    }
}

// Example usage:
// GET /.netlify/functions/livestream-control
// Returns current config

// POST /.netlify/functions/livestream-control
// Headers: Authorization: Bearer YOUR_ADMIN_KEY
// Body: {
//   "main": {"on": true, "url": "https://example.com/main.m3u8"},
//   "classics": {"on": false, "url": ""},
//   "showPopup": true,
//   "message": "Seance is live now!"
// }