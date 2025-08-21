import { useState, useEffect } from 'react'

import Form from 'react-bootstrap/Form'

import { humanReadableDate } from './utils.js';
import BloodLevelIndicator from './BloodLevelIndicator.jsx'

const LOCAL_STORAGE_KEY_SELECTED_LOCATION = 'blood-supply-selectedLocation';
const DEFAULT_LOCATION = 'Opća Bolnica Varaždin';

function BlooodSupplies(props) {
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const preselectedLocation = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED_LOCATION);
    if (preselectedLocation) {
      setSelectedLocation(preselectedLocation);
    } else {
      setSelectedLocation(DEFAULT_LOCATION);
    }
  }, []);

  const updateSelectedLocation = (e) => {
    setSelectedLocation(e.target.value);
    localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED_LOCATION, e.target.value);
  }

  return (
    <>
      <h1 className='text-center'>Zalihe krvi u Hrvatskoj</h1>
      <div className="location-selector">
        <p><b>Ažurirano:</b> { humanReadableDate(props.updated || Date.parse(new Date().toLocaleDateString()) )}</p>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.notify-group">
            <Form.Select name="location" id="location-select" value={selectedLocation} onChange={(e) => updateSelectedLocation(e)}>
              { props.locations.map((location, index) => (
                <option key={index} value={location.name}>{location.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </div>

      <BloodLevelIndicator location={props.locations.find(location => location.name == selectedLocation)} />
    </>
  )
}

export default BlooodSupplies
