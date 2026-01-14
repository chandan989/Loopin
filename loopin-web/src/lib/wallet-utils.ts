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
        console.log('[Mobile Wallet] Starting connection...');

        // For mobile, we create a deep link to Leather app
        const appName = "Loopin";
        const appIcon = encodeURIComponent(window.location.origin + "/logo.svg");
        const returnUrl = encodeURIComponent(window.location.origin + "/");

        // Try custom URL scheme first (works if app is installed)
        const customSchemeUrl = `leather://sign-in?appName=${appName}&appIcon=${appIcon}&returnTo=${returnUrl}`;

        // Fallback to HTTPS URL (universal link)
        const httpsUrl = `https://wallet.leather.io/sign-in?appName=${appName}&appIcon=${appIcon}&returnTo=${returnUrl}`;

        console.log('[Mobile Wallet] Trying custom scheme:', customSchemeUrl);

        // Store callback for when user returns
        if (onFinish) {
            sessionStorage.setItem('wallet_connect_callback', 'true');
        }

        // Try custom scheme first
        window.location.href = customSchemeUrl;

        // If app doesn't open, try HTTPS fallback and show instructions
        setTimeout(() => {
            if (document.hasFocus()) {
                console.log('[Mobile Wallet] Custom scheme failed, trying HTTPS...');
                // Try HTTPS URL
                window.location.href = httpsUrl;

                // If still here after another delay, show instructions
                setTimeout(() => {
                    if (document.hasFocus()) {
                        console.log('[Mobile Wallet] HTTPS also failed, showing instructions');
                        showMobileWalletInstructions();
                    }
                }, 2000);
            } else {
                console.log('[Mobile Wallet] App opened successfully!');
            }
        }, 1500);
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
