// Array to hold transactions
let transactions = [];

// DOM Elements
const balanceAmount = document.getElementById("remaining-amount");
const incomeAmount = document.getElementById("income-amount");
const expenseAmount = document.getElementById("expense-amount");
const transactionList = document.getElementById("transaction-list");
const transactionForm = document.querySelector("form");
const transactionName = document.getElementById("transaction-name");
const transactionAmount = document.getElementById("transaction-amount");
const transactionType = document.getElementById("transaction-type");
const transactionDatetime = document.getElementById("transaction-datetime");
const budgetProgress = document.getElementById("budget-progress");
const searchBar = document.getElementById("search-bar");
const messageElement = document.getElementById("search-message");
const budgetGoalInput = document.getElementById("budget-goal");
const spendingChartCanvas = document.getElementById("spending-chart");

// Load transactions and budget goal from local storage on page load
window.addEventListener("load", () => {
    loadFromLocalStorage();
    updateValues();
});

// Add new transaction
transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = transactionName.value.trim();
    const amount = parseFloat(transactionAmount.value);
    const type = transactionType.value;
    const datetime = transactionDatetime.value;

    if (name && !isNaN(amount) && datetime) {
        const transaction = {
            id: Date.now(),
            name,
            amount,
            type,
            datetime,
        };

        transactions.push(transaction);
        addTransactionToList(transaction);
        updateValues();
        saveToLocalStorage();
        transactionForm.reset();
    } else {
        alert("Please fill out all fields correctly.");
    }
});

// Add transaction to the list
function addTransactionToList(transaction) {
    const listItem = document.createElement("li");
    listItem.classList.add(transaction.type);
    listItem.innerHTML = 
        `${transaction.name} - ${new Date(transaction.datetime).toLocaleString()} 
        <span>${transaction.type === "income" ? "+" : "-"}₹${Math.abs(transaction.amount).toFixed(2)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">X</button>`;
    transactionList.appendChild(listItem);
}

// Update the income, expense, and balance amounts
function updateValues() {
    const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;

    balanceAmount.innerText = `₹${balance.toFixed(2)}`;
    incomeAmount.innerText = `₹${income.toFixed(2)}`;
    expenseAmount.innerText = `₹${expense.toFixed(2)}`;

    updateSpendingChart(income, expense);
    updateBudgetProgress();
}

// Remove transaction
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    transactionList.innerHTML = "";
    transactions.forEach(addTransactionToList);
    updateValues();
    saveToLocalStorage();
}

// Save transactions to local storage
function saveToLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Load transactions from local storage
function loadFromLocalStorage() {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions"));
    if (storedTransactions) {
        transactions = storedTransactions;
        transactions.forEach(addTransactionToList);
    }
}

// Update the pie chart for income and expense
function updateSpendingChart(income, expense) {
    if (!spendingChartCanvas) return;
    const ctx = spendingChartCanvas.getContext("2d");

    if (window.spendingChart) {
        window.spendingChart.destroy();
    }

    window.spendingChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["#36a2eb", "#ff6384"],
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}

// Set budget goal
function setBudgetGoal() {
    const goal = parseFloat(budgetGoalInput.value);
    if (!isNaN(goal) && goal > 0) {
        localStorage.setItem("budgetGoal", goal);
        updateBudgetProgress();
    }
}

// Update budget progress
function updateBudgetProgress() {
    const goal = parseFloat(localStorage.getItem("budgetGoal"));
    if (isNaN(goal) || goal <= 0) return; // Avoid running if no goal is set

    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
    
    budgetProgress.textContent = `You've spent ₹${totalExpenses.toFixed(2)} of your ₹${goal.toFixed(2)} budget.`;
    
    if (totalExpenses >= goal) {
        budgetProgress.style.color = "red";
        alert("Warning: You've reached or exceeded your budget!");
    } else {
        budgetProgress.style.color = "green";
    }
}

// Search transactions
function searchTransactions() {
    const query = searchBar.value.toLowerCase();
    const filteredTransactions = transactions.filter(t => t.name.toLowerCase().includes(query));

    transactionList.innerHTML = "";
    filteredTransactions.forEach(addTransactionToList);
    
    if (messageElement) {
        messageElement.innerText = filteredTransactions.length === 0 ? "The transaction is not listed." : "";
        messageElement.style.display = filteredTransactions.length === 0 ? "block" : "none";
    }
}

// Event listener for search bar
searchBar.addEventListener("input", searchTransactions);
