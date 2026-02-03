const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) window.location.href = 'login.html';

document.getElementById('userName').textContent = currentUser.name;
document.getElementById('userEmail').textContent = currentUser.email;
document.getElementById('userInitials').textContent = currentUser.name.split(' ').map(n=>n[0].toUpperCase()).join('');
document.getElementById('dashboardUserName').textContent = currentUser.name;

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// Transactions
let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.email}`)) || [];
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const recentTransactionsEl = document.getElementById('recentTransactions');

function updateDashboard() {
    const income = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0);
    const expense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
    const balance = income - expense;

    totalIncomeEl.textContent = `$${income.toFixed(2)}`;
    totalExpensesEl.textContent = `$${expense.toFixed(2)}`;
    totalBalanceEl.textContent = `$${balance.toFixed(2)}`;
    renderTransactions();
}

function renderTransactions() {
    recentTransactionsEl.innerHTML = '';
    if (transactions.length === 0) {
        recentTransactionsEl.innerHTML = `<div class="empty-state"><p>No transactions yet</p></div>`;
        return;
    }
    transactions.slice(-5).reverse().forEach(t=>{
        const tr = document.createElement('div');
        tr.classList.add('transaction-item');
        tr.innerHTML = `<div>${t.description}</div><div>${t.category}</div><div>$${Number(t.amount).toFixed(2)}</div>`;
        recentTransactionsEl.appendChild(tr);
    });
}

updateDashboard();

// Add transaction modal
const addTransactionBtn = document.getElementById('addTransactionBtn');
const addTransactionModal = document.getElementById('addTransactionModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const transactionForm = document.getElementById('transactionForm');

addTransactionBtn.addEventListener('click', ()=> addTransactionModal.classList.add('show'));
closeModalBtn.addEventListener('click', ()=> addTransactionModal.classList.remove('show'));
cancelBtn.addEventListener('click', ()=> addTransactionModal.classList.remove('show'));

transactionForm.addEventListener('submit', e=>{
    e.preventDefault();
    const type = transactionForm.type.value;
    const amount = parseFloat(transactionForm.amount.value);
    const description = transactionForm.description.value;
    const category = transactionForm.category.value;

    transactions.push({type, amount, description, category, date: new Date().toISOString()});
    localStorage.setItem(`transactions_${currentUser.email}`, JSON.stringify(transactions));
    updateDashboard();
    addTransactionModal.classList.remove('show');
    transactionForm.reset();
});
