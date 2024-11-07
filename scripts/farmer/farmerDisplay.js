// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZdQ2owWNs5GScoFTkJb-V6VPCz9KhMzw",
  authDomain: "veggies-shop-79734.firebaseapp.com",
  projectId: "veggies-shop-79734",
  storageBucket: "veggies-shop-79734.appspot.com",
  messagingSenderId: "447883509262",
  appId: "1:447883509262:web:bb38c3a58b41e8b736465f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // This line initializes Firebase

// Initialize Firestore
const db = getFirestore(app);

/*Display Farmer Name*/
// Fetch the farmer username from sessionStorage
const farmerUsername = sessionStorage.getItem('farmerUsername');

// Function to fetch admin details from Firebase and display the name
async function fetchFarmerName() {
    if (!farmerUsername) {
        console.error("No Farmer username found in session storage.");
        return;
    }

    try {
        // Reference the "farmer" collection and query by username
        const q = query(collection(db, "Farmer"), where("FarmerUsername", "==", farmerUsername));
        const querySnapshot = await getDocs(q);

        // If admin found, display the name
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const farmerData = doc.data();
                const farmerName = farmerData.FarmerFName; // Access the "FarmerFName" field
                document.getElementById('farmerName').innerText = `Welcome, ${farmerName}!`;
            });
        } else {
            console.error("Farmer not found in the Farmer collection.");
        }
    } catch (error) {
        console.error("Error fetching Farmer details:", error);
    }
}
// Function to navigate to the messages page and store farmerId in sessionStorage
async function goToMessages() {
    // Assuming you are storing the farmerUsername in sessionStorage
    const farmerUsername = sessionStorage.getItem('farmerUsername');

    // Query the Farmer collection to find the document where username matches
    const farmersCollection = collection(db, 'Farmer');
    const q = query(farmersCollection, where('FarmerUsername', '==', farmerUsername));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Assuming there's only one document with the matching username
        const farmerDoc = querySnapshot.docs[0];
        const farmerId = farmerDoc.id; // Document ID

        // Store farmerId in sessionStorage
        sessionStorage.setItem('currentUserId', farmerId);

        // Redirect to the messages page
        window.location.href = "./messagesFarmer.html";
    } else {
        console.error('Farmer document not found!');
    }
}

// Attach event listener to the button with ID 'chatBtn'
document.getElementById('chatBtn').addEventListener('click', () => {
    // Call the function to navigate
    goToMessages();
});

// Call the function to fetch and display admin name
fetchFarmerName();