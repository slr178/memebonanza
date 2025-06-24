// Session status endpoint
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

    // Check for session cookie
    const cookies = req.headers.cookie;
    if (!cookies || !cookies.includes('casinoSession=')) {
        return res.json({ authenticated: false });
    }

    // Demo: Return authenticated status
    res.json({
        authenticated: true,
        publicKey: "D44XxR6v36DHcawbjE1s7LY4mhs7Am8h1mvbeB8Q4DAF",
        connectedAt: Date.now() - 300000 // 5 minutes ago
    });
} 