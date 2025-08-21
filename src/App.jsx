import { useState, useEffect } from 'react'

import BloodSupplies from './BloodSupplies.jsx'
import GetNotifiedDialog from './GetNotifiedDialog.jsx'

const DATA_URL = `${import.meta.env.BASE_URL || ''}/data.json`;

function App() {
  const [updated, setUpdated] = useState();
  const [locations, setLocations] = useState([]);

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
        })
        .catch(error => console.error('Error fetching data from server!'));
  }, []);

  return (
    <>
      <GetNotifiedDialog locations={locations} />
      <BloodSupplies locations={locations} updated={updated} />
    </>
  )
}

export default App
