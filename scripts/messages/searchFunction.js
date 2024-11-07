// Import Firebase SDKs
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { currentUserId } from './userContext.js';
import { openConversation } from './messages.js'; // Update with the correct path to your main chat script

// Initialize Firestore
const db = getFirestore();

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Function to search users and farmers based on the search term
async function searchUsersAndFarmers(searchTerm) {
    console.log("Searching for users and farmers with term: ", searchTerm); 

    // Queries for both User and Farmer collections
    const usersRef = collection(db, 'User');
    const farmersRef = collection(db, 'Farmer');
    
    // Queries for both User and Farmer collections by first name
    const userQuery = query(usersRef, where('UserFName', '>=', searchTerm), where('UserFName', '<=', searchTerm + '\uf8ff'));
    const farmerQuery = query(farmersRef, where('FarmerFName', '>=', searchTerm), where('FarmerFName', '<=', searchTerm + '\uf8ff'));

    try {
        // Fetch users and farmers
        const [userSnapshot, farmerSnapshot] = await Promise.all([getDocs(userQuery), getDocs(farmerQuery)]);
        const results = [];

        // Process user results
        userSnapshot.forEach((doc) => {
            const userData = doc.data();
            
            // Exclude the current user based on currentUserId
            if (doc.id !== currentUserId) {
                console.log("Found user: ", userData); 
                results.push({ ...userData, id: doc.id, type: 'user' }); // Add a type field to differentiate user
            }
        });

        // Process farmer results
        farmerSnapshot.forEach((doc) => {
            const farmerData = doc.data();
            
            // Exclude the current user based on currentUserId
            if (doc.id !== currentUserId) {
                console.log("Found farmer: ", farmerData); 
                results.push({ ...farmerData, id: doc.id, type: 'farmer' }); // Add a type field to differentiate farmer
            }
        });

        console.log("Results array: ", results); // Check if results array has data

        if (results.length > 0) {
            renderSearchResults(results);
        } else {
            console.log("No users or farmers found matching the query.");
            searchResults.innerHTML = '<p class="search-result-item">No users or farmers found.</p>';
        }
    } catch (error) {
        console.error('Error searching users and farmers: ', error);
    }
}

// Update renderSearchResults to show whether the result is a Farmer or User
function renderSearchResults(results) {
    searchResults.innerHTML = ''; 

    results.forEach(result => {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('search-result-item');
        
        // Determine the display name and type (User or Farmer)
        let displayName;
        if (result.type === 'user') {
            displayName = `${result.UserFName} ${result.UserLName} (${result.UserUname}) - User`; // For user, add the "User" label
        } else if (result.type === 'farmer') {
            displayName = `${result.FarmerFName} ${result.FarmerLName} (${result.FarmerUsername}) - Farmer`; // For farmer, add the "Farmer" label
        }

        // Set the display text
        resultDiv.textContent = displayName;

        // Add event listener for user or farmer selection
        resultDiv.addEventListener('click', () => {
            console.log(`Selected: ${result.FarmerFName || result.UserFName} ${result.FarmerLName || result.UserLName}`);
            createNewConversation(result.id, `${result.FarmerFName || result.UserFName} ${result.FarmerLName || result.UserLName}`);
            
            // Clear the search results and input after selection
            searchResults.innerHTML = ''; 
            searchInput.value = ''; 
        });

        searchResults.appendChild(resultDiv);
    });
}

// Event listener for search input
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim();
    console.log("Search term: ", searchTerm);  
    if (searchTerm) {
        searchUsersAndFarmers(searchTerm);
    } else {
        searchResults.innerHTML = ''; // Clear the dropdown when the input is empty
    }
});

// Function to get user details by ID (applies to both User and Farmer)
async function getUserNameById(userId) {
    const userDocRef = doc(db, 'User', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const userData = userDoc.data();
        return `${userData.UserFName} ${userData.UserLName}`;
    } else {
        console.log(`No user found with ID: ${userId}`);
        return null;
    }
}

// Function to create a new conversation when a user or farmer is selected
export async function createNewConversation(participantID, participantName) {
    console.log("Creating a new conversation...");
    const chatsRef = collection(db, 'chats');

    // Check if a conversation with this participant already exists
    const q = query(chatsRef, where('participants', 'array-contains', currentUserId));

    try {
        const snapshot = await getDocs(q);
        let existingConversation = null;

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.participants.includes(participantID)) {
                existingConversation = { ...data, id: doc.id };
            }
        });

        if (existingConversation) {
            console.log(`Opening existing conversation with ID: ${existingConversation.id}`);
            existingConversation.participantNames = await fetchParticipantNames(existingConversation.participants);
            
            // Get the correct participant name to display
            const otherParticipantName = existingConversation.participantNames.find(name => name !== currentUserId);
            openConversation({ ...existingConversation, name: otherParticipantName });
        } else {
            console.log("No existing conversation found. Creating a new one...");
            
            // Create a new conversation with participant names
            const participantNames = await fetchParticipantNames([currentUserId, participantID]);

            // Determine the conversation name based on the current user and the other participant
            const otherParticipantName = participantNames.find(name => name !== currentUserId);

            const docRef = await addDoc(chatsRef, {
                participants: [currentUserId, participantID],
                participantNames,
                name: `Conversation with ${otherParticipantName}`,
                timestamp: new Date(),
            });

            console.log("New conversation created with ID: ", docRef.id);
            
        }
    } catch (error) {
        console.error("Error creating new conversation: ", error);
    }
}

// Function to fetch participant names based on their IDs
async function fetchParticipantNames(participantIds) {
    const participantNamesPromises = participantIds.map(async (id) => {
        const name = await getUserNameById(id);
        return name || 'Unknown User'; // Fallback to 'Unknown User' if the user name is not found
    });

    return Promise.all(participantNamesPromises);
}