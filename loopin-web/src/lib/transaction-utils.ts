/**
 * Stacks transaction utilities
 * Handles STX transfers and contract calls
 */

import {
    makeSTXTokenTransfer,
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    stringUtf8CV,
    uintCV,
    principalCV,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { getCurrentNetwork } from './network-utils';
import { userSession } from './stacks-auth';

/**
 * Get the correct Stacks network
 */
function getNetwork() {
    const network = getCurrentNetwork();
    return network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
}

/**
 * Pay entry fee to join a game
 */
export async function payEntryFee(
    gameId: string,
    entryFeeSTX: number,
    contractAddress: string,
    contractName: string
): Promise<{ success: boolean; txId?: string; error?: string }> {
    try {
        if (!userSession.isUserSignedIn()) {
            return { success: false, error: 'Wallet not connected' };
        }

        const userData = userSession.loadUserData();
        const network = getNetwork();
        const networkType = getCurrentNetwork();
        const senderAddress = networkType === 'mainnet'
            ? userData.profile.stxAddress.mainnet
            : userData.profile.stxAddress.testnet;

        console.log('[Transaction] Paying entry fee:', entryFeeSTX, 'STX');
        console.log('[Transaction] Game ID:', gameId);
        console.log('[Transaction] Contract:', `${contractAddress}.${contractName}`);

        // Convert STX to micro-STX (1 STX = 1,000,000 micro-STX)
        const amountMicroSTX = Math.floor(entryFeeSTX * 1000000);

        // Call the join-game contract function
        const txOptions = {
            contractAddress,
            contractName,
            functionName: 'join-game',
            functionArgs: [
                uintCV(parseInt(gameId)), // game-id
            ],
            senderKey: userData.appPrivateKey,
            validateWithAbi: false,
            network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            fee: 200000, // 0.2 STX fee
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        // Check if response is an error
        if ('error' in broadcastResponse) {
            console.error('[Transaction] Broadcast error:', broadcastResponse.error);
            return {
                success: false,
                error: broadcastResponse.error as string
            };
        }

        console.log('[Transaction] ✅ Success! TX ID:', broadcastResponse.txid);
        return {
            success: true,
            txId: broadcastResponse.txid
        };

    } catch (error: any) {
        console.error('[Transaction] Error:', error);
        return {
            success: false,
            error: error.message || 'Transaction failed'
        };
    }
}

/**
 * Send STX to an address (simple transfer)
 */
export async function sendSTX(
    recipientAddress: string,
    amountSTX: number,
    memo?: string
): Promise<{ success: boolean; txId?: string; error?: string }> {
    try {
        if (!userSession.isUserSignedIn()) {
            return { success: false, error: 'Wallet not connected' };
        }

        const userData = userSession.loadUserData();
        const network = getNetwork();
        const networkType = getCurrentNetwork();
        const senderAddress = networkType === 'mainnet'
            ? userData.profile.stxAddress.mainnet
            : userData.profile.stxAddress.testnet;

        const amountMicroSTX = Math.floor(amountSTX * 1000000);

        const txOptions = {
            recipient: recipientAddress,
            amount: amountMicroSTX,
            senderKey: userData.appPrivateKey,
            network,
            memo: memo || '',
            anchorMode: AnchorMode.Any,
        };

        const transaction = await makeSTXTokenTransfer(txOptions);
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        // Check if response is an error
        if ('error' in broadcastResponse) {
            return { success: false, error: broadcastResponse.error as string };
        }

        return { success: true, txId: broadcastResponse.txid };

    } catch (error: any) {
        console.error('[Transaction] Error:', error);
        return { success: false, error: error.message || 'Transaction failed' };
    }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(txId: string): Promise<{
    status: 'pending' | 'success' | 'failed';
    details?: any;
}> {
    try {
        const network = getCurrentNetwork();
        const apiUrl = network === 'mainnet'
            ? 'https://api.mainnet.hiro.so'
            : 'https://api.testnet.hiro.so';

        const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
        const data = await response.json();

        if (data.tx_status === 'success') {
            return { status: 'success', details: data };
        } else if (data.tx_status === 'pending') {
            return { status: 'pending', details: data };
        } else {
            return { status: 'failed', details: data };
        }
    } catch (error) {
        console.error('[Transaction] Error checking status:', error);
        return { status: 'pending' };
    }
}
