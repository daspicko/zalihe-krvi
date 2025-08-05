import { useState, useEffect } from 'react'

import './BloodSupplies.css'

import { humanReadableDate } from './utils.js';
import BloodLevelIndicator from './BloodLevelIndicator.jsx'

const LOCAL_STORAGE_KEY_SELECTED_LOCATION = 'blood-supply-selectedLocation';
const DATA_URL = `${import.meta.env.VITE_BASE || ''}/data.json`;
const DEFAULT_LOCATION = 'Opća Bolnica Varaždin';

function BlooodSupplies() {
  const [updated, setUpdated] = useState();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetch(DATA_URL)
        .then(response => {
          try {
            return response.json();
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        })
        .then(data => {
          setUpdated(data.updated);
          setLocations(data.locations);
          const preselectedLocation = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_LOCATION);
          if (preselectedLocation) {
            setSelectedLocation(preselectedLocation);
          } else {
            setSelectedLocation(data.locations.find(location => location.name === DEFAULT_LOCATION)?.name || '');
          }
        })
        .catch(error => console.error('Error fetching data from server!'));
  }, []);

  const updateSelectedLocation = (e) => {
    setSelectedLocation(e.target.value);
    localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED_LOCATION, e.target.value);
  }

  return (
    <>
      <h1>Zalihe krvi u Hrvatskoj</h1>
      <div className="location-selector">
        <p><b>Ažurirano:</b> { humanReadableDate(updated || Date.parse(new Date().toLocaleDateString()) )}</p>
        <label htmlFor="location-select">Lokacija: </label>

        <select name="location" id="location-select" value={selectedLocation} onChange={(e) => updateSelectedLocation(e)}>
          { locations.map((location, index) => (
            <option key={index} value={location.name}>{location.name}</option>
          ))}
        </select>
      </div>

      <BloodLevelIndicator updated={updated} location={locations.find(location => location.name == selectedLocation)} />
    </>
  )
}

export default BlooodSupplies
