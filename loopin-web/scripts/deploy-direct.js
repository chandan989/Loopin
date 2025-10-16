/**
 * Direct API deployment - no libraries in the way
 */
import crypto from 'crypto';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIVATE_KEY = '2b51367941ab76eea8b5ba91085ca63178912e553c5dc8faba98d2d0ac87fce501';
const API_URL = 'https://api.testnet.hiro.so';

async function deployDirect() {
  console.log('\n🚀 DIRECT DEPLOYMENT TO STACKS TESTNET\n');
  
  try {
    // Read contract
    const contractPath = path.join(__dirname, '../contracts/loopin-game.clar');
    const contractCode = fs.readFileSync(contractPath, 'utf8');
    console.log('✓ Contract loaded:', contractCode.length, 'bytes');
    
    // Use Stacks.js just for transaction building
    const { makeContractDeploy, broadcastRawTransaction, getAddressFromPrivateKey, fetchNonce } = await import('@stacks/transactions');
    const { STACKS_TESTNET } = await import('@stacks/network');
    
    // Get address
    const address = getAddressFromPrivateKey(PRIVATE_KEY, 'testnet');
    console.log('✓ Address:', address);
    
    // Check nonce
    console.log('✓ Checking account nonce...');
    const nonceResponse = await fetch(`${API_URL}/v2/accounts/${address}?proof=0`);
    const accountData = await nonceResponse.json();
    const nonce = parseInt(accountData.nonce);
    console.log('✓ Current nonce:', nonce);
    
    // Build transaction
    console.log('✓ Building transaction...');
    const txOptions = {
      contractName: 'loopin-game',
      codeBody: contractCode,
      senderKey: PRIVATE_KEY,
      network: STACKS_TESTNET,
      nonce: BigInt(nonce),
      fee: BigInt(500000), // 0.5 STX
    };
    
    const transaction = await makeContractDeploy(txOptions);
    console.log('✓ Transaction created');
    
    // Serialize
    const serialized = transaction.serialize();
    const txHex = Buffer.from(serialized).toString('hex');
    console.log('✓ Transaction serialized');
    
    // Direct POST to API
    console.log('✓ Broadcasting directly to API...');
    const response = await fetch(`${API_URL}/v2/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tx: txHex })
    });
    
    const statusCode = response.status;
    const responseText = await response.text();
    
    console.log('\n📥 API Response:');
    console.log('   Status:', statusCode);
    console.log('   Body:', responseText);
    
    if (statusCode !== 200) {
      throw new Error(`API returned ${statusCode}: ${responseText}`);
    }
    
    // Parse response (might be JSON or plain text)
    let txid;
    try {
      const json = JSON.parse(responseText);
      txid = json.txid || json;
    } catch {
      txid = responseText.replace(/"/g, '');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ✅ CONTRACT DEPLOYED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Transaction ID:', txid);
    console.log('\n📍 View on Explorer:');
    console.log(`   https://explorer.hiro.so/txid/${txid}?chain=testnet`);
    console.log('\n📝 Your Contract:');
    console.log('   Address:', address);
    console.log('   Name: loopin-game');
    console.log('\n⏳ Wait 10-20 minutes for confirmation...');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    return txid;
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  }
}

deployDirect();


