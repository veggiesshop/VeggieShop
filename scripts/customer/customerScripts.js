/*customerScripts.js*/

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

// Fetch the user username from sessionStorage
const userUsername = sessionStorage.getItem('userUsername');

// Function to fetch user details from Firebase and display the name
async function fetchUserName() {
    if (!userUsername) {
        console.error("No User username found in session storage.");
        return;
    }

    try {
        // Reference the "User" collection and query by username
        const q = query(collection(db, "User"), where("UserUname", "==", userUsername));
        const querySnapshot = await getDocs(q);

        // If user found, display the name and store the document ID in local storage
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const userName = userData.UserFName; // Access the "UserFName" field
                const userId = doc.id; // Get the document ID of the user
                
                // Display the user name
                document.getElementById('userName').innerText = `Welcome, ${userName}!`;
                
                // Store the document ID in local storage
                sessionStorage.setItem('currentUserId', userId);
                console.log("User ID: ", userId);
            });
        } else {
            console.error("User not found in the User collection.");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
}

// Call the function to fetch and display user name
fetchUserName();