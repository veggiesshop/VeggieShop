import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

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

// Function to get the orderId from URL query parameters
function getOrderIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('orderId');
}

// Function to load the specific order from Firestore based on the orderId
async function loadOrder(orderId) {
  try {
    const ordersCollection = collection(db, 'Orders');
    const orderSnapshot = await getDocs(ordersCollection);

    let selectedOrder = null;

    // Loop through the documents to find the matching orderId
    orderSnapshot.forEach((doc) => {
      if (doc.data().orderId === orderId) {
        selectedOrder = doc.data();
      }
    });

    if (selectedOrder) {
      displayOrderDetails(selectedOrder);
    } else {
      console.error("Order not found.");
    }
  } catch (error) {
    console.error("Error loading order: ", error);
  }
}

// Function to display the order details in the HTML
function displayOrderDetails(order) {
  const trackingContainer = document.getElementById('tracking-details-container');

  // Clear existing content
  trackingContainer.innerHTML = '';

  let expectedDeliveryDate = 'N/A';
  if (order.items && order.items.length > 0) {
    const firstItem = order.items[0];
    if (firstItem.expectedDeliveryDate) {
      expectedDeliveryDate = firstItem.expectedDeliveryDate.toDate
        ? firstItem.expectedDeliveryDate.toDate().toLocaleDateString()
        : firstItem.expectedDeliveryDate;
    }
  }

  // Generate the HTML content for the order
  const orderHTML = `
    <a class="back-to-orders-link link-primary" href="orders.html">View all orders</a>
    <div class="delivery-date">Expected Delivery: ${expectedDeliveryDate}</div>
    <div class="order-details-grid">
      ${order.items.map(item => `
        <div class="product-image-container">
          <img class="product-image" src="${item.imageUrl}" alt="${item.name}">
        </div>
        <div class="product-details">
          <div class="product-name">${item.name}</div>
          <div class="product-quantity">Quantity: ${item.quantity}</div>
          <div class="item-expected-delivery-date">Expected Delivery: ${item.expectedDeliveryDate ? (item.expectedDeliveryDate.toDate ? item.expectedDeliveryDate.toDate().toLocaleDateString() : item.expectedDeliveryDate) : 'N/A'}</div>
        </div>
      `).join('')}
    </div>
    <div class="progress-labels-container">
      <div class="progress-label">Preparing</div>
      <div class="progress-label current-status">Shipped</div>
      <div class="progress-label">Delivered</div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar"></div>
    </div>
  `;

  // Insert the HTML into the tracking container
  trackingContainer.insertAdjacentHTML('beforeend', orderHTML);
}

// On page load, retrieve the orderId and load the order details
document.addEventListener('DOMContentLoaded', () => {
  const orderId = getOrderIdFromUrl();
  if (orderId) {
    loadOrder(orderId);
  } else {
    console.error("No orderId found in URL.");
  }
});