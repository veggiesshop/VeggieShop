const video = document.getElementById('video');
const startCameraBtn = document.getElementById('startCameraBtn');
const goLiveBtn = document.getElementById('goLiveBtn');
const stopLiveBtn = document.getElementById('stopLiveBtn'); // Stop Live button
const cameraContainer = document.querySelector('.camera-container');
const liveIndicator = document.getElementById('liveIndicator');

// Function to start the camera
startCameraBtn.addEventListener('click', () => {
    // Ask for permission to access the camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            console.log("Camera stream accessed successfully.");
            video.srcObject = stream;
            cameraContainer.style.display = 'block';
            goLiveBtn.style.display = 'inline-block';
            startCameraBtn.style.display = 'none';
        })
        .catch((err) => {
            console.error("Error accessing the camera: ", err);
        });
});


// Function to go live when the "Go Live" button is clicked
goLiveBtn.addEventListener('click', () => {
    // Show the live indicator
    liveIndicator.style.display = 'block';
    // Show the "Stop Live" button
    stopLiveBtn.style.display = 'inline-block';
    // Hide the "Go Live" button once it is clicked
    goLiveBtn.style.display = 'none';
});

// Function to stop live when the "Stop Live" button is clicked
stopLiveBtn.addEventListener('click', () => {
    // Hide the live indicator
    liveIndicator.style.display = 'none';
    // Show the "Go Live" button again
    goLiveBtn.style.display = 'inline-block';
    // Hide the "Stop Live" button
    stopLiveBtn.style.display = 'none';
});
