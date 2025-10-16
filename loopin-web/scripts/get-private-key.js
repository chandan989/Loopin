/**
 * Convert seed phrase to private key
 */
import { generateWallet, getStxAddress } from '@stacks/wallet-sdk';

const MNEMONIC = process.argv[2];

if (!MNEMONIC) {
  console.error('Usage: node get-private-key.js "your 24 word seed phrase"');
  process.exit(1);
}

async function getPrivateKey() {
  const wallet = await generateWallet({
    secretKey: MNEMONIC,
    password: '', // No password needed for key derivation
  });

  const account = wallet.accounts[0];
  const privateKey = account.stxPrivateKey;
  const address = getStxAddress({ account, transactionVersion: 'testnet' });

  console.log('\n✅ WALLET INFO:');
  console.log('═══════════════════════════════════════');
  console.log('Address (Testnet):', address);
  console.log('Private Key:', privateKey);
  console.log('═══════════════════════════════════════');
  console.log('\n⚠️  KEEP THIS PRIVATE KEY SECRET!');
  console.log('Copy it to your .env file\n');
}

getPrivateKey();



