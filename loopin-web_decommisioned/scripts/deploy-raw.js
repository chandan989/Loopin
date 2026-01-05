/**
 * Raw deployment using direct HTTP requests
 */
import { STACKS_TESTNET } from '@stacks/network';
import { 
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIVATE_KEY = '2b51367941ab76eea8b5ba91085ca63178912e553c5dc8faba98d2d0ac87fce501';

async function deploy() {
  console.log('\n🚀 DEPLOYING LOOPIN CONTRACT\n');
  
  try {
    // Read contract
    const contractPath = path.join(__dirname, '../contracts/loopin-game.clar');
    const codeBody = fs.readFileSync(contractPath, 'utf8');
    console.log('✓ Contract loaded');
    
    // Create network
    const network = STACKS_TESTNET;
    console.log('✓ Network configured');
    
    // Build transaction
    const txOptions = {
      contractName: 'loopin-game',
      codeBody,
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      fee: 500000, // 0.5 STX
      nonce: 1,
    };
    
    console.log('✓ Creating transaction...');
    const transaction = await makeContractDeploy(txOptions);
    console.log('✓ Transaction created');
    
    // Broadcast
    console.log('✓ Broadcasting...');
    const response = await broadcastTransaction({ transaction, network });
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ✅ DEPLOYMENT SUCCESSFUL!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Transaction ID:', response.txid || response);
    console.log('\n📍 Track here:');
    console.log(`   https://explorer.hiro.so/txid/${response.txid || response}?chain=testnet`);
    console.log('\n📝 Contract deployed to: ST2TE8WMQW09ASVTXP4V2NA2C7MGCP0BQRZ9HEFC');
    console.log('   Contract name: loopin-game');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

deploy();

