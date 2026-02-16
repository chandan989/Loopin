import { openContractCall } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { Cl, PostConditionMode } from '@stacks/transactions';

const network = new StacksTestnet();
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractName = import.meta.env.VITE_CONTRACT_NAME || 'loopin-game';

export const createGame = (initialGameType: string, initialMaxPlayers: number) => {
    if (!contractAddress) {
        alert("Contract address not set in .env!");
        return;
    }

    const options = {
        contractAddress,
        contractName,
        functionName: 'create-game',
        functionArgs: [
            Cl.stringAscii(initialGameType),
            Cl.uint(initialMaxPlayers)
        ],
        network,
        postConditionMode: PostConditionMode.Allow, // Simplest for now
        onFinish: (data: any) => {
            console.log('Transaction broadcasted:', data);
            alert(`Game Creation Transaction Broadcasted! TxId: ${data.txId}`);
            // Ideally we reload window or poll
            setTimeout(() => window.location.reload(), 2000);
        },
    };

    openContractCall(options);
};

export const joinGame = (gameId: number, entryFee: number, onSuccess?: () => void) => {
    if (!contractAddress) {
        alert("Contract address not set in .env!");
        return;
    }

    const options = {
        contractAddress,
        contractName,
        functionName: 'join-game',
        functionArgs: [
            Cl.uint(gameId)
        ],
        network,
        postConditionMode: PostConditionMode.Allow, // Allow STX transfer
        onFinish: (data: any) => {
            console.log('Transaction broadcasted:', data);
            // alert(`Joined Game! TxId: ${data.txId}`);
            if (onSuccess) onSuccess();
        },
    };

    openContractCall(options);
};
