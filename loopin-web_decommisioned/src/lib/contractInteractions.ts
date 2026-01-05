/**
 * ═══════════════════════════════════════════════════════════════════
 *  SMART CONTRACT INTERACTION UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  standardPrincipalCV,
  cvToValue,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { StacksNetwork } from '@stacks/network';
import { UserSession } from '@stacks/connect';
import { openContractCall } from '@stacks/connect';
import { stacksNetwork, CONTRACT_ADDRESS, CONTRACT_NAME } from './stacksConfig';
import { toast } from 'sonner';

/**
 * ═══════════════════════════════════════════════════════════════════
 *  GAME MANAGEMENT FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Create a new game session
 */
export const createGame = async (userSession: UserSession) => {
  const userData = userSession.loadUserData();
  
  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-game',
    functionArgs: [],
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    appDetails: {
      name: 'Loopin Game',
      icon: window.location.origin + '/logo.svg',
    },
    onFinish: (data: any) => {
      toast.success('Game created! Transaction submitted.');
      console.log('Transaction ID:', data.txId);
      return data;
    },
    onCancel: () => {
      toast.error('Transaction cancelled');
    },
  };

  await openContractCall(options);
};

/**
 * Join a game session
 */
export const joinGame = async (gameId: number, userSession: UserSession) => {
  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'join-game',
    functionArgs: [uintCV(gameId)],
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    appDetails: {
      name: 'Loopin Game',
      icon: window.location.origin + '/logo.svg',
    },
    onFinish: (data: any) => {
      toast.success('Joined game! Transaction submitted.');
      console.log('Transaction ID:', data.txId);
      return data;
    },
    onCancel: () => {
      toast.error('Transaction cancelled');
    },
  };

  await openContractCall(options);
};

/**
 * Start a game session
 */
export const startGame = async (gameId: number, userSession: UserSession) => {
  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'start-game',
    functionArgs: [uintCV(gameId)],
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    appDetails: {
      name: 'Loopin Game',
      icon: window.location.origin + '/logo.svg',
    },
    onFinish: (data: any) => {
      toast.success('Game started! Transaction submitted.');
      console.log('Transaction ID:', data.txId);
      return data;
    },
    onCancel: () => {
      toast.error('Transaction cancelled');
    },
  };

  await openContractCall(options);
};

/**
 * End game and declare winner
 */
export const endGame = async (gameId: number, winner: string, userSession: UserSession) => {
  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'end-game',
    functionArgs: [
      uintCV(gameId),
      standardPrincipalCV(winner)
    ],
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    appDetails: {
      name: 'Loopin Game',
      icon: window.location.origin + '/logo.svg',
    },
    onFinish: (data: any) => {
      toast.success('Game ended! Prize distributed.');
      console.log('Transaction ID:', data.txId);
      return data;
    },
    onCancel: () => {
      toast.error('Transaction cancelled');
    },
  };

  await openContractCall(options);
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *  POWER-UP FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Buy shield power-up
 */
export const buyShield = async (gameId: number, userSession: UserSession) => {
  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'buy-shield',
    functionArgs: [uintCV(gameId)],
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    appDetails: {
      name: 'Loopin Game',
      icon: window.location.origin + '/logo.svg',
    },
    onFinish: (data: any) => {
      toast.success('Shield purchased! 🛡️');
      console.log('Transaction ID:', data.txId);
      return data;
    },
    onCancel: () => {
      toast.error('Transaction cancelled');
    },
  };

  await openContractCall(options);
};

/**
 * Buy stealth power-up
 */
export const buyStealth = async (gameId: number, userSession: UserSession) => {
  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'buy-stealth',
    functionArgs: [uintCV(gameId)],
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    appDetails: {
      name: 'Loopin Game',
      icon: window.location.origin + '/logo.svg',
    },
    onFinish: (data: any) => {
      toast.success('Stealth mode purchased! 👻');
      console.log('Transaction ID:', data.txId);
      return data;
    },
    onCancel: () => {
      toast.error('Transaction cancelled');
    },
  };

  await openContractCall(options);
};

/**
 * Use shield
 */
export const useShield = async (gameId: number, userSession: UserSession) => {
  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'use-shield',
    functionArgs: [uintCV(gameId)],
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    appDetails: {
      name: 'Loopin Game',
      icon: window.location.origin + '/logo.svg',
    },
    onFinish: (data: any) => {
      toast.success('Shield activated! 🛡️');
      console.log('Transaction ID:', data.txId);
      return data;
    },
    onCancel: () => {
      toast.error('Transaction cancelled');
    },
  };

  await openContractCall(options);
};

/**
 * Use stealth
 */
export const useStealth = async (gameId: number, userSession: UserSession) => {
  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'use-stealth',
    functionArgs: [uintCV(gameId)],
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    appDetails: {
      name: 'Loopin Game',
      icon: window.location.origin + '/logo.svg',
    },
    onFinish: (data: any) => {
      toast.success('Stealth mode activated! 👻');
      console.log('Transaction ID:', data.txId);
      return data;
    },
    onCancel: () => {
      toast.error('Transaction cancelled');
    },
  };

  await openContractCall(options);
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *  READ-ONLY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Get game details
 */
export const getGame = async (gameId: number) => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-game',
      functionArgs: [uintCV(gameId)],
      network: stacksNetwork,
      senderAddress: CONTRACT_ADDRESS,
    });

    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching game:', error);
    throw error;
  }
};

/**
 * Get player data in game
 */
export const getPlayerInGame = async (gameId: number, playerAddress: string) => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-player-in-game',
      functionArgs: [
        uintCV(gameId),
        standardPrincipalCV(playerAddress)
      ],
      network: stacksNetwork,
      senderAddress: CONTRACT_ADDRESS,
    });

    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching player data:', error);
    throw error;
  }
};

/**
 * Get player power-ups
 */
export const getPlayerPowerups = async (gameId: number, playerAddress: string) => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-player-powerups',
      functionArgs: [
        uintCV(gameId),
        standardPrincipalCV(playerAddress)
      ],
      network: stacksNetwork,
      senderAddress: CONTRACT_ADDRESS,
    });

    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching power-ups:', error);
    throw error;
  }
};

/**
 * Get current game ID
 */
export const getCurrentGameId = async () => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-current-game-id',
      functionArgs: [],
      network: stacksNetwork,
      senderAddress: CONTRACT_ADDRESS,
    });

    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching current game ID:', error);
    throw error;
  }
};

/**
 * Get platform revenue
 */
export const getPlatformRevenue = async () => {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-platform-revenue',
      functionArgs: [],
      network: stacksNetwork,
      senderAddress: CONTRACT_ADDRESS,
    });

    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching platform revenue:', error);
    throw error;
  }
};


