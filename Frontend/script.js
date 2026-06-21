// Local application states and baseline metrics
let transactions = [];
let chartInstance = null;

const defaultBudgets = {
    'Food': 400.00,
    'Transport': 200.00,
    'Shopping': 300.00,
    'Entertainment': 150.00,
    'Bills': 400.00
};

const categoryColors = {
    'Food': '#3b82f6',
    'Transport': '#9333ea',
    'Entertainment': '#db2777',
    'Shopping': '#ea580c',
    'Bills': '#22c55e',
    'Healthcare': '#ef4444',
    'Salary': '#10b981'
};

// Structural Init Process Trigger
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    initFormInteractions();
    initNavigation();
});

// Fetch all dashboard data from backend API
async function fetchDashboardData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            if (response.status === 401) {
                // Redirect to login if unauthorized
                window.location.href = 'login.html';
                return;
            }
            throw new Error("Failed to fetch data");
        }
        
        const data = await response.json();
        transactions = data.transactions;
        
        // Update KPIs
        document.getElementById('kpiBalance').innerText = '$' + data.summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('kpiIncome').innerText = '$' + data.summary.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('kpiExpense').innerText = '$' + data.summary.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // Render sub-components
        renderTransactions(transactions);
        renderBudgets();
        updatePieChart();
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

