// Signature verification endpoint
export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { publicKey, signature, nonce, key } = req.body;
    
    console.log('🔍 [Auth] Verification requested');
    console.log('📥 [Auth] Fields:', { publicKey: !!publicKey, signature: !!signature, nonce: !!nonce, key: !!key });
    
    if (!publicKey || !signature || !nonce || !key) {
        console.log('❌ [Auth] Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // For demo purposes, we'll accept any valid-looking signature
        // In production, you'd verify the signature cryptographically
        
        if (signature && signature.length > 10 && publicKey && publicKey.length > 40) {
            // Create a session ID
            const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            console.log('✅ [Auth] Wallet authenticated:', publicKey.slice(0, 8) + '...');
            
            // Set session cookie
            res.setHeader('Set-Cookie', `casinoSession=${sessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
            
            res.json({ 
                success: true, 
                publicKey,
                message: 'Wallet authenticated successfully' 
            });
        } else {
            console.log('❌ [Auth] Invalid signature format');
            res.status(401).json({ error: 'Invalid signature' });
        }
        
    } catch (error) {
        console.error('❌ [Auth] Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
} 