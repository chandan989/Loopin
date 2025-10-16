/**
 * ═══════════════════════════════════════════════════════════════════
 *  STACKS BLOCKCHAIN CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════
 */

import { STACKS_MAINNET, STACKS_TESTNET, STACKS_DEVNET } from '@stacks/network';

// Get configuration from environment variables
const NETWORK = import.meta.env.VITE_STACKS_NETWORK || 'testnet';
const API_URL = import.meta.env.VITE_STACKS_API_URL || 'https://api.testnet.hiro.so';
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
export const CONTRACT_NAME = import.meta.env.VITE_CONTRACT_NAME || 'loopin-game';
export const ENABLE_WEB3 = import.meta.env.VITE_ENABLE_WEB3 === 'true';

/**
 * Get the network instance based on configuration
 */
export const getStacksNetwork = () => {
  switch (NETWORK) {
    case 'mainnet':
      return { ...STACKS_MAINNET, client: { baseUrl: API_URL } };
    case 'devnet':
      return { ...STACKS_DEVNET, client: { baseUrl: API_URL } };
    case 'testnet':
    default:
      return { ...STACKS_TESTNET, client: { baseUrl: API_URL } };
  }
};

/**
 * Network configuration
 */
export const stacksNetwork = getStacksNetwork();

/**
 * App configuration for Stacks Connect
 */
export const appConfig = {
  name: 'Loopin Game',
  icon: window.location.origin + '/logo.svg',
};

/**
 * Contract constants
 */
export const MICRO_STX = 1_000_000; // 1 STX = 1,000,000 microSTX

export const COSTS = {
  ENTRY_FEE: 0.5 * MICRO_STX, // 0.5 STX
  SHIELD: 0.5 * MICRO_STX, // 0.5 STX
  STEALTH: 1 * MICRO_STX, // 1 STX
};

/**
 * Power-up types matching the contract
 */
export const POWERUP_TYPES = {
  SHIELD: 1,
  STEALTH: 2,
} as const;

/**
 * Game status types
 */
export const GAME_STATUS = {
  LOBBY: 'lobby',
  ACTIVE: 'active',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
} as const;

/**
 * Explorer URLs
 */
export const getExplorerUrl = (txId: string) => {
  const chain = NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
  return `https://explorer.hiro.so/txid/${txId}?chain=${chain}`;
};

export const getAddressExplorerUrl = (address: string) => {
  const chain = NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
  return `https://explorer.hiro.so/address/${address}?chain=${chain}`;
};

