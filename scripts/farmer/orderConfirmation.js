// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, query, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

// Get references to DOM elements
const orderLists = document.getElementById('orderLists');
const orderModal = document.getElementById('orderConfirmationModal');

// Function to confirm the order and set status to Pending
const confirmOrder = async (orderId) => {
    try {
        const orderRef = doc(db, "Orders", orderId);
        await updateDoc(orderRef, {
            status: "Pending",
            orderConfirmation: true
        });
        alert(`Order ${orderId} status updated to Pending.`);
        closeOrderModal();
    } catch (error) {
        console.error("Error confirming order: ", error);
    }
};

// Function to render orders
const renderOrders = (orders) => {
    orderLists.innerHTML = '';  // Clear the list before rendering

    if (orders.length === 0) {
        // Display a message if there are no pending orders
        const noOrdersMessage = document.createElement('p');
        noOrdersMessage.classList.add('no-orders-message');
        noOrdersMessage.textContent = "You Have No Pending Orders";
        orderLists.appendChild(noOrdersMessage);
        return;
    }

    orders.forEach(order => {
        // Only render orders that are not yet confirmed
        if (!order.orderConfirmation) {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');

            orderItem.innerHTML = `
               <div class="farmer-info">
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Order Date:</strong> ${order.orderDate}</p>
                <p><strong>Address:</strong> ${order.address}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            </div>
                <button class="confirm-order-btn" data-id="${order.id}">Confirm Order</button>
            `;

            orderLists.appendChild(orderItem);
        }
    });

    // Add event listeners to "Confirm Order" buttons
    const confirmButtons = document.querySelectorAll('.confirm-order-btn');
    confirmButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-id');
            confirmOrder(orderId);
        });
    });
};

// Function to fetch and display orders
const fetchOrders = () => {
    const ordersCollection = collection(db, "Orders");
    const q = query(ordersCollection);

    onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Filter out orders where orderConfirmation is true
        const unconfirmedOrders = orders.filter(order => !order.orderConfirmation);
        renderOrders(unconfirmedOrders);
    });
};

// Initial fetch to display all orders
fetchOrders();

// Close the modal if clicking outside of it
window.onclick = function(event) {
    if (event.target === orderModal) {
        closeOrderModal();
    }
};