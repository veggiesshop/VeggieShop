
/*Script for Button Showing*/
document.getElementById('addFarmersBtn').addEventListener('click', function() {
    showSection('addFarmersSection');
});

document.getElementById('statusBtn').addEventListener('click', function() {
    showSection('statusActivation');
});

document.getElementById('usersBtn').addEventListener('click', function() {
    showSection('userActivation');
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

document.getElementById('imageUpload').addEventListener('change', function() {
    var fileName = this.files[0].name;
    document.getElementById('file-name').textContent = fileName;
});

document.getElementById("logoutBtn").addEventListener("click", function() {
    window.location.href = '../../login.html';  // Adjust the path if necessary
});