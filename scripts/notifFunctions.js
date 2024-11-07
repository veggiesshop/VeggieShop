import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, where, doc, getDoc, limit } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
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

// HTML element references
const notificationList = document.getElementById('notification-list');
let currentUserId = sessionStorage.getItem('currentUserId') || '';  // Use the session-stored user ID

// Array to hold notifications
let notifications = [];

// Function to render notifications in the UI
function renderNotifications() {
    // Clear the notification list
    notificationList.innerHTML = '';

    // Render up to the latest 5 notifications
    notifications.slice(-5).forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.classList.add('notification-item');
        notificationItem.textContent = notification;
        notificationList.appendChild(notificationItem);
    });
}

// Function to create a new notification and update the list
function createNotification(message, senderName = 'System') {
    // Construct the notification message
    const notificationMessage = `${senderName} sent a message: "${message}"`;

    // Add the notification to the array
    notifications.push(notificationMessage);

    // Limit notifications to the latest 5
    if (notifications.length > 5) {
        notifications.shift(); // Remove the oldest notification
    }

    // Update the UI
    renderNotifications();

    // Show a browser notification if supported
    if (Notification.permission === 'granted') {
        new Notification(`New message from ${senderName}`, {
            body: message,
        });
    }
}

// Request notification permission if not already granted
if (Notification.permission !== 'granted') {
    Notification.requestPermission();
}

// Fetch the user's name from the "User" or "Farmer" collection using the user ID
async function fetchUserName(userId) {
    try {
        // Try fetching from the 'User' collection first
        const userDoc = await getDoc(doc(db, 'User', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return `${userData.UserFName} ${userData.UserLName} (User)`;
        } else {
            // If not found in 'User', try the 'Farmer' collection
            const farmerDoc = await getDoc(doc(db, 'Farmer', userId));
            if (farmerDoc.exists()) {
                const farmerData = farmerDoc.data();
                return `${farmerData.FarmerFName} ${farmerData.FarmerLName} (Farmer)`;
            }
        }
    } catch (error) {
        console.error("Error fetching user or farmer data:", error);
    }
    return 'Unknown Participant';
}

// Listen to messages for the current user's conversations
function listenToUserConversations() {
    const conversationsRef = collection(db, 'chats');
    const conversationsQuery = query(conversationsRef, where('participants', 'array-contains', currentUserId));
    
    onSnapshot(conversationsQuery, (snapshot) => {
        snapshot.forEach(async (doc) => {
            const conversationId = doc.id;
            const conversationData = doc.data();
            const otherParticipantId = conversationData.participants.find(participant => participant !== currentUserId);

            if (otherParticipantId) {
                const otherParticipantName = await fetchUserName(otherParticipantId);
                listenToMessages(conversationId, otherParticipantName);
            }
        });
    });
}

// Listen for messages in a specific conversation and create notifications for new messages
function listenToMessages(conversationId, otherParticipantName) {
    const messagesRef = collection(db, 'chats', conversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1)); // Only the latest message

    onSnapshot(messagesQuery, (snapshot) => {
        snapshot.forEach((doc) => {
            const messageData = doc.data();

            // Only show notifications for messages sent by other users or farmers
            if (messageData.senderID !== currentUserId) {
                createNotification(messageData.text, otherParticipantName);
            }
        });
    });
}

// Listen for changes in the "Product" collection and notify all users
function listenToNewProducts() {
    const productsRef = collection(db, 'Crops');
    const productsQuery = query(productsRef, orderBy('timestamp', 'desc'), limit(1)); // Only the latest product

    onSnapshot(productsQuery, async (snapshot) => {
        snapshot.forEach(async (doc) => {
            const productData = doc.data();
            const productName = productData.productName;

            // Create a notification for the latest product
            createNotification(`New Product: ${productName} has been added to the Store!`, `VeggieShop System`);
        });
    });
}

// Start listening to messages for the current user's conversations
if (currentUserId) {
    listenToUserConversations();
} else {
    console.error('No user ID found. Unable to listen to messages.');
}

// Start listening to new product additions
listenToNewProducts();