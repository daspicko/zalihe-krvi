import { initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js"
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js"

import { FIREBASE_API_KEY, BE_HOST, BE_X_API_KEY, FIREBASE_CONFIG } from "./config.js";

let app;

const subscribe = async (location, bloodType) => {
    if (!app) {
        app = initializeApp(FIREBASE_CONFIG);
    }
    const messaging = getMessaging(app);

    if ('serviceWorker' in navigator) {
        const serviceWorkerRegistration = await navigator.serviceWorker.register(`${window.location.pathname}firebase-messaging-sw.js`, {
            scope: `${window.location.pathname}`
        });

        const token = await getToken(messaging, {vapidKey: FIREBASE_API_KEY, serviceWorkerRegistration});
        if (token) {
            const response = await fetch(`${BE_HOST}/subscribe`, {
                method: 'POST',
                headers: {
                    'x-api-key': BE_X_API_KEY,
                },
                body: JSON.stringify({
                    registrationTokens: [token],
                    locationId: location.id,
                    bloodType
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data
                }
            } else {
                console.error(`Error subscribing to receive messages for ${location.name}, blood type ${bloodType}!`, response.status);
                return {
                    success: false,
                    message: `Došlo je do pogreške prilikom prijave na obavijesti za lokaciju ${location.name} i krvnu grupu ${bloodType}. Pokušajte ponovno.`
                }
            }
        } else {
            console.log('No registration token available. Request permission to generate one.');
            return {
                success: false,
                message: `Došlo je do pogreške prilikom registracije servisa. Molimo osvježite stranicu.`
            }
        }
    } else {
        return {
            success: false,
            message: 'Nažalost, vaš uređaj ne podržava ovu funkcionalnost. Pokušajte s drugim uređajem ili preglednikom.'
        }
    }
}

export {
    subscribe
}