// Import necessary Firestore methods and Firebase
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { cart } from '../../data/cart.js';
import { getDeliveryOption } from '../../data/deliveryOptions.js';
import { formatCurrency } from '../utils/money.js';

// Firebase configuration (same as in your main code file)
const firebaseConfig = {
  apiKey: "AIzaSyAZdQ2owWNs5GScoFTkJb-V6VPCz9KhMzw",
  authDomain: "veggies-shop-79734.firebaseapp.com",
  projectId: "veggies-shop-79734",
  storageBucket: "veggies-shop-79734.appspot.com",
  messagingSenderId: "447883509262",
  appId: "1:447883509262:web:bb38c3a58b41e8b736465f"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch product details from Firestore
async function fetchProductDetails(productId) {
  try {
    // Create a reference to the product document in Firestore
    const productRef = doc(db, 'Crops', productId);
    const productSnapshot = await getDoc(productRef);

    if (productSnapshot.exists()) {
      // Return product data from Firestore
      return productSnapshot.data();
    } else {
      console.error(`Product with ID ${productId} not found in Firestore.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching product details: ", error);
    return null;
  }
}

// Function to render the payment summary
export async function renderPaymentSummary() {
  let totalPrice = 0;

  for (const cartItem of cart) {
    // Fetch product details from Firestore dynamically using the document ID
    const product = await fetchProductDetails(cartItem.id);

    if (!product) {
      console.error(`Product with ID ${cartItem.id} not found.`);
      continue;  // Skip the item if no matching product is found
    }

    // Assuming `productPrice` is the field name in Firestore that represents the price
    const productTotal = product.productPrice * cartItem.quantity; // Calculate total for this product
    totalPrice += productTotal;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);

    if (!deliveryOption) {
      console.error(`Delivery option with ID ${cartItem.deliveryOptionId} not found.`);
      continue;  // Skip if no matching delivery option is found
    }

    // Add the delivery option price to the total (assuming `priceCents` field)
    totalPrice += deliveryOption.priceCents;
  }

  // Format the total price in currency and render it
  const formattedTotal = formatCurrency(totalPrice);
  document.querySelector('.js-payment-summary').textContent = `Total: ${formattedTotal}`;
}
