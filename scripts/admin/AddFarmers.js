// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

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
const imageUploadInput = document.getElementById('imageUpload'); // Add this line

// Get references to input fields
const firstname = document.getElementById('firstName');
const lastname = document.getElementById('lastName');
const farmname = document.getElementById('farmName');
const username = document.getElementById('userName');
const password = document.getElementById('passWord');
const accountstatus = false;

// Function to upload an image to Cloud Storage and get the download URL
async function uploadImage(file) {
  try {
    const storageRef = ref(storage, `farmer-image/${file.name}`);
    const uploadTask = await uploadBytesResumable(storageRef, file);

    console.log('Uploaded file', uploadTask);

    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Handle form submission
const updateButton = document.querySelector('button[type="submit"]');
updateButton.addEventListener('click', async (event) => {  // Make this async
  event.preventDefault();

  // Get the image file
  const imageFile = imageUploadInput.files[0];

  // Initialize image URL
  let imageUrl = '';

  // Upload the image if a file is selected
  if (imageFile) {
    imageUrl = await uploadImage(imageFile);  // Await the image upload
    if (!imageUrl) {
      alert('Image upload failed. Please try again.');
      return;  // Stop the submission if image upload fails
    }
  }

  // Create a new farmer entry with data from the form
  const newFarmerData = {
    FarmerFName: firstname.value,
    FarmerLName: lastname.value,
    FarmName: farmname.value,
    FarmerUsername: username.value,
    FarmerPassword: password.value,
    AccountStatus: accountstatus,
    imageUrl: imageUrl || ''  // Ensure this holds the image URL
  };

  // Add the new farmer data to Firestore
  try {
    const farmersCollection = collection(db, 'Farmer');
    const docRef = await addDoc(farmersCollection, newFarmerData);  // Await Firestore response
    console.log("Document written with ID: ", docRef.id);
    alert('Farmer added successfully!');
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});
