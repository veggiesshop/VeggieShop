import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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
const modal = document.getElementById("productModal");
const closeModal = document.querySelector(".close");
const addProductForm = document.getElementById('addProductForm');
const imageUploadInput = document.getElementById('imageUpload');

// Function to upload an image to Cloud Storage and get the download URL
async function uploadImage(file) {
  try {
    const storageRef = ref(storage, `product-image/${file.name}`);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Handle form submission for adding products
addProductForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get input values
  const prodName = document.getElementById('prodName').value;
  let prodPrice = document.getElementById('prodPrice').value;
  let prodQty = document.getElementById('prodQty').value;
  const prodDesc = document.getElementById('prodDesc').value;
  const imageFile = imageUploadInput.files[0];  // Get the selected image file

  if (!imageFile) {
    alert('Please select an image for the product.');
    return;
  }

  // Parse product quantity as a float and fix to 2 decimal places
  prodQty = parseFloat(prodQty).toFixed(2);  // Ensure the value is a float with 2 decimal places

  // Upload the image to Firebase Storage and get the image URL
  const imageUrl = await uploadImage(imageFile);
  if (!imageUrl) {
    alert('Image upload failed. Please try again.');
    return;
  }

  // Create a new product entry with form data, image URL, and timestamp
  const newProductData = {
    productName: prodName,
    productPrice: parseFloat(prodPrice), // Store the product price as a float value
    productQuantity: parseInt(prodQty),
    productDescription: prodDesc,
    imageUrl: imageUrl,                   // URL of the uploaded image
    timestamp: serverTimestamp()          // Add a server timestamp field
  };

  // Add the new product data to Firestore
  try {
    const productsCollection = collection(db, 'Crops');
    await addDoc(productsCollection, newProductData);
    showErrorMessage('Product Added Successfully');
    addProductForm.reset(); // Reset the form
    modal.style.display = 'none';  // Close the modal
  } catch (error) {
    console.error("Error adding product: ", error);
    showErrorMessage('Error adding product. Please try again.');
  }
});

// Handle modal close
closeModal.onclick = function() {
    modal.style.display = "none";
}

// Optional: Close modal when clicking outside of the modal content
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Function to show error messages
function showErrorMessage(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = message; // Set custom error message text
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('show');

    // Hide the error message after 5 seconds
    setTimeout(function() {
        errorMessage.classList.remove('show');
        errorMessage.classList.add('hidden');
    }, 3000);
}