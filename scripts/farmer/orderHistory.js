import { getFirestore, collection, getDocs, updateDoc, doc, getDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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

let orders = []; // Store all orders
let currentPage = 1;
const ordersPerPage = 10;

// Function to load orders from Firestore
async function loadOrders() {
    try {
      // Load "Received" orders from ArchiveOrders
      const archiveOrdersCollection = collection(db, 'ArchiveOrders');
      const archiveOrdersSnapshot = await getDocs(archiveOrdersCollection);
  
      orders = [];
      archiveOrdersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        orderData.id = doc.id;
        if (orderData.status === "received") { // Filter for "received" status
          orders.push(orderData);
        }
      });
  
      // Load "Pending" orders from Orders
      const ordersCollection = collection(db, 'Orders');
      const ordersSnapshot = await getDocs(ordersCollection);
      
      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        orderData.id = doc.id;
        if (orderData.status === "Pending") { // Filter for "Pending" status
          orders.push(orderData);
        }
      });
  
      // Sort orders by orderDate in descending order
      orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  
      renderPagination(); // Render pagination controls
      displayOrders(); // Display the first page of orders
    } catch (error) {
      console.error("Error loading orders: ", error);
    }
  }

// Function to display the orders in the HTML
function displayOrders() {
  const ordersContainer = document.getElementById('orders-container');
  ordersContainer.innerHTML = '';

  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const ordersToShow = orders.slice(startIndex, endIndex);

  ordersToShow.forEach(order => {
    let expectedDeliveryDate = 'N/A';
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      if (firstItem.expectedDeliveryDate) {
        expectedDeliveryDate = firstItem.expectedDeliveryDate.toDate
          ? firstItem.expectedDeliveryDate.toDate().toLocaleDateString()
          : firstItem.expectedDeliveryDate;
      }
    }

    const orderHTML = `
      <div class="order-container" id="order-${order.id}">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${new Date(order.orderDate).toLocaleDateString()}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div style="font-weight: bold; color: green;">₱${(order.totalPriceCents).toFixed(2)}</div>
            </div>
            <div class="order-delivery-date">
              <div class="order-header-label">Expected Delivery:</div>
              <div>${expectedDeliveryDate}</div> 
            </div>
          </div>
           <div class="order-address">
          <div class="order-header-label">Delivery Address:</div>
          <div>${order.address}</div>
        </div>
          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div style="font-weight: bold;">${order.orderId}</div>
          </div>
        </div>
        <div class="order-details-grid">
          ${order.items.map(item => `
            <div class="product-image-container">
              <img src="${item.imageUrl}" alt="${item.name}">
            </div>
            <div class="product-details">
              <div class="product-name">${item.name}</div>
              <div class="product-quantity">Quantity: ${item.quantity}</div>
              <div class="item-expected-delivery-date">Date Delivered: ${item.expectedDeliveryDate ? (item.expectedDeliveryDate.toDate ? item.expectedDeliveryDate.toDate().toLocaleDateString() : item.expectedDeliveryDate) : 'N/A'}</div>
            </div>
          `).join('')}
            <div class="order-status">
                <span style="color: Green; font-weight: bold;">${order.status}</span>
              </div>
        </div>
      </div>
    `;

    ordersContainer.insertAdjacentHTML('beforeend', orderHTML);
  });
}

// Function to render pagination controls
function renderPagination() {
  const paginationContainer = document.getElementById('pagination-container');
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('pagination-button');
    if (i === currentPage) pageButton.classList.add('active');

    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayOrders();
      renderPagination();
    });

    paginationContainer.appendChild(pageButton);
  }
}

// Function to handle the "Go to Tracking" button click
window.goToTracking = function(orderId) {
  window.location.href = `./tracking.html?orderId=${orderId}`;
};

// Function to handle the "Receive Order" button click
window.receiveOrder = async function(orderId) {
  try {
    const currentUserId = sessionStorage.getItem('currentUserId');
    if (!currentUserId) throw new Error("User ID not found in session storage.");

    const orderRef = doc(db, 'Orders', orderId);
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) throw new Error("Order not found.");

    const orderData = orderDoc.data();
    const archiveOrderRef = doc(collection(db, 'ArchiveOrders'));
    await setDoc(archiveOrderRef, { ...orderData, userId: currentUserId, archivedDate: new Date(), status: 'received' });

    await deleteDoc(orderRef);
    document.getElementById(`order-${orderId}`).remove();

    console.log("Order successfully moved to ArchiveOrders.");
    showErrorMessage("Order Has Been Received. Thank You!");
  } catch (error) {
    console.error("Error receiving order: ", error);
  }
};

function showErrorMessage(message) {
  console.log("Error: " + message);
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.innerText = message;
  errorMessage.classList.remove('hidden');
  errorMessage.classList.add('show');

  setTimeout(function() {
    errorMessage.classList.remove('show');
    errorMessage.classList.add('hidden');
  }, 5000);
}

// Load orders on page load
window.addEventListener('DOMContentLoaded', loadOrders);