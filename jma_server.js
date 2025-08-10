// JMA Data Proxy Server
// Run with: node jma_server.js
// Then update jma_viewer.html to use http://localhost:3000/api/jma instead of CORS proxy

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 11311;
const HOST = "192.168.1.12";
const JMA_FEED_URL = 'https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml';
const CACHE_DIR = './cache';

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Function to handle detailed XML requests with caching
function handleDetailXMLRequest(url, res) {
    try {
        // Create a cache filename from the URL
        const urlObj = new URL(url);
        const filename = path.basename(urlObj.pathname) || 'unknown.xml';
        const cacheFilePath = path.join(CACHE_DIR, filename);
        
        console.log(`[${new Date().toISOString()}] Detail XML requested: ${filename}`);
        
        // Don't cache main feed files (eqvol.xml, etc.) - only cache detail XML files
        const shouldCache = !filename.includes('eqvol.xml') && filename.length > 15; // Detail files have long names
        
        // Check if file exists in cache (only for cacheable files)
        if (shouldCache && fs.existsSync(cacheFilePath)) {
            console.log(`[${new Date().toISOString()}] Serving from cache: ${filename}`);
            
            // Serve from cache
            const cachedData = fs.readFileSync(cacheFilePath, 'utf8');
            res.writeHead(200, {
                'Content-Type': 'application/xml; charset=utf-8',
                'X-Cache': 'HIT',
                ...corsHeaders
            });
            res.end(cachedData);
            return;
        }
        
        // File doesn't exist, download and cache it
        console.log(`[${new Date().toISOString()}] Downloading new detail XML: ${filename}`);
        
        const protocol = url.startsWith('https:') ? https : http;
        protocol.get(url, (xmlRes) => {
            let data = '';
            
            xmlRes.on('data', (chunk) => {
                data += chunk;
            });
            
            xmlRes.on('end', () => {
                try {
                    // Save to cache only if it should be cached
                    if (shouldCache) {
                        fs.writeFileSync(cacheFilePath, data, 'utf8');
                        console.log(`[${new Date().toISOString()}] Cached detail XML: ${filename} (${data.length} bytes)`);
                    } else {
                        console.log(`[${new Date().toISOString()}] Served (not cached): ${filename} (${data.length} bytes)`);
                    }
                    
                    // Serve the data
                    res.writeHead(200, {
                        'Content-Type': 'application/xml; charset=utf-8',
                        'X-Cache': shouldCache ? 'MISS' : 'NOCACHE',
                        ...corsHeaders
                    });
                    res.end(data);
                } catch (cacheError) {
                    console.warn(`[${new Date().toISOString()}] Failed to cache ${filename}:`, cacheError.message);
                    
                    // Still serve the data even if caching failed
                    res.writeHead(200, {
                        'Content-Type': 'application/xml; charset=utf-8',
                        'X-Cache': 'MISS',
                        ...corsHeaders
                    });
                    res.end(data);
                }
            });
            
        }).on('error', (error) => {
            console.error(`[${new Date().toISOString()}] Error fetching detail XML ${filename}:`, error.message);
            
            res.writeHead(500, {
                'Content-Type': 'application/json',
                ...corsHeaders
            });
            res.end(JSON.stringify({
                error: 'Failed to fetch detail XML',
                url: url,
                filename: filename,
                message: error.message,
                timestamp: new Date().toISOString()
            }));
        });
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error handling detail XML request:`, error.message);
        
        res.writeHead(500, {
            'Content-Type': 'application/json',
            ...corsHeaders
        });
        res.end(JSON.stringify({
            error: 'Invalid detail XML request',
            message: error.message,
            timestamp: new Date().toISOString()
        }));
    }
}

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '3600'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);
    const pathname = requestUrl.pathname;
    const searchParams = requestUrl.searchParams;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // Serve the main HTML file
    if (pathname === '/' || pathname === '/index.html') {
        const fs = require('fs');
        try {
            const htmlContent = fs.readFileSync('./main.html', 'utf8');
            // Replace CORS proxy with local server endpoint
            const modifiedHtml = htmlContent.replace(
                "const CORS_PROXY = 'https://api.allorigins.win/raw?url=';",
                `const CORS_PROXY = 'http://${HOST}:${PORT}/api/jma?url=';`
            );
            
            res.writeHead(200, { 
                'Content-Type': 'text/html; charset=utf-8',
                ...corsHeaders 
            });
            res.end(modifiedHtml);
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('HTML file not found. Make sure main.html is in the same directory.');
        }
        return;
    }

    // API endpoint to proxy JMA data with caching
    if (pathname === '/api/jma') {
        const url = searchParams.get('url');
        if (!url) {
            // Default JMA feed
            console.log(`[${new Date().toISOString()}] Fetching JMA data...`);
            
            https.get(JMA_FEED_URL, (jmaRes) => {
                let data = '';
                
                jmaRes.on('data', (chunk) => {
                    data += chunk;
                });
                
                jmaRes.on('end', () => {
                    console.log(`[${new Date().toISOString()}] JMA data received (${data.length} bytes)`);
                    
                    res.writeHead(200, {
                        'Content-Type': 'application/xml; charset=utf-8',
                        ...corsHeaders
                    });
                    res.end(data);
                });
                
            }).on('error', (error) => {
                console.error(`[${new Date().toISOString()}] Error fetching JMA data:`, error.message);
                
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                });
                res.end(JSON.stringify({
                    error: 'Failed to fetch JMA data',
                    message: error.message,
                    timestamp: new Date().toISOString()
                }));
            });
        } else {
            // Handle detail XML caching
            handleDetailXMLRequest(url, res);
        }
        return;
    }

    // Cache management endpoint
    if (pathname === '/cache') {
        try {
            const files = fs.readdirSync(CACHE_DIR);
            const cacheInfo = files.map(file => {
                const filePath = path.join(CACHE_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.ctime,
                    modified: stats.mtime
                };
            });
            
            res.writeHead(200, {
                'Content-Type': 'application/json',
                ...corsHeaders
            });
            res.end(JSON.stringify({
                cacheDirectory: CACHE_DIR,
                totalFiles: files.length,
                files: cacheInfo,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            res.writeHead(500, {
                'Content-Type': 'application/json',
                ...corsHeaders
            });
            res.end(JSON.stringify({
                error: 'Failed to read cache directory',
                message: error.message,
                timestamp: new Date().toISOString()
            }));
        }
        return;
    }

    // Health check endpoint
    if (pathname === '/health') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            ...corsHeaders
        });
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }));
        return;
    }

    // 404 for other paths
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

// Start server
server.listen(PORT, () => {
    console.log('\n🌋 JMA Activity Monitor Server Started');
    console.log('=====================================');
    console.log(`Server running at: http://${HOST}:${PORT}`);
    console.log(`Health check: http://${HOST}:${PORT}/health`);
    console.log(`API endpoint: http://${HOST}:${PORT}/api/jma`);
    console.log(`Cache info: http://${HOST}:${PORT}/cache`);
    console.log(`Cache directory: ${CACHE_DIR}`);
    console.log('');
    console.log('Features:');
    console.log('- Real-time JMA earthquake & volcanic data');
    console.log('- CORS proxy for web browser access');
    console.log('- Smart XML caching (downloads only new files)');
    console.log('- Auto-refresh every 5 minutes');
    console.log('- Responsive web interface');
    console.log('- Fixed url.parse() deprecation warning');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('=====================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped gracefully');
        process.exit(0);
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
