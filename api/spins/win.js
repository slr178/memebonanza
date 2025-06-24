// Record win endpoint
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

    // Check for session cookie
    const cookies = req.headers.cookie;
    if (!cookies || !cookies.includes('casinoSession=')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const { solAmount } = req.body || {};
    const winAmount = solAmount || 0.1;
    
    console.log(`💰 [Spins] Win recorded: +${winAmount} SOL`);
    
    res.json({
        totalEarnings: winAmount,
        addedAmount: winAmount,
        success: true
    });
} 