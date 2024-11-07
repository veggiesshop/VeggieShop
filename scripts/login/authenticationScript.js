// Import the functions you need from the SDKs you need
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Handle admin Login
document.getElementById("adminLoginBtn").addEventListener("click", async function (e) {
    e.preventDefault(); // Prevent form submission

    // Get input values
    const adminUsername = document.getElementById("adminUsername").value;
    const adminPassword = document.getElementById("adminPassword").value;

    if (adminUsername === "" || adminPassword === "") {
        showErrorMessage("Please fill in all fields.");
        return;
    }

    try {
        // Reference to the 'admin' collection
        const farmersRef = collection(db, "Admin");

        // Query to find the admin with the matching username and password
        const q = query(farmersRef, where("AdminUser", "==", adminUsername), where("AdminPass", "==", adminPassword));

        // Execute the query
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.log("Login successful for admin: ", adminUsername); // Debugging
            adminLoginSuccess(adminUsername);  // Perform login actions, redirect, etc.
        } else {
            console.log("No matching admin found"); // Debugging
            showErrorMessage("Invalid username or password. Please try again.");
        }
    } catch (error) {
        console.error("Error checking admin collection: ", error);
        alert("An error occurred during login.");
    }
});

/*Handle User Login*/
document.getElementById("userLoginBtn").addEventListener("click", async function (e) {
    e.preventDefault(); // Prevent form submission

    // Get input values
    const userUsername = document.getElementById("userUsername").value;
    const userPassword = document.getElementById("userPassword").value;

    if (userUsername === "" || userPassword === "") {
        showErrorMessage("Please fill in all fields.");
        return;
    }

    try {
        // Reference to the 'user' collection
        const userRef = collection(db, "User");

        // Query to find the user with the matching username and password
        const q = query(userRef, where("UserUname", "==", userUsername), where("UserPassword", "==", userPassword));

        // Execute the query
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();

            if(userDoc.AccountStatus === true) {

                console.log("Login successful for user: ", userUsername); // Debugging
                userLoginSuccess(userUsername);  // Perform login actions, redirect, etc.

            } else {

                showErrorMessage("Your Account is Inactive. Please Contact Support for Further Insructions");
            }


            } else {
            console.log("No matching user found"); // Debugging
            showErrorMessage("Invalid username or password. Please try again.");
        }
    } catch (error) {
        console.error("Error checking User collection: ", error);
        alert("An error occurred during login.");
    }
});


/*Farmer Login*/
document.getElementById("farmerLoginBtn").addEventListener("click", async function (e) {
    e.preventDefault(); // Prevent form submission

    // Get input values
    const farmerUsername = document.getElementById("farmerUsername").value;
    const farmerPassword = document.getElementById("farmerPassword").value;

    if (farmerUsername === "" || farmerPassword === "") {
        showErrorMessage("Please fill in all fields.");
        return;
    }

    try {
        // Reference to the 'farmer' collection
        const farmerRef = collection(db, "Farmer");

        // Query to find the farmer with the matching username and password
        const q = query(farmerRef, where("FarmerUsername", "==", farmerUsername), where("FarmerPassword", "==", farmerPassword));

        // Execute the query
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const farmerDoc = querySnapshot.docs[0].data();
            if (farmerDoc.AccountStatus === true) {
                console.log("Login successful for farmer: ", farmerUsername); // Debugging
                farmerLoginSuccess(farmerUsername);  // Perform login actions, redirect, etc.
            } else {
                showErrorMessage("Your account is inactive. Please contact support.");
            }
        } else {
            console.log("No matching farmer found"); // Debugging
            showErrorMessage("Invalid username or password. Please try again.");
        }
    } catch (error) {
        console.error("Error checking Farmer collection: ", error);
        alert("An error occurred during login.");
    }
});

// Assuming user login is successful
function userLoginSuccess(userUsername) {
    // Store user username in sessionStorage (or localStorage)
    sessionStorage.setItem('userUsername', userUsername);
    
    // Redirect to dashboard
    window.location.href = "./customer.html"; // Adjust the path to your dashboard page
}

// Assuming admin login is successful
function adminLoginSuccess(adminUsername) {
    // Store admin username in sessionStorage (or localStorage)
    sessionStorage.setItem('adminUsername', adminUsername);
    
    // Redirect to dashboard
    window.location.href = "./pages/admin/admin.html"; // Adjust the path to your dashboard page
}

// Farmer Login Successful
function farmerLoginSuccess(farmerUsername) {
    // Store farmer username in sessionStorage (or localStorage)
    sessionStorage.setItem('farmerUsername', farmerUsername);
    
    // Redirect to dashboard
    window.location.href = "./pages/farmer/farmer.html"; // Adjust the path to your dashboard page
}

/*Error Message Function*/
function showErrorMessage(message) {
    console.log("Error: " + message); // Debugging: log the error
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = message; // Set custom error message text
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('show');

    // Hide the error message after 5 seconds
    setTimeout(function() {
        errorMessage.classList.remove('show');
        errorMessage.classList.add('hidden');
    }, 5000);
}
