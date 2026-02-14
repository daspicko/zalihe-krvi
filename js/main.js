import { fetchData, humanReadableDate, transformPercentageToImageHeight } from "./utils.js"
import { subscribe } from './subscribe.js'

import { LOCAL_STORAGE_KEY_SELECTED_LOCATION, DEFAULT_LOCATION, FIREBASE_CONFIG } from "./config.js";

let updated, locations, selectedLocation;

// Safe helper to create alert messages without XSS vulnerabilities
const createAlert = (type, message, isDismissible = true) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}${isDismissible ? ' alert-dismissible' : ''}`;
    alertDiv.setAttribute('role', 'alert');
    
    // Use textContent to safely set message (prevents XSS)
    const messageNode = document.createTextNode(message);
    alertDiv.appendChild(messageNode);
    
    if (isDismissible) {
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');
        alertDiv.appendChild(closeButton);
    }
    
    return alertDiv;
};

// Safe helper for alerts with formatted content (bold text, etc.)
const createFormattedAlert = (type, parts, isDismissible = true) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}${isDismissible ? ' alert-dismissible' : ''}`;
    alertDiv.setAttribute('role', 'alert');
    
    // Build content safely using DOM methods
    parts.forEach(part => {
        if (part.bold) {
            const b = document.createElement('b');
            b.textContent = part.text;
            alertDiv.appendChild(b);
        } else if (part.strong) {
            const strong = document.createElement('strong');
            strong.textContent = part.text;
            alertDiv.appendChild(strong);
        } else {
            alertDiv.appendChild(document.createTextNode(part.text));
        }
    });
    
    if (isDismissible) {
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');
        alertDiv.appendChild(closeButton);
    }
    
    return alertDiv;
};

const renderLocationInfo = (location) => {
    const isLocationReady = location.address.street || location.address.city || location.address.postalCode;
    
    document.querySelector('div.location-header h2').innerText = location.name || ' ';
    document.querySelector('div.location-header p').innerText = isLocationReady ? `${location.address.street}, ${location.address.postalCode} ${location.address.city}` : ' ';
    document.querySelector('div.location-header a').href = location.dataUrl || '#';


    const indicators = document.querySelectorAll('div.blood-groups > div');

    for (let i = 0; i < location.bloodGroups.length; i++) {
        const group = location.bloodGroups[i];
        const indicator = indicators[i];

        indicator.querySelector('.blood-bag-filler').style.maskImage = `linear-gradient(to top, black ${transformPercentageToImageHeight(group.amountPercentage)}%, transparent 0%)`;
        indicator.querySelector('.high-indicator').style.bottom = `${transformPercentageToImageHeight(group.highPercentage)}%`;
        indicator.querySelector('.low-indicator').style.bottom = `${transformPercentageToImageHeight(group.lowPercentage)}%`;
        indicator.querySelector('.blood-type').innerText = group.type;
    }
}

const updateSelectedLocation = (e) => {
    selectedLocation = e.target.value;
    localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED_LOCATION, selectedLocation);

    if (!locations || !Array.isArray(locations)) {
        console.error('Locations data not available');
        return;
    }
    
    const location = locations.find(location => location.id === selectedLocation);
    if (location) {
        renderLocationInfo(location);
    } else {
        console.error('Location not found:', selectedLocation);
    }
}

