// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

const farmerEarningsElement = document.getElementById('farmerEarnings');
const farmerUsername = sessionStorage.getItem('farmerUsername');

// Function to fetch Farmer ID using the username and display FarmerEarnings
async function getFarmerIdAndDisplayEarnings(username) {
    try {
        // Query the Farmer collection to find the document with the matching username
        const farmersCollection = collection(db, 'Farmer');
        const q = query(farmersCollection, where('FarmerUsername', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Assuming usernames are unique, get the first matching document
            const farmerDoc = querySnapshot.docs[0];
            const farmerId = farmerDoc.id;  // Extract the Farmer ID

            // Call the function to display FarmerEarnings using the Farmer ID
            displayFarmerEarnings(farmerId);
        } else {
            console.error('No farmer found with the provided username');
        }
    } catch (error) {
        console.error("Error fetching Farmer ID:", error);
    }
}

// Function to fetch and display FarmerEarnings using Farmer ID
async function displayFarmerEarnings(farmerId) {
    try {
        // Reference to the specific farmer document
        const farmerRef = doc(db, 'Farmer', farmerId);
        const farmerDoc = await getDoc(farmerRef);

        if (farmerDoc.exists()) {
            const farmerData = farmerDoc.data();
            const earnings = farmerData.FarmerEarnings || 0;
            
            // Display the earnings on the page
            farmerEarningsElement.textContent = earnings.toFixed(2); // Display with 2 decimal places
        } else {
            console.error('Farmer document not found');
        }
    } catch (error) {
        console.error("Error fetching FarmerEarnings:", error);
    }
}

// Call the function to get the Farmer ID and display earnings
getFarmerIdAndDisplayEarnings(farmerUsername);