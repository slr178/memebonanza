import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Connection, PublicKey } from '@solana/web3.js';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://memebonanza-o8x7qoboe-slr178s-projects.vercel.app',
            'https://memebonanza-gzpmqhb8f-slr178s-projects.vercel.app',
            /\.vercel\.app$/  // Allow all Vercel subdomains
          ]
        : ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true
};

app.use(cors(corsOptions));

// Solana connection - using your Helius RPC for best performance
const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=a3932063-571e-4359-9c01-340f099b32d3",
    'confirmed'
);

// In-memory storage (use Redis/DB in production)
const NONCES = new Map();
const SESSIONS = new Map();
const USER_SPIN_DATA = new Map(); // Store spin counts and earnings data

// 🔐 ENDPOINT 1: Generate authentication nonce
app.get('/api/nonce', (req, res) => {
    console.log('🔑 [Auth] Nonce requested from:', req.ip);
    
    const nonce = `Please sign this message to authenticate with the casino: ${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    
    // Store nonce temporarily (expires in 5 minutes)
    const key = req.ip + '-' + Date.now();
    NONCES.set(key, {
        nonce,
        expires: Date.now() + 300000 // 5 minutes
    });
    
    // Clean up expired nonces
    setTimeout(() => NONCES.delete(key), 300000);
    
    console.log('✅ [Auth] Nonce generated:', nonce.slice(0, 50) + '...');
    res.json({ nonce, key });
});

// 🔐 ENDPOINT 2: Verify signature and create session
app.post('/api/verify', (req, res) => {
    console.log('🔍 [Auth] Verification requested');
    console.log('📥 [Auth] Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('📥 [Auth] Request headers:', req.headers);
    
    const { publicKey, signature, nonce, key } = req.body;
    
    // Log each field separately for debugging
    console.log('🔍 [Auth] Field analysis:');
    console.log('  - publicKey:', typeof publicKey, publicKey?.length, publicKey?.slice(0, 20) + '...');
    console.log('  - signature:', typeof signature, signature?.length, signature?.slice(0, 20) + '...');
    console.log('  - nonce:', typeof nonce, nonce?.length, nonce?.slice(0, 50) + '...');
    console.log('  - key:', typeof key, key?.length);
    
    if (!publicKey || !signature || !nonce || !key) {
        console.log('❌ [Auth] Missing required fields:', { publicKey: !!publicKey, signature: !!signature, nonce: !!nonce, key: !!key });
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if nonce exists and is valid
    const storedNonce = NONCES.get(key);
    if (!storedNonce) {
        console.log('❌ [Auth] Nonce not found or expired');
        return res.status(401).json({ error: 'Invalid or expired nonce' });
    }
    
    if (storedNonce.nonce !== nonce) {
        console.log('❌ [Auth] Nonce mismatch');
        return res.status(401).json({ error: 'Nonce mismatch' });
    }
    
    if (Date.now() > storedNonce.expires) {
        console.log('❌ [Auth] Nonce expired');
        NONCES.delete(key);
        return res.status(401).json({ error: 'Nonce expired' });
    }
    
    try {
        console.log('🔍 [Auth] Starting signature verification process...');
        console.log('📝 [Auth] Expected message to be signed:', nonce);
        
        // Validate input types
        if (typeof publicKey !== 'string' || typeof signature !== 'string') {
            console.log('❌ [Auth] Invalid data types - publicKey:', typeof publicKey, 'signature:', typeof signature);
            return res.status(400).json({ error: 'PublicKey and signature must be strings' });
        }
        
        // Prepare message bytes
        const messageBytes = new TextEncoder().encode(nonce);
        console.log('📄 [Auth] Message bytes length:', messageBytes.length);
        
        // Decode signature
        let signatureBytes;
        try {
            console.log('🔓 [Auth] Attempting to decode signature...');
            console.log('🔍 [Auth] Signature format check:', {
                startsWithHex: signature.startsWith('hex:'),
                firstChars: signature.slice(0, 10),
                length: signature.length
            });
            
            if (signature.startsWith('hex:')) {
                // Handle hex format from frontend fallback
                const hexString = signature.slice(4);
                console.log('🔍 [Auth] Processing hex signature, hex length:', hexString.length);
                if (hexString.length % 2 !== 0) {
                    throw new Error('Invalid hex string length');
                }
                signatureBytes = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                console.log('✅ [Auth] Signature decoded from hex, bytes length:', signatureBytes.length);
            } else {
                // Handle base58 format
                console.log('🔍 [Auth] Processing base58 signature...');
                signatureBytes = bs58.decode(signature);
                console.log('✅ [Auth] Signature decoded from base58, bytes length:', signatureBytes.length);
            }
        } catch (err) {
            console.log('❌ [Auth] Signature decoding failed:', err.message);
            console.log('🔍 [Auth] Signature details:', {
                type: typeof signature,
                length: signature.length,
                sample: signature.slice(0, 50)
            });
            return res.status(400).json({ error: `Invalid signature format: ${err.message}` });
        }
        
        // Decode public key
        let publicKeyBytes;
        try {
            console.log('🔑 [Auth] Attempting to decode public key...');
            publicKeyBytes = bs58.decode(publicKey);
            console.log('✅ [Auth] PublicKey decoded, bytes length:', publicKeyBytes.length);
        } catch (err) {
            console.log('❌ [Auth] PublicKey decoding failed:', err.message);
            console.log('🔍 [Auth] PublicKey details:', {
                type: typeof publicKey,
                length: publicKey.length,
                sample: publicKey.slice(0, 20)
            });
            return res.status(400).json({ error: `Invalid publicKey format: ${err.message}` });
        }
        
        // Verify signature
        console.log('🔐 [Auth] Performing cryptographic verification...');
        const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        console.log('🔐 [Auth] Signature verification result:', isValid);
        
        if (!isValid) {
            console.log('❌ [Auth] Signature verification failed - signature does not match message and public key');
            return res.status(401).json({ error: 'Invalid signature' });
        }
        
        // Success! Create session
        const sessionId = crypto.randomUUID();
        SESSIONS.set(sessionId, {
            publicKey,
            createdAt: Date.now(),
            lastAccess: Date.now()
        });
        
        // Clean up used nonce
        NONCES.delete(key);
        
        console.log('✅ [Auth] Wallet authenticated:', publicKey.slice(0, 8) + '...');
        
        // Set secure session cookie
        res.cookie('casinoSession', sessionId, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({ 
            success: true, 
            publicKey,
            message: 'Wallet authenticated successfully' 
        });
        
    } catch (error) {
        console.error('❌ [Auth] Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// 💰 ENDPOINT 3: Get wallet balances (requires authentication)
app.get('/api/balance', async (req, res) => {
    console.log('💰 [Balance] Balance check requested');
    
    const sessionId = req.cookies.casinoSession;
    const session = SESSIONS.get(sessionId);
    
    if (!session) {
        console.log('❌ [Balance] No valid session');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Update last access
    session.lastAccess = Date.now();
    
    try {
        const publicKey = new PublicKey(session.publicKey);
        
        // Get SOL balance
        const lamports = await connection.getBalance(publicKey);
        const solBalance = lamports / 1e9;
        
        // Get SPL token balances (parsed)
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        });
        
        const tokens = tokenAccounts.value.map(({ pubkey, account }) => {
            const info = account.data.parsed.info;
            return {
                mint: info.mint,
                amount: info.tokenAmount.uiAmount || 0,
                decimals: info.tokenAmount.decimals,
                address: pubkey.toString()
            };
        });
        
        console.log(`✅ [Balance] ${session.publicKey.slice(0, 8)}... → SOL: ${solBalance.toFixed(6)}, Tokens: ${tokens.length}`);
        
        res.json({
            publicKey: session.publicKey,
            sol: solBalance,
            tokens,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error('❌ [Balance] Error fetching balance:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// 🚪 ENDPOINT 4: Logout (clear session)
app.post('/api/logout', (req, res) => {
    const sessionId = req.cookies.casinoSession;
    if (sessionId && SESSIONS.has(sessionId)) {
        SESSIONS.delete(sessionId);
        console.log('👋 [Auth] Session logged out');
    }
    
    res.clearCookie('casinoSession');
    res.json({ success: true, message: 'Logged out successfully' });
});

// 📊 ENDPOINT 5: Session status check
app.get('/api/status', (req, res) => {
    const sessionId = req.cookies.casinoSession;
    const session = SESSIONS.get(sessionId);
    
    if (!session) {
        return res.json({ authenticated: false });
    }
    
    // Update last access
    session.lastAccess = Date.now();
    
    res.json({
        authenticated: true,
        publicKey: session.publicKey,
        connectedAt: session.createdAt
    });
});

// 🎰 ENDPOINT 6: Get spin data (spins remaining, total earnings)
app.get('/api/spins', async (req, res) => {
    console.log('🎰 [Spins] Spin data requested');
    
    const sessionId = req.cookies.casinoSession;
    const session = SESSIONS.get(sessionId);
    
    if (!session) {
        console.log('❌ [Spins] No valid session');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const publicKey = session.publicKey;
    
    try {
        // Get current token balance to calculate base spins
        const pubKey = new PublicKey(publicKey);
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        });
        
        const totalTokens = tokenAccounts.value.reduce((sum, { account }) => {
            const info = account.data.parsed.info;
            return sum + (info.tokenAmount.uiAmount || 0);
        }, 0);
        
        // Initialize or get existing spin data
        let spinData = USER_SPIN_DATA.get(publicKey);
        const now = Date.now();
        
        if (!spinData) {
            // First time user - initialize with base spins
            const baseSpins = Math.floor(totalTokens / 100000);
            spinData = {
                availableSpins: baseSpins,
                totalEarnings: 0,
                lastRefresh: now,
                tokenSnapshot: totalTokens
            };
            USER_SPIN_DATA.set(publicKey, spinData);
            console.log(`🆕 [Spins] New user initialized: ${baseSpins} spins`);
        } else {
            // Check if we need hourly refresh
            const hoursSinceRefresh = (now - spinData.lastRefresh) / (1000 * 60 * 60);
            
            if (hoursSinceRefresh >= 1) {
                // Hourly refresh: recalculate spins based on current tokens
                const newSpins = Math.floor(totalTokens / 100000);
                spinData.availableSpins = newSpins;
                spinData.lastRefresh = now;
                spinData.tokenSnapshot = totalTokens;
                console.log(`🔄 [Spins] Hourly refresh: ${newSpins} spins replenished`);
            }
        }
        
        res.json({
            availableSpins: spinData.availableSpins,
            totalEarnings: spinData.totalEarnings,
            tokensHeld: totalTokens,
            nextRefresh: spinData.lastRefresh + (60 * 60 * 1000), // Next hour
            hoursUntilRefresh: Math.max(0, 1 - ((now - spinData.lastRefresh) / (1000 * 60 * 60)))
        });
        
    } catch (error) {
        console.error('❌ [Spins] Error fetching spin data:', error);
        res.status(500).json({ error: 'Failed to fetch spin data' });
    }
});

// 🎰 ENDPOINT 7: Use a spin (decrements available spins)
app.post('/api/spins/use', (req, res) => {
    console.log('🎰 [Spins] Spin usage requested');
    
    const sessionId = req.cookies.casinoSession;
    const session = SESSIONS.get(sessionId);
    
    if (!session) {
        console.log('❌ [Spins] No valid session');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const publicKey = session.publicKey;
    const spinData = USER_SPIN_DATA.get(publicKey);
    
    if (!spinData) {
        console.log('❌ [Spins] No spin data found');
        return res.status(400).json({ error: 'No spin data found' });
    }
    
    if (spinData.availableSpins <= 0) {
        console.log('❌ [Spins] No spins remaining');
        return res.status(400).json({ error: 'No spins remaining' });
    }
    
    // Consume one spin
    spinData.availableSpins--;
    console.log(`✅ [Spins] Spin consumed, ${spinData.availableSpins} remaining`);
    
    res.json({
        availableSpins: spinData.availableSpins,
        success: true
    });
});

// 🎰 ENDPOINT 8: Record winnings (add to total earnings)
app.post('/api/spins/win', (req, res) => {
    console.log('💰 [Spins] Win recording requested');
    
    const sessionId = req.cookies.casinoSession;
    const session = SESSIONS.get(sessionId);
    
    if (!session) {
        console.log('❌ [Spins] No valid session');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { solAmount } = req.body;
    
    if (typeof solAmount !== 'number' || solAmount <= 0) {
        console.log('❌ [Spins] Invalid SOL amount:', solAmount);
        return res.status(400).json({ error: 'Invalid SOL amount' });
    }
    
    const publicKey = session.publicKey;
    let spinData = USER_SPIN_DATA.get(publicKey);
    
    if (!spinData) {
        // Initialize if doesn't exist
        spinData = {
            availableSpins: 0,
            totalEarnings: 0,
            lastRefresh: Date.now(),
            tokenSnapshot: 0
        };
        USER_SPIN_DATA.set(publicKey, spinData);
    }
    
    // Add to total earnings
    spinData.totalEarnings += solAmount;
    
    console.log(`💰 [Spins] +${solAmount} SOL recorded, total: ${spinData.totalEarnings}`);
    
    res.json({
        totalEarnings: spinData.totalEarnings,
        addedAmount: solAmount,
        success: true
    });
});

// Clean up expired sessions (run every hour)
setInterval(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (const [sessionId, session] of SESSIONS.entries()) {
        if (now - session.lastAccess > oneDay) {
            SESSIONS.delete(sessionId);
            console.log('🧹 [Cleanup] Expired session removed');
        }
    }
}, 60 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: Date.now(),
        sessions: SESSIONS.size,
        nonces: NONCES.size
    });
});

// Start server (local development only)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Casino API Server running on http://localhost:${PORT}`);
        console.log(`🎰 Frontend should be on http://localhost:8000`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down API server...');
        process.exit(0);
    });
}

// Export for Vercel serverless deployment
export default app; 