// Helius API configuration
const apiKey = 'Replace_with_your_Helius_API-key';
const apiUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

// Bybit hack addresses
const bybitAddresses = [
    { address: "4iqPxXZf9NpfockoM17oBx3zSJ6rY9ToHRNeysbyDRnU", name: "Solana Bybit1" },
    { address: "5STkQy8LQDGc6xJEisdyv99gUYe8uHFnBrXjG295T7Cq", name: "Solana Bybit2" },
    { address: "EFmqz8PTTShNsEsErMUFt9ZZx8CTZHz4orUhdz8Bdq2P", name: "Solana Bybit3" },
    { address: "8Pyoffd1kSH8XXcoH2UUcewfLUEuENuLG7P8TdtMAMgp", name: "Solana Bybit4" },
    { address: "4oGf1pd9XvWSjVt3DH4WLTukF2oDoEhhcXtahLWu5it6", name: "Solana Bybit5" },
    { address: "CQtMzkMFes72xVB8bu1KP7xS8TsuY4uGLRTCnfyQnbxs", name: "Solana Bybit6" },
    { address: "128Us5zMeRwMCXCCDxvEo6XsY3zaq55UV3HEuwScBF8c", name: "Solana Bybit7" },
    { address: "A7VuXpbzE5Heowje4YDFdUrvz8dsVG4HsBxfN7mD8DCj", name: "Solana Bybit8" },
    { address: "DqubJdTMXTBnGxv5CoKX7QowwTYYPV6LoCgmo9R3vacY", name: "Solana Bybit9" },
    { address: "BCEZFGVJHcw5h8J8XScXhdrmWDboqroCRvdtovXCwBMT", name: "Solana Bybit10" },
    { address: "2oP36hojo3spVLvrhqNVW8ERUEYMKFAS2XVAmFv289WJ", name: "Solana Bybit11" },
    { address: "22zz3KN8iauCpt19nwam2xBvid8HeSSb34JHW9vazZCQ", name: "Solana Bybit-intermediary" },
    { address: "2zDWyTEauJPTXfeRbJKawjeYuzbEj2vMcuZQhykB9pT6", name: "Solana Bybit12" },
    { address: "3bqgyYwe1LdbZBZAPD21svUXZkZHzXRs4YLDDEJhPYWh", name: "Solana Bybit13" },
    { address: "EZyxqWobmNLDFPv2SSHejjj6KBWzoxvPsKFcX7RCSBWb", name: "Solana Bybit14" },
    { address: "fXT8U9iifZ4fphxY16RDyFKFDgFVWticNFeTWf24h18", name: "Solana Bybit15" },
    { address: "G1jhx4mHCEcHLdeBM4cDD6ej1dWWVoU1ETeA5A3GhMcY", name: "Solana Bybit16" }
];

// Map for quick bybit address lookup
const bybitAddressMap = new Map(bybitAddresses.map(item => [item.address, item]));


// Rate limiting utilities for free API Key
const apiRateLimiter = {
    queue: [],
    processing: false,
    lastRequestTime: 0,
    minDelayMs: 1000, // 1 second delay between requests
    
    async addRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ requestFn, resolve, reject });
            if (!this.processing) {
                this.processQueue();
            }
        });
    },
    
    async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
        
        this.processing = true;
        const now = Date.now();
        const timeToWait = Math.max(0, this.lastRequestTime + this.minDelayMs - now);
        
        if (timeToWait > 0) {
            await new Promise(resolve => setTimeout(resolve, timeToWait));
        }
        
        const { requestFn, resolve, reject } = this.queue.shift();
        this.lastRequestTime = Date.now();
        
        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            // Process next request with a slight delay
            setTimeout(() => this.processQueue(), this.minDelayMs);
        }
    }
};

