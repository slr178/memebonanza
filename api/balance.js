// Wallet balance endpoint
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
        return res.status(401).json({ error: 'Authentication required' });
    }

    // For demo purposes, return mock balance data
    // In production, you'd fetch real Solana wallet data
    const mockBalance = {
        publicKey: "D44XxR6v36DHcawbjE1s7LY4mhs7Am8h1mvbeB8Q4DAF",
        sol: 0.5 + Math.random(),
        tokens: [
            {
                mint: "So11111111111111111111111111111111111111112",
                amount: 100000 + Math.floor(Math.random() * 500000),
                decimals: 6,
                address: "TokenAccount123"
            }
        ],
        timestamp: Date.now()
    };

    console.log(`✅ [Balance] Demo balance returned`);
    
    res.json(mockBalance);
} 