// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8kp6kExlCblFKlkxbZJXTu06Ew6Mnkvo",
  authDomain: "invitation-18808.firebaseapp.com",
  projectId: "invitation-18808",
  storageBucket: "invitation-18808.firebasestorage.app",
  messagingSenderId: "483893238370",
  appId: "1:483893238370:web:7c5cee74b7acbe34004f3b",
  measurementId: "G-LGMXH9XQRH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load and display all RSVPs from Firebase
async function loadRSVPs() {
  const rsvpList = document.getElementById('rsvpList');
  rsvpList.innerHTML = '';

  try {
    // Order by submission time (oldest first) so each group stays in the order submitted
    const q = query(collection(db, 'rsvps'), orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);

    const attendingEntries = [];   // "Yup!" responses
    const notAttendingEntries = []; // "Nope" responses

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.attending === 'no') {
        notAttendingEntries.push(data);
      } else {
        // "yes" (and any old entries without an attending value) go in the attending group
        attendingEntries.push(data);
      }
    });

    // Render attending responses first, then not-attending, each in submission order
    [...attendingEntries, ...notAttendingEntries].forEach((data) => {
      // data.name holds the combined "name — message" string
      const cls = data.attending === 'no' ? ' class="rsvp-no"' : '';
      rsvpList.innerHTML += `<div${cls}>${data.name}</div>`;
    });
  } catch (error) {
    console.error('Error loading RSVPs: ', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Load existing RSVPs when page loads
  loadRSVPs();

  // Handle RSVP form submission
  document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;
    const attending = document.getElementById('attending').value;

    // Combine name and message into one entry, separated by an em dash.
    // If no message was entered, just store the name (no trailing dash).
    const entry = message ? `${name} — ${message}` : name;

    try {
      // Save to Firebase
      await addDoc(collection(db, 'rsvps'), {
        name: entry,
        attending: attending,
        timestamp: new Date()
      });

      // Reload the list
      loadRSVPs();

      // Clear the form
      document.getElementById('name').value = '';
      document.getElementById('message').value = '';
      document.getElementById('attending').value = '';
    } catch (error) {
      console.error('Error adding RSVP: ', error);
      alert('Error submitting RSVP. Please try again.');
    }
  });
});