const subscribeToPushNotifications = async () => {
    const subscribeGroupElement = document.querySelector("#subscribeGroup");
    const subscribeLocationElement = document.querySelector("#subscribeLocation");
    const subscribeButtonElement = document.querySelector("#subscribeButton");
    const subscribeLoadingElement = document.querySelector("#subscribeLoading");

    const subscribeGroup = subscribeGroupElement.value;
    const subscribeLocation = subscribeLocationElement.value;

    if (!subscribeGroup || !subscribeLocation) {
        alert('Molimo odaberite lokaciju i krvnu grupu za koju se želite prijaviti.');
        return;
    }

    subscribeGroupElement.disabled = true;
    subscribeLocationElement.disabled = true;
    subscribeButtonElement.disabled = true;
    subscribeLoadingElement.style.display = 'inline-block';

    if (!locations || !Array.isArray(locations)) {
        console.error('Locations data not available for subscription');
        subscribeGroupElement.disabled = false;
        subscribeLocationElement.disabled = false;
        subscribeButtonElement.disabled = false;
        subscribeLoadingElement.style.display = 'none';
        
        const alert = createAlert('danger', 'Podatci o lokacijama nisu dostupni. Molimo osvježite stranicu.', true);
        document.querySelector('.alert-container').appendChild(alert);
        return;
    }

    const location = locations.find(location => location.id === subscribeLocation);
    
    if (!location) {
        console.error('Selected location not found:', subscribeLocation);
        subscribeGroupElement.disabled = false;
        subscribeLocationElement.disabled = false;
        subscribeButtonElement.disabled = false;
        subscribeLoadingElement.style.display = 'none';
        
        const alert = createAlert('danger', 'Odabrana lokacija nije pronađena. Molimo pokušajte ponovno.', true);
        document.querySelector('.alert-container').appendChild(alert);
        return;
    }
    
    const result = await subscribe(location, subscribeGroup);
    
    bootstrap.Modal.getInstance(document.querySelector('#subscribeModal')).hide();

    subscribeGroupElement.disabled = false;
    subscribeLocationElement.disabled = false;
    subscribeButtonElement.disabled = false;
    subscribeLoadingElement.style.display = 'none';
    
    if (result?.success) {
        // Safe: Use formatted alert with textContent for user data
        const alert = createFormattedAlert('success', [
            { text: 'Prijavili ste se za obavijest o darivanju krvne grupe ' },
            { text: subscribeGroup, bold: true },
            { text: ' kada se zaliha smanji u ' },
            { text: location.name, bold: true },
            { text: '.' }
        ], true);
        document.querySelector('.alert-container').appendChild(alert);
    } else {
        // Safe: Use textContent for API error message (untrusted)
        const errorMessage = result?.message || 'Došlo je do pogreške prilikom prijave na obavijesti. Pokušajte ponovno.';
        const alert = createAlert('danger', errorMessage, true);
        document.querySelector('.alert-container').appendChild(alert);
    }
}

document.addEventListener("DOMContentLoaded", async (event) => {
    selectedLocation = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_LOCATION) || DEFAULT_LOCATION;
    
    const data = await fetchData();
    
    // Guard against failed data loading
    if (!data || !data.locations || !Array.isArray(data.locations) || data.locations.length === 0) {
        console.error('Failed to load blood bank data');
        const alert = createFormattedAlert('danger', [
            { text: 'Greška! ', strong: true },
            { text: 'Nije moguće učitati podatke o zalihama krvi. Molimo osvježite stranicu ili pokušajte kasnije.' }
        ], false);
        document.querySelector('.alert-container').appendChild(alert);
        return; // Stop execution if data is invalid
    }
    
    updated = data.updated;
    locations = data.locations;

    document.querySelector('#update-time').innerHTML = `${humanReadableDate(updated || Date.parse(new Date().toLocaleDateString()) )}`;
    updateSelectedLocation({ target: { value: selectedLocation } }); // Preselect location

    const locationSelectElement = document.querySelector("#location-select");
    locationSelectElement.innerHTML = locations.map(location => `
        <option value="${location.id}" ${location.id === selectedLocation ? 'selected' : ''}>${location.name}</option>
    `).join('');
    locationSelectElement.addEventListener("change", updateSelectedLocation);

    document.querySelector('#subscribeGroup').innerHTML = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'].map((group) => `<option value="${group}">${group}</option>`).join('');
    document.querySelector('#subscribeLocation').innerHTML = locations.map(location => `
        <option value="${location.id}" ${location.id === selectedLocation ? 'selected' : ''}>${location.name}</option>
    `).join('');

    document.querySelector('#subscribeButton').addEventListener("click", subscribeToPushNotifications);
});

window.addEventListener("scroll", () => {
    const actionsContainer = document.querySelector(".actions-container");
    if (window.scrollY > window.innerHeight - actionsContainer.clientHeight) {
        // if user scrolled past 1 screen height → move to top
        actionsContainer.classList.add("top");
    } else {
        // otherwise → keep bottom
        actionsContainer.classList.remove("top");
    }
});

Promise.all([
    import('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js'), 
    import('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js')
]).then(() => {
    const app = firebase.initializeApp(FIREBASE_CONFIG);
    const messaging = firebase.messaging(app);

    const alertTitleElement = document.querySelector('#alertModalTitle');
    const alertTextElement = document.querySelector('#alertModalText');

    messaging.onMessage((payload) => {
        const { title, body } = payload.notification;
        // Safe: Use textContent to prevent XSS from push notification payload
        alertTitleElement.textContent = title || '';
        alertTextElement.textContent = body || '';
        bootstrap.Modal.getOrCreateInstance(document.querySelector('#alertModal')).show();
    });
})
