// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, getDoc, addDoc, doc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration (Already included above)
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

// Dummy current user ID for demonstration. Replace this with your logged-in user's ID.
let currentUserId = sessionStorage.getItem("currentUserId"); // Replace with actual logged-in user ID

// DOM Elements
const conversationListContainer = document.querySelector(".conversation-list");
const chatHeader = document.getElementById("chatHeader");
const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

let currentConversation = null;

// Function to get user details by ID from both User and Farmer collections
async function getUserNameById(userId) {
    // Try fetching from the 'User' collection first
    let userDocRef = doc(db, 'User', userId);
    let userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
            name: `${userData.UserFName} ${userData.UserLName}`,
            type: 'User'
        };
    } else {
        // If not found in 'User', try the 'Farmer' collection
        userDocRef = doc(db, 'Farmer', userId);
        userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const farmerData = userDoc.data();
            return {
                name: `${farmerData.FarmerFName} ${farmerData.FarmerLName}`,
                type: 'Farmer'
            };
        } else {
            console.log(`No user or farmer found with ID: ${userId}`);
            return null;
        }
    }
}

// Function to render conversation list and handle click events
async function renderConversations() {
    conversationListContainer.innerHTML = '';

    const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUserId),
        orderBy("timestamp", "desc")
    );

    onSnapshot(chatsQuery, async (snapshot) => {
        conversationListContainer.innerHTML = '';

        const chatDocs = snapshot.docs;

        for (const doc of chatDocs) {
            const chatData = doc.data();
            const chatId = doc.id;

            // Get the name of the other participant
            const otherParticipantId = chatData.participants.find(id => id !== currentUserId);
            const otherParticipantInfo = await getUserNameById(otherParticipantId);

            const chatTimestamp = chatData.timestamp.toDate().toLocaleString();

            const chatElement = document.createElement("div");
            chatElement.classList.add("conversation");
            chatElement.dataset.chatId = chatId;

            // Use the name and type returned by getUserNameById
            chatElement.innerHTML = `
                <h4>Conversation with ${otherParticipantInfo.name} (${otherParticipantInfo.type})</h4>
                <p>Last updated: ${chatTimestamp}</p>
            `;

            chatElement.addEventListener("click", () => {
                openConversation(chatId, `Conversation with ${otherParticipantInfo.name}`);
            });

            conversationListContainer.appendChild(chatElement);
        }
    });
}

// Function to add a new conversation to the DOM dynamically
export function addConversationToDOM(conversationId, chatName, timestamp, participantNames) {
    const conversationListContainer = document.querySelector(".conversation-list");

    const chatElement = document.createElement("div");
    chatElement.classList.add("conversation");
    chatElement.dataset.chatId = conversationId;

    chatElement.innerHTML = `
        <h4>${chatName}</h4>
        <p>Last updated: ${timestamp.toLocaleString()}</p>
    `;

    // Add event listener to open the newly created conversation
    chatElement.addEventListener("click", () => {
        openConversation(conversationId, chatName);
    });

    // Prepend the new conversation to the top of the conversation list
    conversationListContainer.prepend(chatElement);
}

// Function to open a conversation and load its message history (as in the original convList.js)
function openConversation(conversationId, chatName) {
    const chatHeader = document.getElementById("chatHeader");
    const chatBody = document.getElementById("chatBody");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");

    chatHeader.textContent = chatName;
    chatBody.innerHTML = '';
    currentConversation = { id: conversationId, name: chatName };

    chatInput.disabled = false;
    sendBtn.disabled = false;

    listenToMessages(conversationId); // Function that listens to messages in the conversation
}

// Function to listen for real-time updates to messages in a conversation
function listenToMessages(conversationId) {
    const messagesRef = query(collection(db, 'chats', conversationId, 'messages'), orderBy('timestamp', 'asc'));

    onSnapshot(messagesRef, (snapshot) => {
        const messages = snapshot.docs.map(doc => doc.data());
        renderMessages(messages);
    });
}

// Function to render messages in the chat body
function renderMessages(messages) {
    chatBody.innerHTML = ''; // Clear chat body before rendering new messages

    // Create a container for the messages
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    messageContainer.style.maxHeight = '900px'; // Set the height as needed
    messageContainer.style.overflowY = 'auto'; // Enable vertical scrolling

    messages.forEach((message) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');

        // Create the message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', message.senderID === currentUserId ? 'user' : 'bot');
        messageElement.innerHTML = message.text;

        messageWrapper.appendChild(messageElement);
        messageContainer.appendChild(messageWrapper);
    });

    chatBody.appendChild(messageContainer);

    // Scroll to the bottom to show the latest message
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Function to send a message to the current conversation
function sendMessage(conversationId, text, senderId) {
    const messagesRef = collection(db, 'chats', conversationId, 'messages');

    addDoc(messagesRef, {
        text: text,
        senderID: senderId,
        timestamp: new Date() // Use native Date object
    }).then(() => {
        chatInput.value = ''; // Clear input field after sending the message
    }).catch((error) => {
        console.error("Error sending message: ", error);
    });
}

// Event listener for the Send button
sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message && currentConversation) {
        sendMessage(currentConversation.id, message, currentUserId);
    }
});


// Initial call to render conversations
renderConversations();