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

export const connectWalletMobile = () => {
    // Try to detect if Leather Wallet app is installed via deep link
    const appUrl = `leather://connect?appName=Loopin&appIcon=${encodeURIComponent(window.location.origin + "/logo.svg")}`;

    // Attempt to open the app
    const startTime = Date.now();
    window.location.href = appUrl;

    // If app doesn't open within 2 seconds, redirect to app store
    setTimeout(() => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 2500) {
            // App likely not installed, redirect to appropriate store
            if (isIOS()) {
                window.location.href = 'https://apps.apple.com/us/app/leather-bitcoin-defi-wallet/id6499127775';
            } else if (isAndroid()) {
                window.location.href = 'https://play.google.com/store/apps/details?id=io.leather.mobilewallet';
            } else {
                // Fallback: show alert
                alert('Please install Leather Wallet app from your device\'s app store to connect.');
            }
        }
    }, 2000);
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
    if (isMobileDevice()) {
        connectWalletMobile();
    } else {
        connectWalletDesktop(authenticate, userSession, onFinish);
    }
};
