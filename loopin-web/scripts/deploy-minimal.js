import { makeContractDeploy, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY = '2b51367941ab76eea8b5ba91085ca63178912e553c5dc8faba98d2d0ac87fce501';

async function go() {
  console.log('📦 Loading contract...');
  const code = fs.readFileSync(path.join(__dirname, '../contracts/loopin-game.clar'), 'utf8');
  
  console.log('🔨 Making transaction...');
  const tx = await makeContractDeploy({
    contractName: 'loopin-game',
    codeBody: code,
    senderKey: KEY,
    network: STACKS_TESTNET,
    anchorMode: AnchorMode.Any,
  });
  
  console.log('📡 Broadcasting...');
  const result = await broadcastTransaction({ transaction: tx, network: STACKS_TESTNET });
  
  console.log('\n✅ DONE!');
  console.log('TX ID:', result.txid || result);
  console.log('View:', `https://explorer.hiro.so/txid/${result.txid || result}?chain=testnet`);
}

go().catch(e => {
  console.error('❌ Error:', e.message);
  console.error('Details:', e);
});