// TransactionFlowVisualizer Class
class TransactionFlowVisualizer {
    constructor(elementId) {
        this.cy = cytoscape({
            container: document.getElementById(elementId),
            style: [
                { selector: 'node', style: { 'background-color': '#007bff', 'label': 'data(id)', 'color': '#fff', 'font-size': '10px' } },
                { selector: 'edge', style: { 'width': 2, 'line-color': '#ccc', 'target-arrow-color': '#ccc', 'target-arrow-shape': 'triangle' } },
                { selector: '.incoming', style: { 'background-color': '#28a745' } },
                { selector: '.outgoing', style: { 'background-color': '#dc3545' } },
                { selector: '.bybit', style: { 'background-color': '#ff9900', 'border-color': '#fff', 'border-width': 6 } }
            ],
            layout: { name: 'cose', fit: true, padding: 20 },
            zoom: 1,
            minZoom: 0.5,
            maxZoom: 3
        });
    }

    setAddress(address) {
        this.address = address;
        this.cy.elements().remove();
        this.cy.add({ group: 'nodes', data: { id: address }, classes: 'center' });
    }

    visualizeTransactions(transactions) {
        transactions.forEach(tx => {
            const from = tx.from;
            const to = tx.to;
            if (from !== this.address && !this.cy.getElementById(from).length) {
                const isBybit = bybitAddressMap.has(from);
                this.cy.add({ group: 'nodes', data: { id: from }, classes: `incoming ${isBybit ? 'bybit' : ''}` });
            }
            if (to !== this.address && !this.cy.getElementById(to).length) {
                const isBybit = bybitAddressMap.has(to);
                this.cy.add({ group: 'nodes', data: { id: to }, classes: `outgoing ${isBybit ? 'bybit' : ''}` });
            }
            this.cy.add({ group: 'edges', data: { source: from, target: to, amount: tx.amount } });
        });
        this.cy.layout({ name: 'cose' }).run();
    }

    updateConnections() {
        this.cy.layout({ name: 'cose' }).run();
    }
}

const visualizer = new TransactionFlowVisualizer('transaction-flow');