// Render the visual category breakdown pie chart dynamically
function updatePieChart() {
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    
    // Group expense transactions by category
    const categoryTotals = {};
    let totalExpense = 0;
    
    transactions.forEach(item => {
        if (item.type === 'expense') {
            const cat = item.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + item.amount;
            totalExpense += item.amount;
        }
    });

    let labels = [];
    let data = [];
    let colors = [];

    if (totalExpense === 0) {
        // Render grey placeholder chart when there is no expense data
        labels = ['No Expenses'];
        data = [1];
        colors = ['#cbd5e1']; // Sleek light grey
    } else {
        labels = Object.keys(categoryTotals);
        data = Object.values(categoryTotals);
        colors = labels.map(cat => categoryColors[cat] || '#64748b');
    }

    // Destroy existing chart instance to prevent canvas rendering errors
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#64748b', boxWidth: 10, padding: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (totalExpense === 0) {
                                return "No Expense Data Available";
                            }
                            const val = context.raw;
                            const percentage = ((val / totalExpense) * 100).toFixed(1);
                            return ` ${context.label}: $${val.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render dynamic ledger records inside lists
function renderTransactions(items) {
    const listElement = document.getElementById('transactionList');
    listElement.innerHTML = '';

    if (items.length === 0) {
        listElement.innerHTML = `
            <li class="transaction-item" style="justify-content: center; color: var(--text-secondary); font-style: italic; padding: 24px;">
                No transactions recorded yet.
            </li>
        `;
        return;
    }

    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'transaction-item';

        const amountString = (item.type === 'expense' ? '-' : '+') + '$' + item.amount.toFixed(2);
        const amountClass = item.type === 'expense' ? 'negative' : 'positive';
        const categoryClass = item.category.toLowerCase() + '-tag';
        const displayDate = item.date || 'No date';

        listItem.innerHTML = `
            <div class="transaction-title-wrapper">
                <h4>${item.title}</h4>
                <div class="transaction-meta">
                    <span class="transaction-category ${categoryClass}">${item.category}</span>
                    <span class="transaction-date">${displayDate}</span>
                </div>
            </div>
            <div class="transaction-amount kpi-change ${amountClass}">${amountString}</div>
        `;
        listElement.appendChild(listItem);
    });
}

// Render active budget progress status elements
function renderBudgets() {
    const listElement = document.getElementById('budgetList');
    listElement.innerHTML = '';

    // Calculate category spending from transactions
    const categorySpent = {};
    transactions.forEach(item => {
        if (item.type === 'expense') {
            categorySpent[item.category] = (categorySpent[item.category] || 0) + item.amount;
        }
    });

    Object.keys(defaultBudgets).forEach(category => {
        const spent = categorySpent[category] || 0.0;
        const total = defaultBudgets[category];
        const remaining = total - spent;
        
        const listItem = document.createElement('li');
        listItem.className = 'budget-item';

        const percentage = Math.min((spent / total) * 100, 100);
        const fillClass = category.toLowerCase() + '-fill';

        listItem.innerHTML = `
            <div class="budget-info">
                <span class="budget-category">${category}</span>
                <span class="budget-totals">$${spent.toFixed(2)} / $${total.toFixed(2)}</span>
            </div>
            <div class="budget-progress-bar">
                <div class="progress-fill ${fillClass}" style="width: ${percentage}%;"></div>
            </div>
            <div class="budget-remaining">$${remaining >= 0 ? remaining.toFixed(2) + ' remaining' : Math.abs(remaining).toFixed(2) + ' over budget'}</div>
        `;
        listElement.appendChild(listItem);
    });
}

// Handle Form Submits, Types, and Real-time Component Previews
function initFormInteractions() {
    const expenseOption = document.querySelector('.expense-option');
    const incomeOption = document.querySelector('.income-option');
    const amountInput = document.getElementById('formAmount');
    const descriptionInput = document.getElementById('formDescription');
    const categorySelect = document.getElementById('formCategory');
    const previewDescription = document.getElementById('previewDescription');
    const previewAmount = document.getElementById('previewAmount');
    const formElement = document.getElementById('addTransactionForm');

    let currentType = 'expense';

    expenseOption.addEventListener('click', () => {
        currentType = 'expense';
        expenseOption.classList.add('active');
        incomeOption.classList.remove('active');
        updatePreview();
    });

    incomeOption.addEventListener('click', () => {
        currentType = 'income';
        incomeOption.classList.add('active');
        expenseOption.classList.remove('active');
        updatePreview();
    });

    function updatePreview() {
        const amount = parseFloat(amountInput.value) || 0;
        const description = descriptionInput.value || 'No description';
        const category = categorySelect.value;
        const sign = currentType === 'expense' ? '-' : '+';
        const amountClass = currentType === 'expense' ? 'negative' : 'positive';

        previewDescription.innerText = `${description} • ${category}`;
        previewAmount.innerText = `${sign}$${amount.toFixed(2)}`;
        previewAmount.className = `preview-amount kpi-change ${amountClass}`;
    }

    // Bind reactive preview change elements
    [amountInput, descriptionInput, categorySelect].forEach(el => el.addEventListener('input', updatePreview));

    // Handle form submissions to backend
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const transactionData = {
            title: descriptionInput.value,
            category: categorySelect.value,
            date: document.getElementById('formDate').value,
            type: currentType,
            amount: parseFloat(amountInput.value)
        };

        try {
            const response = await fetch('/api/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });

            if (response.ok) {
                formElement.reset();
                updatePreview();
                navigateToDashboard();
                fetchDashboardData();
            } else {
                const resData = await response.json();
                alert(resData.message || "Failed to add transaction");
            }
        } catch (error) {
            console.error("Error submitting transaction:", error);
            alert("An error occurred. Please try again.");
        }
    });

    // Wire up filter controls
    document.getElementById('transactionSearch').addEventListener('input', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
}

// Live lookup filter computation algorithms
function applyFilters() {
    const query = document.getElementById('transactionSearch').value.toLowerCase();
    const targetCat = document.getElementById('categoryFilter').value;

    const filtered = transactions.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(query);
        const matchesCategory = targetCat === 'all' || item.category === targetCat;
        return matchesSearch && matchesCategory;
    });

    renderTransactions(filtered);
}

// View Controller Pipelines
function initNavigation() {
    document.getElementById('openAddTransaction').addEventListener('click', () => {
        document.getElementById('mainDashboardView').style.display = 'none';
        document.getElementById('addTransactionView').style.display = 'block';
        // Set default date input value to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('formDate').value = today;
    });

    const leaveForm = (e) => {
        if (e) e.preventDefault();
        navigateToDashboard();
    };

    document.getElementById('backToDashboard').addEventListener('click', leaveForm);
    document.getElementById('cancelFormBtn').addEventListener('click', leaveForm);
}

function navigateToDashboard() {
    document.getElementById('addTransactionView').style.display = 'none';
    document.getElementById('mainDashboardView').style.display = 'block';
}