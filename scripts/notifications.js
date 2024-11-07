// Array to store notifications
let notifications = [];

// Select elements
const notificationBox = document.getElementById('notification-box');
const notificationList = document.getElementById('notification-list');
const addNotificationBtn = document.getElementById('add-notification');
const clearNotificationsBtn = document.getElementById('clear-notifications');

// Random notifications list
const randomMessages = [
    "Your order has been shipped.",
    "New discount on fresh vegetables!",
    "Order #1234 has been delivered.",
    "Reminder: Your cart is waiting for you.",
    "New seasonal veggies are available!",
    "Flash Sale! 20% off on all products.",
    "Check out our latest recipes.",
    "You have earned 100 reward points.",
    "New update: Fresh stock arrived today.",
    "Your favorite veggies are back in stock!"
];

// Add notification function
function addNotification(message) {
    const notification = {
        id: Date.now(),
        message: message,
        read: false
    };
    notifications.push(notification);
    updateNotificationUI();
}

// Update notification count and list in the UI
function updateNotificationUI() {
    // Clear the notification list
    notificationList.innerHTML = '';

    // Add each notification to the notification list in LIFO order
    notifications.slice().reverse().forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.classList.add('notification-item');
        notificationItem.textContent = notification.message;
        notificationItem.dataset.id = notification.id;

        // If the notification is read, apply a different style
        if (notification.read) {
            notificationItem.classList.add('read');
        }

        // Add click event to mark the notification as read
        notificationItem.addEventListener('click', () => {
            markAsRead(notification.id);
        });

        notificationList.appendChild(notificationItem);
    });
}

// Mark a notification as read
function markAsRead(id) {
    notifications = notifications.map(notification => {
        if (notification.id === id) {
            return { ...notification, read: true };
        }
        return notification;
    });
    updateNotificationUI();
}

// Clear all notifications
clearNotificationsBtn.addEventListener('click', () => {
    notifications = [];
    updateNotificationUI();
});

// Add a notification when clicking the "Add Notification" button
addNotificationBtn.addEventListener('click', () => {
    const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    addNotification(randomMessage);
});

// Initialize with demo notifications after the DOM is fully loaded
window.onload = function() {
    addNotification('Welcome! You have 1 new notification.');
    const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    addNotification(randomMessage);
};
