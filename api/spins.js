// Spins management endpoint
export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check for session cookie
    const cookies = req.headers.cookie;
    if (!cookies || !cookies.includes('casinoSession=')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
        // Return spin data
        const spinData = {
            availableSpins: 10, // Demo value
            totalEarnings: 0.0,
            tokensHeld: 500000,
            nextRefresh: Date.now() + (60 * 60 * 1000),
            hoursUntilRefresh: 1.0
        };
        
        console.log('✅ [Spins] Demo spin data returned');
        res.json(spinData);
        
    } else if (req.method === 'POST') {
        // Handle spin usage or win recording based on endpoint
        const url = req.url;
        
        if (url.includes('/use')) {
            // Use a spin
            res.json({
                availableSpins: 9,
                success: true
            });
            console.log('✅ [Spins] Demo spin used');
            
        } else if (url.includes('/win')) {
            // Record a win
            const { solAmount } = req.body || {};
            res.json({
                totalEarnings: solAmount || 0.1,
                addedAmount: solAmount || 0.1,
                success: true
            });
            console.log('✅ [Spins] Demo win recorded');
            
        } else {
            res.status(404).json({ error: 'Endpoint not found' });
        }
        
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 