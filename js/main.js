import { fetchData, humanReadableDate, transformPercentageToImageHeight } from "./utils.js"
import { subscribe } from './subscribe.js'

import { LOCAL_STORAGE_KEY_SELECTED_LOCATION, DEFAULT_LOCATION, FIREBASE_CONFIG } from "./config.js";

let updated, locations, selectedLocation;

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

    renderLocationInfo(locations.find(location => location.id === selectedLocation));
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

    const location = locations.find(location => location.id === subscribeLocation);
    const result = await subscribe(location, subscribeGroup);
    
    bootstrap.Modal.getInstance(document.querySelector('#subscribeModal')).hide();

    subscribeGroupElement.disabled = false;
    subscribeLocationElement.disabled = false;
    subscribeButtonElement.disabled = false;
    subscribeLoadingElement.style.display = 'none';
    
    if (result?.success) {
        document.querySelector('.alert-container').innerHTML += `
            <div class="alert alert-success alert-dismissible" role="alert">
                Prijavili ste se za obavijest o darivanju krvne grupe <b>${subscribeGroup}</b> kada se zaliha smanji u <b>${location.name}</b>.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    } else {
        document.querySelector('.alert-container').innerHTML += `
            <div class="alert alert-danger alert-dismissible" role="alert">
                ${result?.message || 'Došlo je do pogreške prilikom prijave na obavijesti. Pokušajte ponovno.'}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", async (event) => {
    const selectedLocation = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_LOCATION) || DEFAULT_LOCATION;
    
    const data = await fetchData();
    updated = data?.updated;
    locations = data?.locations;

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
    import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js'), 
    import('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js')
]).then((modules) => {
    const { initializeApp } = modules[0];
    const { getMessaging, onMessage } = modules[1];
    
    const app = initializeApp(FIREBASE_CONFIG);
    const messaging = getMessaging(app);

    const alertTitleElement = document.querySelector('#alertModalTitle');
    const alertTextElement = document.querySelector('#alertModalText');

    onMessage(messaging, (payload) => {
        const { title, body } = payload.notification;
        alertTitleElement.innerText = title;
        alertTextElement.innerHTML = body;
        bootstrap.Modal.getOrCreateInstance(document.querySelector('#alertModal')).show();
    });
})
