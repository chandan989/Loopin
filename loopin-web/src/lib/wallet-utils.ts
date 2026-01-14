import { AppConfig, UserSession } from '@stacks/connect';

export const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
    return /Android/i.test(navigator.userAgent);
};

export const showMobileWalletInstructions = () => {
    const message = isIOS()
        ? 'To connect your wallet on mobile:\n\n1. Install Leather Wallet from the App Store\n2. Create or import your wallet\n3. Return to this page and try connecting again\n\nWould you like to go to the App Store now?'
        : 'To connect your wallet on mobile:\n\n1. Install Leather Wallet from the Play Store\n2. Create or import your wallet\n3. Return to this page and try connecting again\n\nWould you like to go to the Play Store now?';

    if (confirm(message)) {
        if (isIOS()) {
            window.location.href = 'https://apps.apple.com/us/app/leather-bitcoin-defi-wallet/id6499127775';
        } else if (isAndroid()) {
            window.location.href = 'https://play.google.com/store/apps/details?id=io.leather.mobilewallet';
        }
    }
};

export const connectWalletMobile = (
    authenticate: any,
    userSession: UserSession,
    onFinish?: () => void
) => {
    try {
        console.log('[Mobile Wallet] Starting mobile connection with Stacks Connect...');

        // On mobile, use Stacks Connect but without redirectTo to avoid router issues
        authenticate({
            appDetails: {
                name: "Loopin",
                icon: window.location.origin + "/logo.svg",
            },
            // Don't use redirectTo on mobile - it causes router errors
            // The app will handle the return naturally
            onFinish: () => {
                console.log('[Mobile Wallet] Authentication finished!');
                // Store that we're authenticated
                localStorage.setItem('wallet_just_connected', 'true');
                if (onFinish) {
                    onFinish();
                } else {
                    // Reload to update the UI
                    window.location.href = '/';
                }
            },
            onCancel: () => {
                console.log('[Mobile Wallet] User cancelled');
            },
            userSession,
        });

        console.log('[Mobile Wallet] Authenticate called, waiting for redirect...');
    } catch (error) {
        console.error('[Mobile Wallet] Error:', error);
        showMobileWalletInstructions();
    }
};

export const connectWalletDesktop = (
    authenticate: any,
    userSession: UserSession,
    onFinish?: () => void
) => {
    authenticate({
        appDetails: {
            name: "Loopin",
            icon: window.location.origin + "/logo.svg",
        },
        onFinish: onFinish || (() => {
            window.location.reload();
        }),
        userSession,
    });
};

export const connectWallet = (
    authenticate: any,
    userSession: UserSession,
    onFinish?: () => void
) => {
    // Use the same authentication flow for both mobile and desktop
    // Stacks Connect will handle the platform-specific behavior:
    // - Desktop: Opens browser extension
    // - Mobile: Redirects to Leather app (if installed) or shows install prompt
    if (isMobileDevice()) {
        connectWalletMobile(authenticate, userSession, onFinish);
    } else {
        connectWalletDesktop(authenticate, userSession, onFinish);
    }
};
