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
    onSnapshot,
    deleteDoc,
    doc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let allTransactions = [];

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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        initializeTransactions(user);
    } else {
        window.location.href = 'login.html';
    }
});

// Initialize transactions page
function initializeTransactions(user) {
    // Update user info in sidebar
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userInitials = document.getElementById('userInitials');
    
    if (userName) userName.textContent = user.displayName || 'User';
    if (userEmail) userEmail.textContent = user.email;
    
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
        allTransactions = [];
        snapshot.forEach((doc) => {
            allTransactions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        applyFilters();
    });
}

// Apply filters
function applyFilters() {
    const typeFilter = document.getElementById('filterType').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    
    let filteredTransactions = [...allTransactions];
    
    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    if (categoryFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
    }
    
    displayTransactions(filteredTransactions);
}

// Display transactions in table
function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="6">
                    <div class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                            <circle cx="32" cy="32" r="32" fill="#F3F4F6"/>
                            <path d="M32 20V44M20 32H44" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                        <p>No transactions found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${formatDate(transaction.createdAt)}</td>
            <td><strong>${transaction.description}</strong></td>
            <td><span class="category-badge">${transaction.category}</span></td>
            <td><span class="type-badge ${transaction.type}">${transaction.type}</span></td>
            <td class="amount-cell ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </td>
            <td>
                <button class="action-btn" onclick="deleteTransaction('${transaction.id}')" title="Delete">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M8 4H12M4 6H16M14 6L13.7 12.3C13.6 13.8 13.5 14.5 13.2 15C12.9 15.5 12.5 15.9 12 16.2C11.5 16.5 10.8 16.5 9.3 16.5H10.7C9.2 16.5 8.5 16.5 8 16.2C7.5 15.9 7.1 15.5 6.8 15C6.5 14.5 6.4 13.8 6.3 12.3L6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

// Delete transaction
window.deleteTransaction = async function(transactionId) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'transactions', transactionId));
        showToast('Transaction deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showToast('Failed to delete transaction', 'error');
    }
};

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
    
    // Filter changes
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    
    if (filterType) {
        filterType.addEventListener('change', applyFilters);
    }
    
    if (filterCategory) {
        filterCategory.addEventListener('change', applyFilters);
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
