import { auth, db } from './firebase.js';
import { 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        initializeDashboard(user);
    } else {
        window.location.href = 'login.html';
    }
});

// Initialize dashboard
function initializeDashboard(user) {
    // Update user info in sidebar
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userInitials = document.getElementById('userInitials');
    const dashboardUserName = document.getElementById('dashboardUserName');
    
    if (userName) userName.textContent = user.displayName || 'User';
    if (userEmail) userEmail.textContent = user.email;
    if (dashboardUserName) dashboardUserName.textContent = user.displayName || 'User';
    
    if (userInitials && user.displayName) {
        const initials = user.displayName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        userInitials.textContent = initials;
    }
    
    // Setup real-time listeners
    setupRealtimeListeners(user.uid);
    
    // Setup event listeners
    setupEventListeners();
}

// Setup real-time listeners for transactions
function setupRealtimeListeners(userId) {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    
    onSnapshot(q, (snapshot) => {
        const transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        updateDashboardSummary(transactions);
        displayRecentTransactions(transactions.slice(0, 5));
    });
}

// Update dashboard summary
function updateDashboardSummary(transactions) {
    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    transactions.forEach(transaction => {
        const transactionDate = transaction.createdAt.toDate();
        const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                              transactionDate.getFullYear() === currentYear;
        
        if (transaction.type === 'income') {
            totalBalance += transaction.amount;
            if (isCurrentMonth) totalIncome += transaction.amount;
        } else {
            totalBalance -= transaction.amount;
            if (isCurrentMonth) totalExpenses += transaction.amount;
        }
    });
    
    // Update UI
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    
    // Update trend (simplified - you can make this more sophisticated)
    const balanceTrend = document.getElementById('balanceTrend');
    if (balanceTrend) {
        const trend = totalIncome > totalExpenses ? 'positive' : 'negative';
        const percentage = totalExpenses > 0 
            ? Math.abs(((totalIncome - totalExpenses) / totalExpenses) * 100).toFixed(1)
            : 0;
        
        balanceTrend.className = `trend-indicator ${trend}`;
        balanceTrend.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 ${trend === 'positive' ? '12V4M8 4L4 8M8 4L12 8' : '4V12M8 12L4 8M8 12L12 8'}" 
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${percentage}%
        `;
    }
}

// Display recent transactions
function displayRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="#F3F4F6"/>
                    <path d="M32 20V44M20 32H44" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round"/>
                </svg>
                <p>No transactions yet</p>
                <button class="btn-secondary" onclick="document.getElementById('addTransactionBtn').click()">Add your first transaction</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    ${transaction.type === 'income' ? '📈' : '📉'}
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">${transaction.category} • ${formatDate(transaction.createdAt)}</div>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                showToast('Logged out successfully', 'success');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Failed to logout', 'error');
            }
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    
    // Add transaction modal
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const modal = document.getElementById('addTransactionModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (addTransactionBtn && modal) {
        addTransactionBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Transaction form submission
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddTransaction();
        });
    }
}

// Handle adding transaction
async function handleAddTransaction() {
    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    
    if (!amount || !description || !category) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        await addDoc(collection(db, 'transactions'), {
            userId: currentUser.uid,
            type,
            amount,
            description,
            category,
            createdAt: Timestamp.now()
        });
        
        showToast('Transaction added successfully!', 'success');
        
        // Reset form and close modal
        document.getElementById('transactionForm').reset();
        document.getElementById('addTransactionModal').classList.remove('active');
        
    } catch (error) {
        console.error('Error adding transaction:', error);
        showToast('Failed to add transaction', 'error');
    }
}
