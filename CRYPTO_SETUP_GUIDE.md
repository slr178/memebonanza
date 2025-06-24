# 🎰 Crypto Casino Setup Guide

Welcome to your Solana-based crypto slot casino! This guide will walk you through setting up your token-gated casino where users need to hold your SPL token to play.

## 🚀 **Quick Overview**

Your casino now includes:
- ✅ **Phantom Wallet Integration** - Users connect their Solana wallets
- ✅ **SPL Token Balance Checking** - Reads on-chain token balances  
- ✅ **Spin Allocation** - 1 spin per 100,000 tokens held
- ✅ **Live Wins Feed** - Real-time wins from all players
- ✅ **Admin Panel** - Manage token address and view statistics
- ✅ **Firebase Integration** - Real-time database for live wins

## 📋 **Prerequisites**

1. **Solana SPL Token** - You need to have deployed your token on Solana
2. **Firebase Project** - For real-time win tracking and configuration
3. **Phantom Wallet** - For testing (users will need this too)

## ⚙️ **Setup Steps**

### **Step 1: Firebase Setup**

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Create a project"
   - Name it (e.g., "my-crypto-casino")
   - Disable Google Analytics (optional)

2. **Enable Firestore:**
   - In your Firebase project, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (we'll secure it later)
   - Select a location near your users

3. **Get Firebase Config:**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Web" button (</>) to add a web app
   - Name it "Casino Frontend"
   - Copy the `firebaseConfig` object

4. **Set up Firestore Collections:**
   
   Create these collections in Firestore:

   **Collection: `settings`**
   - Document ID: `tokenConfig`
   - Fields:
     ```json
     {
       "mintAddress": "YOUR_SPL_TOKEN_MINT_ADDRESS_HERE",
       "updatedAt": "timestamp"
     }
     ```

   **Collection: `wins`**
   - Will be auto-populated when users win
   - No setup needed

### **Step 2: Configure Your Website**

1. **Update Firebase Config in `index.html`:**
   
   Find this section around line 2456:
   ```javascript
   const firebaseConfig = {
       apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project-id.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:abcdefghijklmnop"
   };
   ```
   
   Replace with your actual Firebase config.

2. **Update Firebase Config in `admin.html`:**
   
   Find the same section around line 244 and replace with your config.

### **Step 3: Deploy Your SPL Token**

If you haven't created your SPL token yet:

1. **Use Solana Token Program:**
   ```bash
   # Install Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
   
   # Create token
   spl-token create-token
   
   # Create token account
   spl-token create-account YOUR_TOKEN_MINT
   
   # Mint tokens
   spl-token mint YOUR_TOKEN_MINT 1000000
   ```

2. **Or use a service like:**
   - [Solana Token Creator](https://www.solana-token-creator.com/)
   - [Token Tool by Solworks](https://www.solworks.dev/token-creator)

### **Step 4: Configure Token in Admin Panel**

1. **Open Admin Panel:**
   - Navigate to `yoursite.com/admin.html`
   - You should see the admin interface

2. **Set Token Address:**
   - Paste your SPL token mint address
   - Click "Update Token Address"
   - This will be stored in Firebase and used by all clients

### **Step 5: Test Everything**

1. **Install Phantom Wallet:**
   - Download from [phantom.app](https://phantom.app)
   - Create wallet or import existing

2. **Get Test Tokens:**
   - Send some of your tokens to your test wallet
   - Make sure you have at least 100,000 for 1 spin

3. **Test Flow:**
   - Connect wallet on your casino site
   - Check that spins show correctly
   - Try spinning and verify wins are recorded
   - Check admin panel for statistics

## 🔧 **Configuration Options**

### **Spin Rate Adjustment**

Currently set to 1 spin per 100,000 tokens. To change this:

In `index.html`, find line ~2618:
```javascript
// Calculate spins (1 spin per 100,000 tokens)
availableSpins = Math.floor(totalBalance / 100000);
```

Change `100000` to your desired rate.

### **Win Recording**

Wins are automatically recorded when users get winning combinations. The system records:
- Wallet address
- Win amount (percentage)
- Win type (e.g., "S-triple", "PEPE JACKPOT")
- Timestamp

### **Security Settings**

Update your Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read wins and token config
    match /wins/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /settings/{docId} {
      allow read: if true;
      allow write: if request.auth.uid == "YOUR_ADMIN_UID";
    }
  }
}
```

## 🎯 **Features Explained**

### **For Players:**
- **Connect Wallet** - Links Phantom wallet to check token balance
- **Auto Spin Calculation** - Shows available spins based on token holdings
- **Gated Gameplay** - Can only spin if they have enough tokens
- **Live Wins Feed** - See other players' wins in real-time

### **For You (Admin):**
- **Token Management** - Change token address without redeploying
- **Live Statistics** - View total wins, recent activity
- **Data Export** - Download all casino data as JSON
- **Win History Management** - Clear all win records if needed

## 🌐 **Going Live**

### **Domain & Hosting:**
- Use Firebase Hosting, Netlify, or Vercel for easy deployment
- Make sure HTTPS is enabled (required for wallet connections)

### **Token Distribution:**
- Create liquidity on DEXs like Raydium or Jupiter
- Market your token to build holder base
- More holders = more potential players

### **Compliance:**
- Check local gambling laws
- Consider age verification
- Add responsible gambling notices

## 🛠️ **Troubleshooting**

### **Common Issues:**

**"Phantom not detected"**
- User needs to install Phantom wallet extension
- Make sure they're on a supported browser

**"No spins available"**
- User doesn't hold enough tokens (need 100,000+ for 1 spin)
- Check token mint address in admin panel
- Verify Firebase connection

**"Firebase errors"**
- Check Firebase config is correct
- Verify Firestore rules allow reads/writes
- Check browser console for specific errors

**"Token balance not loading"**
- Solana RPC might be slow/down
- User might not have token account for your mint
- Check browser console for Solana connection errors

### **Debug Mode:**
- Open browser developer tools (F12)
- Check console for error messages
- Look for "🚀" prefixed logs for initialization status

## 📊 **Analytics & Monitoring**

### **Built-in Metrics:**
- Total spins taken
- Win frequency
- Player wallet addresses
- Win amounts and types

### **Firebase Analytics:**
- Set up Firebase Analytics for user engagement
- Track wallet connections, spins, wins

### **Custom Tracking:**
- Add Google Analytics or other tracking
- Monitor token holder growth
- Track user retention

## 🔐 **Security Best Practices**

1. **Never store private keys** - Users control their own wallets
2. **Validate all inputs** - Token addresses, win amounts, etc.
3. **Rate limiting** - Consider adding spin cooldowns
4. **Audit smart contracts** - If you add on-chain components
5. **Secure Firebase** - Use proper authentication and rules

## 📈 **Growth Strategies**

1. **Token Utility** - Make tokens valuable beyond just casino access
2. **Referral Program** - Reward users for bringing friends
3. **Seasonal Events** - Special multipliers, bonus spins
4. **NFT Integration** - Bonus spins for NFT holders
5. **DAO Governance** - Let token holders vote on casino changes

## 💡 **Future Enhancements**

Consider adding:
- **Staking Rewards** - Bonus spins for staked tokens
- **VIP Tiers** - Better odds for large holders
- **Tournaments** - Compete for prizes
- **Multi-token Support** - Accept different tokens
- **Mobile App** - Native mobile experience
- **Social Features** - Chat, leaderboards
- **NFT Prizes** - Win exclusive NFTs

---

## 🆘 **Need Help?**

If you run into issues:

1. **Check Console Logs** - Browser developer tools will show detailed errors
2. **Verify Config** - Double-check Firebase and token configurations  
3. **Test Network** - Try on Solana devnet first before mainnet
4. **Community** - Ask in Solana or Web3 developer communities

---

## 🚀 **You're Ready!**

Once you've completed these steps, your crypto casino will be live! Users with your tokens can connect their wallets and start spinning. The admin panel gives you full control over the token configuration and lets you monitor all activity.

**Good luck with your crypto casino! 🎰💎** 