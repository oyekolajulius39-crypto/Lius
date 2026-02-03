// -------------------- Helper Functions --------------------
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Get stored users from LocalStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Save users to LocalStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// -------------------- Signup --------------------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!name || !email || !password) {
            showToast('All fields are required', 'error');
            return;
        }

        const users = getUsers();
        const userExists = users.find(u => u.email === email);

        if (userExists) {
            showToast('Email already registered', 'error');
            return;
        }

        users.push({ name, email, password });
        saveUsers(users);

        showToast('Account created successfully!', 'success');

        setTimeout(() => {
            window.location.href = 'index.html'; // redirect to login
        }, 1000);
    });
}

// -------------------- Login --------------------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            showToast('Invalid email or password', 'error');
            return;
        }

        // Save current logged-in user
        localStorage.setItem('currentUser', JSON.stringify(user));

        showToast(`Welcome back, ${user.name}!`, 'success');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    });
}

// -------------------- Dashboard --------------------
const dashboard = document.getElementById('dashboard');
if (dashboard) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html'; // redirect to login if not logged in
    } else {
        dashboard.innerHTML = `
            <h1>Welcome, ${currentUser.name}!</h1>
            <p>Email: ${currentUser.email}</p>
            <button id="logoutBtn">Logout</button>
        `;

        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            showToast('Logged out successfully', 'success');
            setTimeout(() => window.location.href = 'index.html', 500);
        });
    }
}
