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

document.addEventListener("DOMContentLoaded", () => {
    // Get references to DOM elements
    const usersList = document.getElementById('usersList');
    const searchUserUName = document.getElementById('searchUserUName');
    let usersData = []; // Array to hold fetched users

    // Function to toggle account status for users
    const toggleAccountStatus = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, "User", userId);
            await updateDoc(userRef, {
                AccountStatus: !currentStatus
            });
        } catch (error) {
            console.error("Error updating account status: ", error);
        }
    };

    // Function to delete a user from Firestore
    const deleteUser = async (userId) => {
        try {
            const userRef = doc(db, "User", userId);
            await deleteDoc(userRef);
            console.log(`User with ID ${userId} has been deleted.`);
        } catch (error) {
            console.error("Error deleting user: ", error);
        }
    };

    // Function to render users
    const renderUsers = (users) => {
        usersList.innerHTML = '';  // Clear the list before rendering

        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.classList.add('user-item');

            // Determine the color based on account status
            const statusColor = user.AccountStatus ? 'green' : 'red';

            // Structure user's info and buttons in a flex row
            userItem.innerHTML = `
                <div class="user-info">
                    <p><strong>Name:</strong> ${user.UserFName} ${user.UserLName}</p>
                    <p><strong>Username:</strong> ${user.UserUname}</p>
                    <p><strong>Birthday:</strong> ${user.BirthDay}</p>
                    <p><strong>Address:</strong> ${user.UserAddress}</p>
                    <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${user.AccountStatus ? 'Enabled' : 'Disabled'}</span></p>
                </div>
                <button class="toggle-status-btn" data-id="${user.id}" data-status="${user.AccountStatus}">
                    ${user.AccountStatus ? 'Disable' : 'Enable'}
                </button>
                <button class="delete-btn" data-id="${user.id}">Delete</button>
            `;

            usersList.appendChild(userItem);
        });

        // Add event listeners to toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-status-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-id');
                const currentStatus = button.getAttribute('data-status') === 'true';
                toggleAccountStatus(userId, currentStatus);
            });
        });

        // Add event listeners to delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-id');
                const confirmDelete = confirm("Are you sure you want to delete this user?");
                if (confirmDelete) {
                    deleteUser(userId);
                }
            });
        });
    };

    // Function to fetch users from Firestore and store them in usersData array
    const fetchUsers = () => {
        const usersCollection = collection(db, "User");
        const q = query(usersCollection);

        onSnapshot(q, (snapshot) => {
            usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            renderUsers(usersData); // Initial rendering
        });
    };

    // Event listener for real-time search
    searchUserUName.addEventListener('input', () => {
        const searchValue = searchUserUName.value.toLowerCase();

        // Filter users based on the search input
        const filteredUsers = usersData.filter(user => 
            user.UserFName.toLowerCase().includes(searchValue) ||
            user.UserLName.toLowerCase().includes(searchValue) ||
            user.UserUname.toLowerCase().includes(searchValue)
        );

        renderUsers(filteredUsers); // Re-render the filtered users
    });

    // Initial fetch to display all users
    fetchUsers();
});