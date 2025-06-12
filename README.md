# SolTrace - Simple Solana Forensic Tool

## What is SolTrace?

SolTrace is a free, easy-to-use tool that helps you check if a Solana wallet has ever sent or received Sol from wallets connected to the February 2025 Bybit hack. Think of it like a "wallet checker" that tells you if an address might be risky.

The tool uses the official list of hacker addresses published by investigator ZachXBT and Bybit's security team.

## Why Was This Tool Built?

As hacks and exploit-related fund movements increasingly touch the Solana ecosystem, there is a growing need for forensic tooling that enables investigators, compliance teams, and security analysts to trace interactions between malicious actors and other wallet addresses. Currently, there is no easy-to-use, open-source tool for this kind of forensic linkage on Solana, particularly following major hacks like the Bybit exploit in February 2025.


When the Bybit hack shook the ecosystem in February 2025, it wasn’t just 400,000 ETH that vanished—it was a breach of trust felt across blockchains. Overnight, wallets were drained, bridges compromised, and confidence among users, developers, and compliance teams took a serious hit. What made the attack even more unsettling was its cross-chain complexity: a coordinated movement of stolen assets across Bitcoin, Ethereum, BNB Chain—and Solana. As forensic analysts and investigators scrambled to trace the tainted funds, they quickly hit a wall: Solana lacked the open-source, easy-to-use, address-linkage tooling needed to identify whether a suspicious wallet had ever interacted with the attacker’s cluster of accounts. The chain's speed and architecture—usually celebrated for performance—became a hurdle in post-mortem analysis.
 With each passing day, the need became clearer: Solana needs a forensic-grade, lightweight, and community-accessible tool that enables real-time wallet risk assessment, adjacency detection, and compliance screening—especially after devastating events like the Bybit breach.

## How Simple Is It?

This tool is intentionally basic and straightforward:
- No fancy frameworks like React or Vue.js. And if you wonder, yes, a fancy implementation of the tool will soon be available.
- Just simple HTML, CSS, and JavaScript files
- Works in any web browser
- No installation required
- No complex setup process

Perfect for investigators, compliance teams, and security analysts who need results fast without technical hassles.

## What You Get

The tool provides:
- **Direct connection detection**: Did the wallet send/receive money directly to/from hacker addresses?
- **Indirect connection detection**: Did the wallet interact with other wallets that later interacted with hackers?
- **Clear results**: Simple "connected" or "not connected" answers
- **Transaction details**: When and how much was transferred
- **Visual timeline**: Easy-to-read transaction history

## Quick Setup (5 Minutes)

### What You Need
- A web hosting account (any basic hosting provider works)
- A Solana RPC API key (free from providers like Alchemy, QuickNode, or Helius)

### Setup Steps

1. **Download the files**
   - Download both files from this repository:
     - `index.html` (the main page)
     - `script.js` (the tool logic)

2. **Get your API key**
   - Sign up for a free account at:
     - [Helius](https://www.helius.dev/)
   - Create a new Solana project
   - Copy your RPC endpoint URL

3. **Update the API key**
   - Open `script.js` in any text editor
   - Find the line that says: const apiKey = 'Replace_with_your_Helius_API-key';
   - Replace `Replace_with_your_Helius_API-key` with your actual RPC URL
   - Save the file

4. **Upload to your website**
   - Upload both files to your web hosting provider
   - That's it! Your tool is ready to use

## How to Use

1. Open the tool in your web browser
2. Enter a Solana wallet address in the search box
3. Click "Analyze Relations"
4. Wait for results (usually takes a few seconds)


## Technical Details

The tool checks transactions by:
1. Getting all transactions for the wallet you entered
2. Comparing transaction partners against the known hacker address list
3. Following the chain one step further to check indirect connections
4. Presenting results in plain English

## Data Sources

- **Hacker addresses**: Official list from ZachXBT and Bybit security team
- **Transaction data**: Fetched directly from Solana blockchain via your RPC provider
- **Updated regularly**: New hacker addresses will be added as they're officially disclosed

## Limitations

- Only checks Solana blockchain (not Bitcoin, Ethereum, etc.)
- Currently focused on February 2025 Bybit hack addresses
- Indirect connections only go one step deep. If you want to check multiple hops, just check line 358:  const maxDepth = 1; and you can check 2, 3,4, hops, etc. However, please be
aware that there are some limitation on the free API Key.
- Requires internet connection to fetch blockchain data

## Troubleshooting

**Tool not loading?**
- Check that both files are uploaded to your hosting provider
- Make sure your API key is correctly entered in `script.js`

**"API Error" message?**
- Verify your RPC endpoint URL is correct
- Check that your API key hasn't expired

**Slow results?**
- This is normal for wallets with many transactions
- Wait up to 60 seconds for wallets that have multiple complex activity

## Privacy & Security
- Your API key stays on your server
- No personal data is collected

## Contributing

This is an open-source project funded by a grant powered by the Solana Foundation:https://earn.superteam.fun/grants/solana-foundation-romania-grants/references/
 If you find bugs or want to suggest improvements, please contribute to the repository as your input helps strengthen this tool for the entire community.
 If you'd like to contribute or discuss security insights, feel free to connect with me:  
📌 **[You can find me here:](https://gabidumitriu.ro)**  


## Support

This tool is provided free of charge to support the Solana security community. The code is simple enough that most web developers can help with basic setup issues.

## License

This project is open source under the MIT License—meaning you are free to use, modify, and distribute it. However, please ensure proper attribution by including a reference to this repository and acknowledging the original contributor and Solana Foundation. I deeply appreciate recognition for any future  work put into building and maintaining this tool.
---

**Built with ❤️ for the Solana security community**  
*Funded by Solana Foundation Grant*