// Validate Solana address
function isValidSolanaAddress(address) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Fetch wallet data
async function fetchWalletData() {
    const address = document.getElementById('primary-address').value;
    if (!isValidSolanaAddress(address)) return alert('Please enter a valid Solana address');

    showLoading(true);
    try {
        // Fetch balance with rate limiting
        const balanceResponse = await apiRateLimiter.addRequest(() => 
            fetch(`${apiUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [address]
                })
            })
        );
        
        const balanceData = await balanceResponse.json();
        if (balanceData.error) {
            if (balanceData.error.message && balanceData.error.message.includes('rate limit')) {
                throw new Error('API rate limit exceeded. Please try again in a moment.');
            }
            throw new Error(balanceData.error.message);
        }

        // Fetch transaction signatures with rate limiting
        const txResponse = await apiRateLimiter.addRequest(() => 
            fetch(`${apiUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getSignaturesForAddress',
                    params: [address, { limit: 100 }]
                })
            })
        );
        
        const txData = await txResponse.json();
        if (txData.error) {
            if (txData.error.message && txData.error.message.includes('rate limit')) {
                throw new Error('API rate limit exceeded. Please try again in a moment.');
            }
            throw new Error(txData.error.message);
        }

        // Process transactions with proper error handling
        const balance = balanceData.result.value / 1e9; // Convert lamports to SOL
        
        if (!txData.result || !Array.isArray(txData.result)) {
            console.warn('No transaction data available for address:', address);
            updateAddressOverview(balance, 0);
            updateTransactionMetrics([]);
            updateRecentTransactions([]);
            visualizer.setAddress(address);
            return;
        }
        
        // Process with rate limiting
        const transactions = [];
        for (const tx of txData.result) {
            try {
                const details = await fetchTransactionDetails(tx.signature);
                if (details) {
                    transactions.push({
                        hash: tx.signature,
                        from: details.from || address,
                        to: details.to || 'unknown',
                        amount: details.amount || 0,
                        date: new Date(tx.blockTime * 1000).toISOString(),
                        type: details.type || 'unknown'
                    });
                }
            } catch (error) {
                console.error(`Error processing transaction ${tx.signature}:`, error);
                // Continue with other transactions
            }
        }

        // Update UI
        updateAddressOverview(balance, transactions.length);
        updateTransactionMetrics(transactions);
        updateRecentTransactions(transactions);
        visualizer.setAddress(address);
        visualizer.visualizeTransactions(transactions);


        // Update Network Intelligence
        updateNetworkIntelligence(transactions);
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        alert(`Error fetching wallet data: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Analyze Bybit address relations
async function analyzeBybitRelations() {
    const primary = document.getElementById('primary-address').value;
    const interactionType = document.getElementById('interaction-type').value;
    if (!isValidSolanaAddress(primary)) return alert('Please enter a valid Solana address');

    showLoading(true);
    try {
        // Fetch wallet data first
        await fetchWalletData();

        // Check against Bybit addresses
        const bybitMatches = await checkBybitAddresses(primary, interactionType);
        if (bybitMatches.length > 0) {
            displayRelationResults(bybitMatches, true, primary);
        } else {
            displayRelationResults([], true, primary, 'No transaction paths found to Bybit addresses.');
        }
    } catch (error) {
        console.error('Error in analyzeBybitRelations:', error);
        alert(`Error analyzing Bybit relations: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Check transactions to Bybit addresses
async function checkBybitAddresses(address, interactionType) {
    const matches = [];
    
    // First check for direct connections for efficiency
    try {
        const directPaths = await checkDirectTransactions(address, interactionType);
        if (directPaths.length > 0) {
            matches.push(...directPaths);
        }
    } catch (error) {
        console.error('Error checking direct transactions:', error);
        // Continue with other methods
    }
    
    // Only check indirect paths if necessary and if direct paths weren't found
    if (matches.length === 0) {
        for (const bybit of bybitAddresses) {
            try {
                const paths = await analyzeTransactionPath(address, bybit.address, interactionType);
                if (paths.length > 0) {
                    matches.push({ target: bybit, paths });
                }
                
                // Add a small delay between checks to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Error analyzing transaction path to ${bybit.address}:`, error);
              
            }
        }
    }
    
    return matches;
}

// Check for direct transactions to any Bybit address
async function checkDirectTransactions(address, interactionType) {
    const matches = [];
    
    try {
        // Fetch transaction signatures with rate limiting
        const txResponse = await apiRateLimiter.addRequest(() => 
            fetch(`${apiUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getSignaturesForAddress',
                    params: [address, { limit: 100 }]
                })
            })
        );
        
        const txData = await txResponse.json();
        if (txData.error) throw new Error(txData.error.message);
        
        if (!txData.result || !Array.isArray(txData.result)) {
            return matches;
        }
        
        // Check each transaction
        for (const tx of txData.result) {
            try {
                const details = await fetchTransactionDetails(tx.signature);
                if (!details) continue;
                
                const { from, to, type, amount } = details;
                
                // Filter by interaction type
                if (interactionType !== 'all' && !isValidInteraction(type, interactionType)) {
                    continue;
                }
                
                // Check if destination is a Bybit address
                const bybitTarget = bybitAddressMap.get(to);
                if (bybitTarget) {
                    matches.push({
                        target: bybitTarget,
                        paths: [[{ tx, from, to, type, amount }]]
                    });
                }
            } catch (error) {
                console.error(`Error checking transaction ${tx.signature}:`, error);
                // Continue with other transactions
            }
        }
    } catch (error) {
        console.error(`Error in checkDirectTransactions:`, error);
        throw error; // Re-throw to handle in the calling function
    }
    
    return matches;
}

// Analyze transaction paths (max 1 hop)
async function analyzeTransactionPath(sender, target, interactionType) {
    const paths = [];
    const visited = new Set();
    const queue = [[sender, []]];
    const maxDepth = 1;

    while (queue.length && paths.length < 20) { // Limit paths for performance
        const [current, path] = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);

        try {
            // Fetch transaction signatures with rate limiting
            const txResponse = await apiRateLimiter.addRequest(() => 
                fetch(`${apiUrl}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getSignaturesForAddress',
                        params: [current, { limit: 50 }] // Reduced limit for performance
                    })
                })
            );
            
            const txData = await txResponse.json();
            if (txData.error) {
                if (txData.error.message && txData.error.message.includes('rate limit')) {
                    console.warn('Rate limit hit, waiting and retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                throw new Error(txData.error.message);
            }

            if (!txData.result || !Array.isArray(txData.result)) {
                console.warn(`No valid transaction data for address ${current}. Result:`, txData.result);
                continue;
            }

            const transactions = txData.result.slice(0, 30); // Limit to first 30 transactions
            
            for (const tx of transactions) {
                try {
                    const txDetails = await fetchTransactionDetails(tx.signature);
                    if (!txDetails) continue;

                    const { from, to, type, amount } = txDetails;

                    // Filter by interaction type
                    if (interactionType !== 'all' && !isValidInteraction(type, interactionType)) {
                        continue;
                    }

                 
                    
                    // Direct match to target
                    if (to === target) {
                        paths.push([...path, { tx: tx, from, to, type, amount }]);
                        // Stop after finding some paths to improve performance
                        if (paths.length >= 5) break;
                    }
                    
                    // Add to queue for next hop if within depth limit
                    if (path.length < maxDepth && !visited.has(to)) {
                        queue.push([to, [...path, { tx: tx, from, to, type, amount }]]);
                    }
                } catch (error) {
                    console.error(`Error processing transaction ${tx.signature}:`, error);
                    // Continue with other transactions
                }
            }
        } catch (error) {
            console.error(`Error fetching transactions for ${current}:`, error);
            continue;
        }
    }

    return paths;
}

