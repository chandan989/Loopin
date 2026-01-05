import { useState, useEffect, useCallback } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  stxAddress: string | null;
  balance: number;
  isLoading: boolean;
}

// Mock wallet that actually works
export const useStacksWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    stxAddress: null,
    balance: 0,
    isLoading: false,
  });

  const connectWallet = useCallback(async () => {
    console.log('🔗 Connect wallet clicked!');
    
    // Simulate wallet connection with a delay
    setWalletState(prev => ({ ...prev, isLoading: true }));
    
    setTimeout(() => {
      setWalletState({
        isConnected: true,
        address: 'ST2TE8WMQW09ASVTXP4V2NA2C7MGCP0BQRZ9HEFC',
        stxAddress: 'ST2TE8WMQW09ASVTXP4V2NA2C7MGCP0BQRZ9HEFC',
        balance: 427.15, // Your real balance
        isLoading: false,
      });
      console.log('✅ Wallet connected successfully!');
    }, 1000);
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log('🔌 Disconnect button clicked!');
    setWalletState({
      isConnected: false,
      address: null,
      stxAddress: null,
      balance: 0,
      isLoading: false,
    });
    console.log('🔌 Wallet disconnected!');
  }, []);

  // Mock userSession for compatibility
  const userSession = {
    isUserSignedIn: () => walletState.isConnected,
    signUserOut: disconnectWallet,
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    userSession,
  };
};