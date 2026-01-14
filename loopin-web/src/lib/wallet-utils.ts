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
    console.log('[Mobile Wallet] Opening Leather app directly...');

    // For mobile, we bypass Stacks Connect entirely and use a direct deep link
    // This opens the Leather mobile app if installed

    // Leather mobile app deep link format
    // The app will handle the authentication and redirect back
    const appName = encodeURIComponent("Loopin");
    const returnUrl = encodeURIComponent(window.location.origin + "/");

    // Try the Leather mobile app URL
    const leatherAppUrl = `https://wallet.leather.io/sign-in?origin=${returnUrl}&appName=${appName}`;

    console.log('[Mobile Wallet] Redirecting to:', leatherAppUrl);

    // Open Leather app
    window.location.href = leatherAppUrl;

    // Set a timeout to show instructions if app doesn't open
    setTimeout(() => {
        if (document.hasFocus()) {
            console.log('[Mobile Wallet] App did not open, showing instructions');
            showMobileWalletInstructions();
        }
    }, 2500);
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