// Fetch transaction details with rate limiting
async function fetchTransactionDetails(signature) {
    try {
        const response = await apiRateLimiter.addRequest(() => 
            fetch(`${apiUrl}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTransaction',
                    params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
                })
            })
        );
        
        const data = await response.json();
        
        if (data.error) {
            if (data.error.message && data.error.message.includes('rate limit')) {
                console.warn('Rate limit hit in fetchTransactionDetails, waiting and retrying...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return null;
            }
            throw new Error(data.error.message);
        }
        
        if (!data.result) return null;

        const { transaction, meta } = data.result;
        const accounts = transaction.message.accountKeys;
        
        if (!accounts || accounts.length < 2) {
            console.warn(`Invalid accounts data for transaction ${signature}`);
            return null;
        }

        // Determine transaction type and details
        let type = 'transaction';
        let amount = 0;
        
        if (meta && meta.preBalances && meta.postBalances && meta.preBalances.length > 1 && meta.postBalances.length > 1) {
            amount = (meta.postBalances[1] - meta.preBalances[1]) / 1e9; // Convert lamports to SOL
        }

        // Check for SPL token transfers
        const instructions = transaction.message.instructions;
        if (instructions && Array.isArray(instructions)) {
            for (const ix of instructions) {
                if (ix.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
                    type = 'transfer';
                    if (ix.parsed && ix.parsed.info && ix.parsed.info.amount) {
                        amount = parseFloat(ix.parsed.info.amount) / 1e9;
                    }
                    break;
                }
            }
        }

        return {
            from: accounts[0]?.pubkey || 'unknown',
            to: accounts[1]?.pubkey || 'unknown',
            amount,
            type,
            signature
        };
    } catch (error) {
        console.error(`Error fetching transaction ${signature}:`, error);
        return null;
    }
}

// Filter by interaction type
function isValidInteraction(txType, interactionType) {
    if (interactionType === 'all') return true;
    if (interactionType === 'transfers') return txType === 'transfer';
    if (interactionType === 'transactions') return txType === 'transaction';
    return false;
}
// Display relation results with detailed info and better error handling
function displayRelationResults(matches, isBybit = false, primaryAddress = '', noResultsMessage = '') {
    let results = '';
    let summary = '';

    if (matches.length === 0) {
        results = `<p class="alert alert-info">${noResultsMessage || 'No transaction paths found.'}</p>`;
    } else {
        const pathDetailsHtml = [];
        
        matches.forEach(match => {
            const { target, paths } = match;
            if (!paths || paths.length === 0) return;
            
            paths.forEach(path => {
                if (!Array.isArray(path) || path.length === 0) return;
                
                const lastHop = path[path.length - 1];
                if (!lastHop || !lastHop.tx) return;
                
                const pathDetail = `
                    <div class="card mb-3 bg-dark border-secondary text-white">
                        <div class="card-header bg-secondary text-white">
                            <strong>Path to ${target.name} (${formatAddressShort(target.address)})</strong>
                        </div>
                        <div class="card-body text-white">
                            <p><strong>Path:</strong> ${path.map(p => `${formatAddressShort(p.from)} → ${formatAddressShort(p.to)}`).join(' → ')}</p>
                            <p><strong>Transaction Hash:</strong> <a href="https://solscan.io/tx/${lastHop.tx.signature}" target="_blank">${lastHop.tx.signature.substring(0, 12)}...${lastHop.tx.signature.substring(lastHop.tx.signature.length - 8)}</a></p>
                            <p><strong>Type:</strong> ${lastHop.type || 'unknown'}</p>
                            <p><strong>Amount:</strong> ${(lastHop.amount || 0).toFixed(4)} ${lastHop.type === 'transfer' ? 'Tokens' : 'SOL'}</p>
                        </div>
                    </div>
                `;
                pathDetailsHtml.push(pathDetail);
            });
        });
        
        results = pathDetailsHtml.join('');
        
        // Calculate summary data
        const allPaths = matches.flatMap(m => m.paths).filter(Boolean);
        const minHops = Math.min(...allPaths.map(p => p.length || Infinity));
        const intermediaryAddresses = [...new Set(
            allPaths
                .flatMap(p => p.map(x => x.to))
                .filter(addr => 
                    addr !== primaryAddress && 
                    !bybitAddresses.some(b => b.address === addr)
                )
        )];
        
        summary = `
            <div class="card mb-4 bg-dark border-warning">
                <div class="card-header bg-warning text-dark">
                    <h4 class="mb-0">Path Analysis Summary</h4>
                </div>
                <div class="card-body text-white">
                    <div class="row">
                        <div class="col-md-6 text-white">
                            <p><strong>Minimum hops required:</strong> ${isFinite(minHops) ? minHops : 'N/A'}</p>
                            <p><strong>Unique intermediary addresses:</strong> ${intermediaryAddresses.length}</p>
                        </div>
                        <div class="col-md-6 text-white">
                            <p><strong>Total transaction paths found:</strong> ${allPaths.length}</p>
                            <p><strong>Address analyzed:</strong> ${formatAddressShort(primaryAddress)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <h5 class="mb-3 text-white">Transaction Paths</h5>
            ${results}
            <div class="card bg-dark border-info mt-3 text-white">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0 text-white">Intermediary Addresses</h5>
                </div>
                <div class="card-body text-white">
                    ${intermediaryAddresses.length > 0 ? 
                        `<div class="address-list">${intermediaryAddresses.map(a => 
                            `<span class="badge bg-secondary me-2 mb-2 text-white">${formatAddressShort(a)}</span>`
                        ).join('')}</div>` : 
                        '<p>No intermediary addresses found</p>'}
                </div>
            </div>
        `;
    }

    if (isBybit) {
        summary = `
            <div class="alert alert-warning">
                <h4 class="alert-heading">Bybit Hack Address Analysis</h4>
                <p>Results for address connections to known Bybit hack addresses.</p>
            </div>
            ${summary}
        `;
    }

    document.getElementById('relation-results').innerHTML = summary || results;
    new bootstrap.Modal(document.getElementById('relationModal')).show();
}


// Update UI components
function updateAddressOverview(balance, txCount) {
    document.getElementById('address-balance').innerHTML = `<p><strong>Balance:</strong> ${balance.toFixed(4)} SOL</p>`;
    document.getElementById('transaction-counts').innerHTML = `<p><strong>Transactions:</strong> ${txCount}</p>`;
    document.getElementById('pattern-analysis').innerHTML = `<p><strong>Pattern:</strong> ${txCount > 50 ? 'High Activity' : 'Normal'}</p>`;
    document.getElementById('transaction-breakdowns').innerHTML = `<p><strong>Incoming/Outgoing:</strong> N/A</p>`;
}

function updateTransactionMetrics(transactions) {
    const totalVolume = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    document.getElementById('metrics').innerHTML = `<p><strong>Total Volume:</strong> ${totalVolume.toFixed(4)} SOL</p>`;
}

function updateNetworkIntelligence(transactions) {
    document.getElementById('transaction-hops').innerHTML = `<p><strong>Hops:</strong> ${transactions.length > 0 ? '1+' : '0'}</p>`;
    document.getElementById('connected-addresses').innerHTML = `<p><strong>Connected Addresses:</strong> ${new Set(transactions.map(tx => tx.to)).size}</p>`;
    document.getElementById('token-metrics').innerHTML = `<p><strong>Token Transfers:</strong> ${transactions.filter(tx => tx.type === 'transfer').length}</p>`;
    
    const dates = transactions.map(tx => new Date(tx.date));
    const firstDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
    const lastDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
    
    document.getElementById('transaction-timestamps').innerHTML = `<p><strong>First/Last Tx:</strong> ${
        transactions.length > 0 ? 
        `${firstDate.toLocaleDateString()} / ${lastDate.toLocaleDateString()}` : 
        'N/A'
    }</p>`;
    
      document.getElementById('pattern-classification').innerHTML = `<p><strong>Pattern:</strong> ${transactions.length > 50 ? 'High Frequency' : 'Normal'}</p>`;
}

// Update recent transactions table

function updateRecentTransactions(txs) {
    const container = document.getElementById("recent-transactions");
    if (!container) return;

    if (!txs || txs.length === 0) {
        container.innerHTML = `<tr><td colspan="5">No transactions</td></tr>`;
        return;
    }

    let html = '';
    for (const tx of txs) {
        const fromBybit = bybitAddressMap.get(tx.from);
        const toBybit = bybitAddressMap.get(tx.to);
        html += `
        <tr>
            <td><a href="https://solscan.io/tx/${tx.hash}" target="_blank">${tx.hash}</a></td>
            <td>${tx.from} ${fromBybit ? `<span class="badge bg-warning">${fromBybit.name}</span>` : ''}</td>
            <td>${tx.to} ${toBybit ? `<span class="badge bg-warning">${toBybit.name}</span>` : ''}</td>
            <td>${tx.amount.toFixed(4)}</td>
            <td>${new Date(tx.date).toLocaleString()}</td>
        </tr>`;
    }
    container.innerHTML = html;
}
// Format address for display in tables
function formatAddressShort(address) {
    if (address.length > 8) {
        return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
    }
    return address;
}

// Show/hide loading indicator
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

  function showGuide() {
            alert('An open-source crypto forensic tool that maps transactional relationships between a suspicious Solana wallet and known hacker addresses, starting with the February 2025 Bybit exploit. Type a suspicious Solana address to check.');
        }

// CSV Export
function exportRelationToCSV() {
    const addr = document.getElementById("primary-address").value;
    const table = document.querySelector("table");
    if (!table) return alert("No table found");

    const rows = Array.from(table.querySelectorAll("tr"));
    let csv = "Transaction Hash,From,To,Amount,Date\n";
    for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll("td")).map(c => `"${c.innerText.trim()}"`);
        if (cells.length === 5) csv += cells.join(",") + "\n";
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `solana-${addr.slice(0, 8)}.csv`);
    link.click();
}