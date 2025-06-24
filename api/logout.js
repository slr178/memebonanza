// Logout endpoint
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

    // Clear session cookie
    res.setHeader('Set-Cookie', 'casinoSession=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
    
    console.log('👋 [Auth] Session logged out');
    
    res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
} 