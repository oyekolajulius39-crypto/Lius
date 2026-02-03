function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showToast('Invalid email or password!');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    showToast('Login successful! Redirecting...');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
});
