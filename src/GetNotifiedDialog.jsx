import { useState } from "react"

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Alert from 'react-bootstrap/Alert'

import { initializeApp } from "firebase/app"
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyB2Tk7wEM_XgNY_tqXqtZClpgNr4rk_Fz8",
  authDomain: "zalihe-krvi.firebaseapp.com",
  projectId: "zalihe-krvi",
  storageBucket: "zalihe-krvi.firebasestorage.app",
  messagingSenderId: "1050380975409",
  appId: "1:1050380975409:web:59b2f2089821b94ff54410",
  measurementId: "G-Z3CCKNPS7N"
};

function GetNotifiedDialog(props) {
  const [showDialog, setShowDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [groupType, setGroupType] = useState('');
  const [locationName, setLocationName] = useState('');

  const handleCloseDialog = () => setShowDialog(false);
  const handleShowDialog = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        initializeApp(firebaseConfig);
        setShowDialog(true);
        if (!groupType) {
          setGroupType(props.locations[0].bloodGroups[0].type);
        }
        if (!locationName) {
          setLocationName(props.locations[0].name);
        }
      }
    });
  };

  const handleShowAlert = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleSubmit = async () => {
    handleCloseDialog();

    if ('serviceWorker' in navigator) {
      const serviceWorkerRegistration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}/firebase-messaging-sw.js`, {
        scope: `${import.meta.env.BASE_URL}/`
      });
      
      const messaging = getMessaging();

      getToken(messaging, {vapidKey: import.meta.env.VITE_FIREBASE_API_KEY, serviceWorkerRegistration})
      .then((currentToken) => {
        if (currentToken) {
          fetch(`${import.meta.env.VITE_BE_HOST}/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              registrationTokens: [currentToken],
              topic: () => `zalihe-krvi_${props.locations.find(l => l.name === locationName).topic}_${groupType}`
            })
          }).then(response => {
            if (response.ok) {
              handleShowAlert();
            }
          });
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      }).catch((err) => {
        console.log('Error getting token:', err);
      });
    }
  }

  return (
    <>
      <Button variant="primary" onClick={handleShowDialog} disabled={!props.locations.length}>
        Obavijesti me
      </Button>

      <Modal show={showDialog} onHide={handleCloseDialog}>
        <Modal.Header closeButton>
          <Modal.Title>Obavijesti me</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Prijavite se za obavijest kad Vaša grupa padne ispod određene razine.</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Krvna grupa</Form.Label>
              <Form.Select onChange={(e) => setGroupType(e.target.value)} value={groupType}>
                { ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'].map((group) => <option key={group} value={group}>{group}</option>) }
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Najbliži transfuzijski centar</Form.Label>
              <Form.Select onChange={(e) => setLocationName(e.target.value)} value={locationName}>
                { props.locations.map((location, index) => (
                  <option key={index} value={location.name}>{location.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDialog}>
            Zatvori
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Prijavi me za obavijesti
          </Button>
        </Modal.Footer>
      </Modal>

      <Alert variant="success" className="mt-3" show={showAlert}>
        Prijavili ste se za obavijest o darivanju krvne grupe <b>{groupType}</b> kada se zaliha smanji u <b>{locationName}</b>.
      </Alert>
    </>
  )
}

export default GetNotifiedDialog;
