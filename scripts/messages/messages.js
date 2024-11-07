/*messages.js*/
// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

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

// DOM elements
const conversationList = document.getElementById('conversationList');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatHeader = document.getElementById('chatHeader');

let currentConversation = null;
let currentUserId = sessionStorage.getItem('currentUserId');

console.log("Current user ID set to: ", currentUserId);

export function openConversation(conversation) {
    if (conversation && conversation.id) {
        console.log(`Opening conversation ID: ${conversation.id}`);

        currentConversation = conversation; // Set the current conversation

        // Enable the chat input and send button
        chatInput.disabled = false;
        sendBtn.disabled = false;

        // Determine the name of the other participant
        const otherParticipantId = Object.keys(conversation.participantNames).find(id => id !== currentUserId);
        const otherParticipantName = conversation.participantNames[otherParticipantId];

        // Update the chat header to show the other participant's name
        chatHeader.textContent = `Conversation with ${otherParticipantName}`;

        // Load and listen to messages in this conversation
        listenToMessages(conversation.id);
    } else {
        console.error("Conversation object is invalid.");
    }
}

// Function to render messages in the chat window
function renderMessages(messages) {
    chatBody.innerHTML = '';
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', message.senderID === currentUserId ? 'user' : 'bot');
        messageDiv.textContent = message.text;
        chatBody.appendChild(messageDiv);
    });
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom
}

// Listen for real-time updates in a conversation
function listenToMessages(conversationId) {
    const messagesRef = query(collection(db, 'chats', conversationId, 'messages'), orderBy('timestamp'));
    
    onSnapshot(messagesRef, snapshot => {
        const messages = [];
        snapshot.forEach(doc => {
            messages.push(doc.data());
        });
        renderMessages(messages);
    });
}

// Function to send messages to Firestore
function sendMessage(conversationId, text, senderId) {
    const messagesRef = collection(db, 'chats', conversationId, 'messages');

    addDoc(messagesRef, {
        text: text,
        senderID: senderId, // Use the custom user ID instead of Firebase auth
        timestamp: new Date() // Using native JS Date for timestamp
    }).then(() => {
        chatInput.value = ''; // Clear input after sending
    });
}

// Enter key event to send message
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevents new line on Enter
        sendBtn.click();
    }
});

function renderConversationList(conversations) {
    conversationList.innerHTML = ''; // Clear the list first

    if (conversations.length > 0) {
        conversations.forEach(conversation => {
            const conversationItem = document.createElement('div');
            conversationItem.classList.add('conversation-item');
            conversationItem.textContent = conversation.name; // Use the conversation name

            // Add click event to open the conversation
            conversationItem.addEventListener('click', () => {
                console.log(`Opening conversation with ID: ${conversation.id}`);
                openConversation(conversation); // Call openConversation when clicked
            });

            conversationList.appendChild(conversationItem);
        });
    } else {
        conversationList.innerHTML = '<p>No conversations found.</p>';
    }
}

export function fetchUserConversations(userId) {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));

    getDocs(q).then(snapshot => {
        const conversations = [];
        snapshot.forEach(doc => {
            conversations.push({ ...doc.data(), id: doc.id });
        });
        renderConversationList(conversations); // Call the function here
    });
}

sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message && currentConversation) {
        sendMessage(currentConversation.id, message, currentUserId); // Use currentUserId and currentConversation.id
    }
});
