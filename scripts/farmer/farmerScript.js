/* Script for Button Showing */
document.getElementById('manageProductsBtn').addEventListener('click', function() {
    showSection('farmerProducts');
});

document.getElementById('manageOrdersBtn').addEventListener('click', function() {
    showSection('orderList'); // This ensures "Your Orders" section is displayed when the button is clicked
});

function showSection(sectionId) {
    // Hide all sections
    var sections = document.getElementsByClassName('content-section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active-section');
    }

    // Show the selected section
    document.getElementById(sectionId).classList.add('active-section');
}

/* Logout Function */
document.getElementById("logoutBtn").addEventListener("click", function() {
    window.location.href = '../../login.html';  // Adjust the path if necessary
});

/* Change to Order Function */
document.getElementById("ordHistory").addEventListener("click", function() {
    window.location.href = './farmerOrderHistory.html';  // Adjust the path if necessary
});

/* Modal Opening Script */
// Get modal elements
const modal = document.getElementById("productModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.querySelector(".close");

// Open modal when button is clicked
openModalBtn.addEventListener("click", function() {
    modal.style.display = "block";
});

// Close modal when 'X' is clicked
closeModalBtn.addEventListener("click", function() {
    modal.style.display = "none";
});

// Close modal if user clicks outside the modal content
window.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

document.getElementById('imageUpload').addEventListener('change', function() {
    var fileName = this.files[0].name;
    document.getElementById('file-name').textContent = fileName;
});