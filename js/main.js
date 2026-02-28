import { fetchData, humanReadableDate } from "./utils.js"
import { subscribe } from './subscribe.js'

import { LOCAL_STORAGE_KEY_SELECTED_LOCATION, DEFAULT_LOCATION, FIREBASE_CONFIG } from "./config.js";

let updated, locations, selectedLocation;

// ===== Custom Dropdown Helper =====

/**
 * Initialize a custom dropdown component.
 * @param {string} id - The element id of the .custom-dropdown container.
 * @param {Array<{value: string, label: string}>} options - The options to populate.
 * @param {string} [selectedValue] - Initially selected value.
 * @param {Function} [onChange] - Callback when selection changes, receives value.
 */
const initDropdown = (id, options, selectedValue, onChange) => {
    const container = document.querySelector(`#${id}`);
    if (!container) {
        console.warn(`Dropdown container with id "${id}" not found.`);
        return;
    }
    const toggle = container.querySelector('.dd-toggle');
    const valueSpan = container.querySelector('.dd-value');
    const menu = container.querySelector('.dd-menu');

    if (!toggle || !valueSpan || !menu) {
        console.warn(`Dropdown markup for id "${id}" is missing required child elements.`);
        return;
    }
    // Populate options via DOM (XSS-safe)
    menu.innerHTML = '';
    options.forEach(opt => {
        const li = document.createElement('li');
        li.className = 'dd-option' + (opt.value === selectedValue ? ' selected' : '');
        li.dataset.value = opt.value;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', opt.value === selectedValue ? 'true' : 'false');
        li.textContent = opt.label;
        menu.appendChild(li);
    });

    // Set display value
    const selectedOpt = options.find(o => o.value === selectedValue);
    if (selectedOpt) {
        valueSpan.textContent = selectedOpt.label;
    }

    // Store value on container
    container.dataset.selectedValue = selectedValue || '';

    // Toggle open/close
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (container.dataset.disabled === 'true') return;
        const isOpen = container.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
            container.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
        }
    });

    // Option click
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
        const option = e.target.closest('.dd-option');
        if (!option) return;
        const value = option.dataset.value;
        const label = option.textContent;

        // Update selection
        menu.querySelectorAll('.dd-option').forEach(li => {
            li.classList.remove('selected');
            li.setAttribute('aria-selected', 'false');
        });
        option.classList.add('selected');
        option.setAttribute('aria-selected', 'true');
        valueSpan.textContent = label;
        container.dataset.selectedValue = value;

        // Close
        container.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');

        if (onChange) onChange(value);
    });
};

/** Get the currently selected value of a custom dropdown */
const getDropdownValue = (id) => {
    return document.querySelector(`#${id}`)?.dataset.selectedValue || '';
};

/** Close all open custom dropdowns */
const closeAllDropdowns = () => {
    document.querySelectorAll('.custom-dropdown.open').forEach(dd => {
        dd.classList.remove('open');
        dd.querySelector('.dd-toggle')?.setAttribute('aria-expanded', 'false');
    });
};

// Close dropdowns when clicking outside
document.addEventListener('click', () => closeAllDropdowns());

// Close dropdowns on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
});

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
    
    document.querySelector('.location-header h2').innerText = location.name || ' ';
    document.querySelector('.location-header .location-address').innerText = isLocationReady ? `${location.address.street}, ${location.address.postalCode} ${location.address.city}` : ' ';
    document.querySelector('.location-header a').href = location.dataUrl || '#';

    const cards = document.querySelectorAll('.blood-grid > .blood-card');

    for (let i = 0; i < location.bloodGroups.length; i++) {
        const group = location.bloodGroups[i];
        const card = cards[i];

        const amount = Math.max(0, Math.min(100, group.amountPercentage || 0));
        const high = Math.max(0, Math.min(100, group.highPercentage || 0));
        const low = Math.max(0, Math.min(100, group.lowPercentage || 0));

        card.querySelector('.bar-fill').style.height = `${amount}%`;
        card.querySelector('.bar-high-marker').style.bottom = `${high}%`;
        card.querySelector('.bar-low-marker').style.bottom = `${low}%`;
        card.querySelector('.blood-type-label').innerText = group.type;
        card.querySelector('.blood-percentage').innerText = `${amount}%`;
    }
}

const updateSelectedLocation = (value) => {
    selectedLocation = value;
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
    const subscribeButtonElement = document.querySelector("#subscribeButton");
    const subscribeLoadingElement = document.querySelector("#subscribeLoading");

    const subscribeGroup = getDropdownValue('subscribeGroup');
    const subscribeLocation = getDropdownValue('subscribeLocation');

    if (!subscribeGroup || !subscribeLocation) {
        alert('Molimo odaberite lokaciju i krvnu grupu za koju se želite prijaviti.');
        return;
    }

    subscribeButtonElement.disabled = true;
    subscribeLoadingElement.style.display = 'inline-block';

    if (!locations || !Array.isArray(locations)) {
        console.error('Locations data not available for subscription');
        subscribeButtonElement.disabled = false;
        subscribeLoadingElement.style.display = 'none';
        
        const alert = createAlert('danger', 'Podatci o lokacijama nisu dostupni. Molimo osvježite stranicu.', true);
        document.querySelector('.alert-container').appendChild(alert);
        return;
    }

    const location = locations.find(location => location.id === subscribeLocation);
    
    if (!location) {
        console.error('Selected location not found:', subscribeLocation);
        subscribeButtonElement.disabled = false;
        subscribeLoadingElement.style.display = 'none';
        
        const alert = createAlert('danger', 'Odabrana lokacija nije pronađena. Molimo pokušajte ponovno.', true);
        document.querySelector('.alert-container').appendChild(alert);
        return;
    }
    
    const result = await subscribe(location, subscribeGroup);
    
    bootstrap.Modal.getInstance(document.querySelector('#subscribeModal')).hide();

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

    document.querySelector('#update-time').textContent = `${humanReadableDate(updated || Date.parse(new Date().toLocaleDateString()) )}`;
    updateSelectedLocation(selectedLocation); // Preselect location

    // Initialize header location dropdown
    const locationOptions = locations.map(loc => ({ value: loc.id, label: loc.name }));
    initDropdown('location-select', locationOptions, selectedLocation, updateSelectedLocation);

    // Initialize subscribe modal dropdowns
    const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'].map(g => ({ value: g, label: g }));
    initDropdown('subscribeGroup', bloodGroupOptions, 'A+');
    initDropdown('subscribeLocation', locationOptions, selectedLocation);

    document.querySelector('#subscribeButton').addEventListener("click", subscribeToPushNotifications);
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
