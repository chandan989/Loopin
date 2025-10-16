/**
 * Simplified deployment script with better error handling
 */
import * as transactions from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '2b51367941ab76eea8b5ba91085ca63178912e553c5dc8faba98d2d0ac87fce501';
const network = STACKS_TESTNET;

async function deploy() {
  console.log('\n🚀 DEPLOYING LOOPIN CONTRACT TO TESTNET\n');
  
  try {
    // Read contract
    const contractPath = path.join(__dirname, '../contracts/loopin-game.clar');
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    console.log('✓ Contract loaded:', contractSource.length, 'bytes');
    
    // Get address
    const address = transactions.getAddressFromPrivateKey(PRIVATE_KEY, 'testnet');
    console.log('✓ Address:', address);
    
    // Get nonce
    const nonce = await transactions.fetchNonce({ address, network });
    console.log('✓ Nonce:', nonce);
    
    // Create transaction with higher fee
    console.log('\n📝 Creating transaction...');
    const txOptions = {
      contractName: 'loopin-game',
      codeBody: contractSource,
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: transactions.AnchorMode.Any,
      postConditionMode: transactions.PostConditionMode.Allow,
      nonce: BigInt(nonce),
      fee: BigInt(500000) // 0.5 STX - much higher fee
    };
    
    const transaction = await transactions.makeContractDeploy(txOptions);
    console.log('✓ Transaction created');
    
    // Serialize and broadcast manually
    console.log('\n📡 Broadcasting...');
    const serialized = transaction.serialize();
    const txHex = Buffer.from(serialized).toString('hex');
    
    const response = await fetch(`${network.client.baseUrl}/v2/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tx: txHex })
    });
    
    const responseText = await response.text();
    console.log('\n📥 Response:', response.status, response.statusText);
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      throw new Error(`Deployment failed: ${response.status} - ${responseText}`);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      // If response is just a txid string
      result = { txid: responseText.replace(/"/g, '') };
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ✅ DEPLOYMENT SUCCESSFUL!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Transaction ID:', result.txid || result);
    console.log('\n📍 Track deployment:');
    console.log(`   https://explorer.hiro.so/txid/${result.txid || result}?chain=testnet`);
    console.log('\n⏳ Wait 10-20 minutes for confirmation');
    console.log('\n📝 Your contract address:', address);
    console.log('   Contract name: loopin-game');
    console.log('\n💾 Add to your .env file:');
    console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED');
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
    process.exit(1);
  }
}

deploy();


