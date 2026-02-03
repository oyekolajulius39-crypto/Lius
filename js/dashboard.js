// dashboard.js

// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    // Not logged in, redirect to login page
    window.location.href = 'index.html';
} else {
    // Display user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('dashboardUserName').textContent = currentUser.name;

    // Set initials in avatar
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('userInitials').textContent = initials;
}

// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});
