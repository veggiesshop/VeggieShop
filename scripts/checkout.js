// Import necessary Firestore methods and Firebase
import { getFirestore, doc, setDoc, collection, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { renderOrderSummary } from './checkout/orderSummary.js';
import { renderPaymentSummary } from './checkout/paymentSummary.js';
import { loadProducts, loadCart, clearCart, savePurchasedItems, cart } from '../data/cart.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import { getDeliveryOption } from '../data/deliveryOptions.js';

// Firebase configuration (same as in your main code file)
const firebaseConfig = {
  apiKey: "AIzaSyAZdQ2owWNs5GScoFTkJb-V6VPCz9KhMzw",
  authDomain: "veggies-shop-79734.firebaseapp.com",
  projectId: "veggies-shop-79734",
  storageBucket: "veggies-shop-79734.appspot.com",
  messagingSenderId: "447883509262",
  appId: "1:447883509262:web:bb38c3a58b41e8b736465f"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


async function loadPage() {
  try {
    await loadProducts();  // Load products from Firestore
    loadCart();            // Load cart from Firestore/localStorage

    renderOrderSummary();  // Render the order summary using the loaded cart
    renderPaymentSummary(); // Render the payment summary using the cart
  } catch (error) {
    console.error('Unexpected error. Please try again later.', error);
  }
}

loadPage();

// Handle the "Proceed to Checkout" button click
document.getElementById('submit-order').addEventListener('click', async (event) => {
  event.preventDefault();  // Prevent default form submission

  try {
    // Save purchased items
    savePurchasedItems();

    // Store the order in Firestore
    await saveOrderToFirestore();

    // Deduct quantities from Firestore
    await deductProductQuantitiesFromFirestore();

    // Clear the cart after saving purchased items and deducting quantities
    clearCart();

    // Update UI to reflect empty cart state
    renderOrderSummary();
    renderPaymentSummary();

    // Redirect to the tracking page
    window.location.href = './orders.html';
  } catch (error) {
    console.error("Error during order submission: ", error);
  }
});


async function saveOrderToFirestore() {
  const orderId = `order_${Date.now()}`;
  
  // Collect each part of the address from individual input fields
  const houseNumber = document.getElementById('house-number').value;
  const street = document.getElementById('street').value;
  const purok = document.getElementById('purok').value;
  const barangay = document.getElementById('barangay').value;
  const city = document.getElementById('city').value;
  const province = document.getElementById('province').value;

  
  // Check if all address fields are filled
  if (!houseNumber || !street || !purok || !barangay || !city || !province) {
    showErrorMessage("Please fill in all address fields to proceed.");
    throw new Error("All address fields are required.");
  }

  // Combine address fields into a single string
  const fullAddress = `${houseNumber}, ${street}, Purok ${purok}, Barangay ${barangay}, ${city}, ${province}`;


  // Construct the order object with a structured address
  const order = {
    orderId: orderId,
    items: cart.map(item => ({
      productId: item.id || 'Unknown Product ID',
      name: item.name || 'Unnamed Product',
      quantity: item.quantity || 1,
      price: item.price || 0,
      deliveryOptionId: item.deliveryOptionId || 'Unknown Delivery Option',
      expectedDeliveryDate: calculateExpectedDeliveryDate(item.deliveryOptionId),
      imageUrl: item.imageUrl || 'default-image-url.jpg'
    })),
    totalPriceCents: calculateTotalPriceCents(),
    orderDate: new Date().toISOString(),
    status: 'Awaiting Confirmation',
    orderConfirmation: false,
    address: fullAddress,
  };

  const orderRef = doc(collection(db, 'Orders'), orderId);

  try {
    await setDoc(orderRef, order);
    console.log("Order successfully saved to Firestore with ID:", orderId);
    await updateFarmerEarnings(order.totalPriceCents);
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    throw error;
  }
}

// Function to update Farmer's earnings
async function updateFarmerEarnings(totalPriceCents) {
  // Assuming each product is associated with a farmerId. You can customize this logic based on how you store farmer-product relationships.
  const farmerId = 'NSQH4oKlJTxHczOoiJ0X';  // You need to associate the product with a farmer to get the correct farmer ID

  // Reference the specific farmer document
  const farmerRef = doc(db, 'Farmer', farmerId);

  try {
    // Get the current farmer data
    const farmerDoc = await getDoc(farmerRef);

    if (farmerDoc.exists()) {
      const currentFarmerData = farmerDoc.data();
      const currentEarnings = currentFarmerData.FarmerEarnings || 0; // If FarmerEarnings doesn't exist, initialize to 0

      // Add the order's total price to the farmer's current earnings
      const updatedEarnings = currentEarnings + totalPriceCents;

      // Update the FarmerEarnings field in Firestore
      await updateDoc(farmerRef, {
        FarmerEarnings: updatedEarnings
      });

      console.log(`Farmer earnings updated to: ${updatedEarnings}`);
    } else {
      console.error(`Farmer with ID ${farmerId} not found.`);
    }
  } catch (error) {
    console.error("Error updating farmer's earnings:", error);
    throw error;
  }
}

// Function to deduct product quantities from Firestore after order is placed
async function deductProductQuantitiesFromFirestore() {
  try {
    for (const cartItem of cart) {
      // Reference to the specific product document
      const productRef = doc(db, 'Crops', cartItem.id);

      // Get the current product data from Firestore
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const currentProductData = productDoc.data();

        // Calculate the updated product quantity
        const updatedQuantity = currentProductData.productQuantity - cartItem.quantity;

        if (updatedQuantity < 0) {
          console.error(`Not enough stock for product ID ${cartItem.id}`);
          showErrorMessage(`Sorry, we don't have enough stock for ${cartItem.name}. Please adjust your order.`);
          throw new Error("Insufficient stock");
        }

        // Update the product quantity in Firestore
        await updateDoc(productRef, {
          productQuantity: updatedQuantity
        });

        console.log(`Product quantity for ID ${cartItem.id} updated to: ${updatedQuantity}`);
      } else {
        console.error(`Product with ID ${cartItem.id} not found in Firestore.`);
        throw new Error(`Product with ID ${cartItem.id} not found`);
      }
    }
  } catch (error) {
    console.error("Error deducting product quantities from Firestore:", error);
    throw error; // Re-throw the error to handle it in the main flow
  }
}

// Function to calculate the expected delivery date
function calculateExpectedDeliveryDate(deliveryOptionId) {
  const deliveryOption = getDeliveryOption(deliveryOptionId);

  if (!deliveryOption) {
    console.error(`Delivery option with ID ${deliveryOptionId} not found.`);
    return null;  // Ensure this doesn't return undefined or invalid values
  }

  // Calculate the delivery date by adding the number of delivery days to the current date
  const deliveryDate = dayjs().add(deliveryOption.deliveryDays, 'days').format('YYYY-MM-DD');

  return deliveryDate;
}

function calculateTotalPriceCents() {
  let totalPrice = 0;  // Use totalPrice in full currency units, not cents

  cart.forEach(item => {
    totalPrice += item.price * item.quantity;  // Directly add the price * quantity

    const deliveryOption = getDeliveryOption(item.deliveryOptionId);
    if (deliveryOption) {
      totalPrice += deliveryOption.priceCents;  // Convert deliveryOption priceCents to full currency
    }
  });

  return totalPrice;
}

/*Error Message Function*/
function showErrorMessage(message) {
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