// Secure admin authentication endpoint
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

    const { password } = req.body;
    
    // Server-side password (secure)
    const ADMIN_PASSWORD = "banana123";
    
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }

    if (password === ADMIN_PASSWORD) {
        // Generate secure admin session
        const adminSessionId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 15)}`;
        
        // Set secure admin session cookie
        res.setHeader('Set-Cookie', `adminSession=${adminSessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax; Secure`);
        
        console.log('🔓 Admin authenticated successfully');
        
        res.json({ 
            success: true, 
            message: 'Admin authenticated' 
        });
    } else {
        console.log('🔒 Admin authentication failed - incorrect password');
        res.status(401).json({ error: 'Incorrect password' });
    }
} 