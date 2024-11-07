// logout.js

// Function to log out the user
function logout() {
    // Add your logic to log out the user, e.g., clear session storage, redirect, etc.
    // For example:
    sessionStorage.clear(); // Clear any stored user data
    window.location.href = './login.html'; // Redirect to the login page
}

// Attach the logout function to the Log Out button
document.getElementById('logout-button').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default anchor action
    logout(); // Call the logout function
});
