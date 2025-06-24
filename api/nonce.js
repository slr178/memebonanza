// Simple nonce generation endpoint for wallet authentication
export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const timestamp = Date.now();
    const randomBytes = Math.random().toString(36).substring(2, 15);
    const nonce = `Please sign this message to authenticate with the casino: ${timestamp}-${randomBytes}`;
    const key = `nonce-${timestamp}`;
    
    console.log('✅ [Auth] Nonce generated:', nonce.slice(0, 50) + '...');
    
    res.json({ nonce, key });
} 