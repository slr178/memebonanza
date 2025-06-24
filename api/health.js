// Health check endpoint for Vercel
export default function handler(req, res) {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: Date.now(),
        sessions: 0,
        nonces: 0
    });
} 