// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

// Fetch the admin username from sessionStorage
const adminUsername = sessionStorage.getItem('adminUsername');

// Function to fetch admin details from Firebase and display the name
async function fetchAdminName() {
    if (!adminUsername) {
        console.error("No admin username found in session storage.");
        return;
    }

    try {
        // Reference the "Admin" collection and query by username
        const q = query(collection(db, "Admin"), where("AdminUser", "==", adminUsername));
        const querySnapshot = await getDocs(q);

        // If admin found, display the name
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const adminData = doc.data();
                const adminName = adminData.AdminName; // Access the "AdminName" field
                document.getElementById('adminName').innerText = `Welcome, ${adminName}!`;
            });
        } else {
            console.error("Admin not found in the Admin collection.");
        }
    } catch (error) {
        console.error("Error fetching admin details:", error);
    }
}

// Call the function to fetch and display admin name
fetchAdminName();