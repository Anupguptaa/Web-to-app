// script.js

// 1. Service Worker ko Register karna
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js') // Path to your service worker file
            .then(registration => {
                console.log('CLIENT: Service Worker register ho gaya, scope:', registration.scope);
            })
            .catch(error => {
                console.error('CLIENT: Service Worker registration mein error:', error);
            });
    });
} else {
    console.log('CLIENT: Service Worker is browser mein support nahi karta.');
}

// 2. "Add to Home Screen" (Install) Button Logic
let deferredPrompt;
const installButton = document.getElementById('installButton');
const offlineInfoDiv = document.getElementById('offline-info');

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('CLIENT: beforeinstallprompt event fire hua');
    e.preventDefault();
    deferredPrompt = e;
    if (installButton) {
        installButton.style.display = 'block';
    }
});

if (installButton) {
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`CLIENT: User choice: ${outcome}`);
            if (outcome === 'accepted') {
                console.log('User ne app install karna स्वीकार kiya');
            } else {
                console.log('User ne app install karna अस्वीकार kiya');
            }
            deferredPrompt = null;
            installButton.style.display = 'none';
        }
    });
}

// 3. Offline Status Check
function updateOnlineStatus() {
    if (navigator.onLine) {
        if(offlineInfoDiv) offlineInfoDiv.style.display = 'none';
        console.log("CLIENT: Aap online hain.");
    } else {
        if(offlineInfoDiv) offlineInfoDiv.style.display = 'block';
        console.log("CLIENT: Aap offline hain.");
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
document.addEventListener('DOMContentLoaded', updateOnlineStatus); // Initial check

// Optional: Listen for PWA installation state changes
window.addEventListener('appinstalled', () => {
    console.log('CLIENT: PWA install ho gayi!');
    if (installButton) {
        installButton.style.display = 'none';
    }
    deferredPrompt = null; // Clear the prompt as it's no longer needed
});
