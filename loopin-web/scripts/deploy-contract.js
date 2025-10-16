/**
 * ═══════════════════════════════════════════════════════════════════
 *  LOOPIN SMART CONTRACT DEPLOYMENT SCRIPT
 * ═══════════════════════════════════════════════════════════════════
 * 
 * This script deploys the Loopin game smart contract to Stacks blockchain
 * 
 * Usage:
 *   node scripts/deploy-contract.js [network]
 * 
 * Networks: testnet (default) | mainnet | devnet
 */

import * as transactions from '@stacks/transactions';
const { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode, fetchNonce, getAddressFromPrivateKey } = transactions;
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const NETWORKS = {
  testnet: STACKS_TESTNET,
  mainnet: STACKS_MAINNET
};

// Get network from command line or use testnet by default
const networkName = process.argv[2] || 'testnet';
const network = NETWORKS[networkName];

if (!network) {
  console.error(`❌ Invalid network: ${networkName}`);
  console.log('Valid networks: testnet, mainnet');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════
//  LOAD ENVIRONMENT VARIABLES
// ═══════════════════════════════════════════════════════════════════

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

if (!DEPLOYER_PRIVATE_KEY) {
  console.error('❌ Error: DEPLOYER_PRIVATE_KEY environment variable is required');
  console.log('\nSet it in your .env file or export it:');
  console.log('  export DEPLOYER_PRIVATE_KEY="your_private_key_here"');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════
//  DEPLOYMENT FUNCTION
// ═══════════════════════════════════════════════════════════════════

async function deployContract() {
  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  LOOPIN CONTRACT DEPLOYMENT');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Network: ${networkName}`);
    console.log(`API URL: ${network.client.baseUrl}`);
    console.log('');

    // Read contract file
    const contractPath = path.join(__dirname, '../contracts/loopin-game.clar');
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    console.log('✓ Contract source loaded');
    console.log(`  File: ${contractPath}`);
    console.log(`  Size: ${contractSource.length} bytes`);
    console.log('');

    // Get address from private key
    const transactionVersion = networkName === 'testnet' ? 'testnet' : 'mainnet';
    const address = getAddressFromPrivateKey(DEPLOYER_PRIVATE_KEY, transactionVersion);
    console.log(`✓ Address: ${address}`);
    console.log('');

    // Get nonce
    console.log('Fetching nonce...');
    const nonceResponse = await fetchNonce({ address, network });
    const nonce = BigInt(nonceResponse);
    console.log(`✓ Nonce: ${nonce}`);
    console.log('');

    // Create contract deploy transaction
    console.log('Creating deployment transaction...');
    const txOptions = {
      contractName: 'loopin-game',
      codeBody: contractSource,
      senderKey: DEPLOYER_PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce,
      fee: BigInt(50000) // 0.05 STX fee
    };

    const transaction = await makeContractDeploy(txOptions);
    console.log('✓ Transaction created');
    console.log('');

    // Broadcast transaction
    console.log('Broadcasting transaction...');
    let broadcastResponse;
    try {
      broadcastResponse = await broadcastTransaction({ transaction, network });
      console.log('Broadcast response:', JSON.stringify(broadcastResponse, null, 2));
    } catch (err) {
      console.error('Broadcast error details:', err);
      throw err;
    }
    
    if (broadcastResponse.error) {
      throw new Error(broadcastResponse.error);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ✅ DEPLOYMENT SUCCESSFUL!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log('');
    console.log('📡 Track your deployment:');
    
    if (networkName === 'testnet') {
      console.log(`   https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    } else if (networkName === 'mainnet') {
      console.log(`   https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);
    }
    
    console.log('');
    console.log('⏳ Wait for confirmation (usually 10-20 minutes)');
    console.log('');
    console.log('📝 Save this info to your .env:');
    console.log(`   CONTRACT_ADDRESS=<your-stacks-address>`);
    console.log(`   CONTRACT_NAME=loopin-game`);
    console.log(`   NETWORK=${networkName}`);
    console.log('═══════════════════════════════════════════════════════════════');

    // Save deployment info
    const deploymentInfo = {
      network: networkName,
      contractName: 'loopin-game',
      txid: broadcastResponse.txid,
      timestamp: new Date().toISOString(),
      explorerUrl: networkName === 'testnet' 
        ? `https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`
        : `https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`
    };

    const deploymentPath = path.join(__dirname, `../deployment-${networkName}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);
    console.log('');

  } catch (error) {
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('  ❌ DEPLOYMENT FAILED');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('  1. Invalid private key');
    console.error('  2. Insufficient STX balance for fees');
    console.error('  3. Network connectivity issues');
    console.error('  4. Contract syntax errors');
    console.error('═══════════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  RUN DEPLOYMENT
// ═══════════════════════════════════════════════════════════════════

deployContract();

