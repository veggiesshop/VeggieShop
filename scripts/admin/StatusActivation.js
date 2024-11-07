// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Get references to DOM elements
const farmersList = document.getElementById('farmersList');
const searchUsername = document.getElementById('searchUsername');

//Enable/Disable Function
// Function to toggle account status
const toggleAccountStatus = async (farmerId, currentStatus) => {
    try {
        const farmerRef = doc(db, "Farmer", farmerId);
        await updateDoc(farmerRef, {
            AccountStatus: !currentStatus
        });
    } catch (error) {
        console.error("Error updating account status: ", error);
    }
};

// Function to delete farmer from Firestore
const deleteFarmer = async (farmerId) => {
    try {
        const farmerRef = doc(db, "Farmer", farmerId);
        await deleteDoc(farmerRef);
        console.log(`Farmer with ID ${farmerId} has been deleted.`);
    } catch (error) {
        console.error("Error deleting farmer: ", error);
    }
};

// Function to render farmers
const renderFarmers = (farmers) => {
    farmersList.innerHTML = '';  // Clear the list before rendering

    farmers.forEach(farmer => {
        const farmerItem = document.createElement('div');
        farmerItem.classList.add('farmer-item');

        // Determine the color based on account status
        const statusColor = farmer.AccountStatus ? 'green' : 'red';
         // Ensure FarmerEarnings has two decimal places
         const formattedEarnings = farmer.FarmerEarnings.toFixed(2);

        // Structure farmer's info and buttons in a flex row
        farmerItem.innerHTML = `
            <div class="farmer-info">
                <p><strong>Name:</strong> ${farmer.FarmerFName} ${farmer.FarmerLName}</p>
                <p><strong>Farm Name:</strong> ${farmer.FarmName}</p>
                <p><strong>Username:</strong> ${farmer.FarmerUsername}</p>
                <p><strong>Total Earnings:</strong> ₱${formattedEarnings}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${farmer.AccountStatus ? 'Enabled' : 'Disabled'}</span></p>
            </div>
            <button class="toggle-status-btn" data-id="${farmer.id}" data-status="${farmer.AccountStatus}">
                ${farmer.AccountStatus ? 'Disable' : 'Enable'}
            </button>
            <button class="delete-btn" data-id="${farmer.id}">
                Delete
            </button>
        `;

        farmersList.appendChild(farmerItem);
    });

    // Add event listeners to toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-status-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const farmerId = button.getAttribute('data-id');
            const currentStatus = button.getAttribute('data-status') === 'true';
            toggleAccountStatus(farmerId, currentStatus);
        });
    });

    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const farmerId = button.getAttribute('data-id');
            const confirmDelete = confirm("Are you sure you want to delete this farmer?");
            if (confirmDelete) {
                deleteFarmer(farmerId);
            }
        });
    });
};

// Function to fetch and display farmers
const fetchFarmers = () => {
    const farmersCollection = collection(db, "Farmer");
    const q = query(farmersCollection);

    onSnapshot(q, (snapshot) => {
        const farmers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderFarmers(farmers);
    });
};

// Real-time search function
searchUsername.addEventListener('input', () => {
    const searchValue = searchUsername.value.toLowerCase();

    const farmersCollection = collection(db, "Farmer");
    const q = query(farmersCollection);

    onSnapshot(q, (snapshot) => {
        const filteredFarmers = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(farmer => 
                farmer.FarmerFName.toLowerCase().includes(searchValue) ||
                farmer.FarmerLName.toLowerCase().includes(searchValue) ||
                farmer.FarmerUsername.toLowerCase().includes(searchValue) ||
                farmer.FarmName.toLowerCase().includes(searchValue)
            );

        renderFarmers(filteredFarmers);
    });
});

// Initial fetch to display all farmers
fetchFarmers();