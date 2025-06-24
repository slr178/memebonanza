// Verify admin session endpoint
export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for admin session cookie
    const cookies = req.headers.cookie;
    if (!cookies || !cookies.includes('adminSession=')) {
        return res.json({ authenticated: false });
    }

    // Extract session ID (basic validation)
    const sessionMatch = cookies.match(/adminSession=([^;]+)/);
    if (sessionMatch && sessionMatch[1] && sessionMatch[1].startsWith('admin-')) {
        return res.json({ 
            authenticated: true,
            sessionId: sessionMatch[1]
        });
    }

    res.json({ authenticated: false });
} 