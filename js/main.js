import { fetchData, humanReadableDate, transformPercentageToImageHeight } from "./utils.js"
import LOCATION_PLACEHOLDER from "./location-placeholder.js"
import { subscribe } from './subscribe.js'

import { LOCAL_STORAGE_KEY_SELECTED_LOCATION, DEFAULT_LOCATION, FIREBASE_CONFIG } from "./config.js";

let updated, locations, selectedLocation;

const renderLocationInfo = (location) => {
    document.querySelector('div.location-header h3').innerText = location.name;
    document.querySelector('div.location-header p').innerText = `${location.address.street}, ${location.address.postalCode} ${location.address.city}`;
    document.querySelector('div.location-header a').href = location.dataUrl;

    document.querySelector('div.blood-groups').innerHTML = location.bloodGroups.map(group => `
        <div>
            <div class="blood-bag">   
            <div class="blood-bag-filler" style="mask-image: linear-gradient(to top, black ${transformPercentageToImageHeight(group.amountPercentage)}%, transparent 0%)"></div>
            <div class="high-indicator" style="bottom: ${transformPercentageToImageHeight(group.highPercentage)}%"></div>
            <div class="low-indicator" style="bottom: ${transformPercentageToImageHeight(group.lowPercentage)}%"></div>
            <p class="blood-type">${group.type}</p>
            </div>
        </div>
    `).join('');
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
    
    if (result.success) {
        document.querySelector('.alert-container').innerHTML += `
            <div class="alert alert-success" role="alert">
                Prijavili ste se za obavijest o darivanju krvne grupe <b>${subscribeGroup}</b> kada se zaliha smanji u <b>${location.name}</b>.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    } else {
        document.querySelector('.alert-container').innerHTML += `
            <div class="alert alert-danger" role="alert">
                Došlo je do pogreške prilikom prijave za obavijesti. Pokušajte ponovno kasnije.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", async (event) => {
    renderLocationInfo(LOCATION_PLACEHOLDER);
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
    if (window.scrollY > window.innerHeight - 100) {
        // if user scrolled past 1 screen height → move to top
        document.querySelector(".notificationButton").classList.add("top");
    } else {
        // otherwise → keep bottom
        document.querySelector(".notificationButton").classList.remove("top");
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
        alertTitleElement.innerText = title;
        alertTextElement.innerHTML = body;
        bootstrap.Modal.getOrCreateInstance(document.querySelector('#alertModal')).show();
    });
})
