document.addEventListener("DOMContentLoaded", function() {
    const farmerRadio = document.getElementById('farmer');
    const adminRadio = document.getElementById('admin');
    const userRadio = document.getElementById('user');
    const farmerForm = document.querySelector('.farmer-form');
    const adminForm = document.querySelector('.admin-form');
    const userForm = document.querySelector('.user-form');
    const showFarmerPassword = document.getElementById('showFarmerPassword');
    const showAdminPassword = document.getElementById('showAdminPassword');
    const showUserPassword = document.getElementById('showUserPassword');
    const farmerPasswordField = document.getElementById('farmerPassword');
    const adminPasswordField = document.getElementById('adminPassword');
    const userPasswordField = document.getElementById('userPassword');

    // Add event listeners for radio buttons
    farmerRadio.addEventListener('change', toggleForm);
    adminRadio.addEventListener('change', toggleForm);
    userRadio.addEventListener('change', toggleForm);

    function toggleForm() {
        if (farmerRadio.checked) {
            farmerForm.classList.remove('hidden');
            adminForm.classList.add('hidden');
            userForm.classList.add('hidden');
            document.querySelector('.slide').style.left = '0'; // Slide to farmer
        } else if (adminRadio.checked) {
            adminForm.classList.remove('hidden');
            farmerForm.classList.add('hidden');
            userForm.classList.add('hidden');
            document.querySelector('.slide').style.left = '66%';
        } else if (userRadio.checked) {
            userForm.classList.remove('hidden');
            farmerForm.classList.add('hidden');
            adminForm.classList.add('hidden');
            document.querySelector('.slide').style.left = '33%';
        }
    }

    // Toggle password visibility for Farmer
    showFarmerPassword.addEventListener('change', function() {
        if (showFarmerPassword.checked) {
            farmerPasswordField.type = 'text';  // Show password
        } else {
            farmerPasswordField.type = 'password';  // Hide password
        }
    });

    // Toggle password visibility for Admin
    showAdminPassword.addEventListener('change', function() {
        if (showAdminPassword.checked) {
            adminPasswordField.type = 'text';  // Show password
        } else {
            adminPasswordField.type = 'password';  // Hide password
        }
    });

    // Toggle password visibility for user
    showUserPassword.addEventListener('change', function() {
        if (showUserPassword.checked) {
            userPasswordField.type = 'text';  // Show password
        } else {
            userPasswordField.type = 'password';  // Hide password
        }
    });

    // Initial state (show farmer form by default)
    toggleForm();
});
