// Sample data for demonstration
const expenses = [
    { date: '2024-10-28', category: 'Food', description: 'Lunch', amount: 10 },
    { date: '2024-10-27', category: 'Transportation', description: 'Train ticket', amount: 5 },
    { date: '2024-10-20', category: 'Groceries', description: 'Weekly groceries', amount: 50 },
    // Add more sample data
];

// Track the user's premium status (for this demo, set to true for premium users)
const isPremiumUser = false;

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("download-btn").disabled = !isPremiumUser;
    filterData('daily');
});

// Function to filter data based on daily, weekly, or monthly selection
function filterData(filterType) {
    let filteredExpenses;
    const currentDate = new Date();

    if (filterType === 'daily') {
        filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.toDateString() === currentDate.toDateString();
        });
    } else if (filterType === 'weekly') {
        filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const oneWeekAgo = new Date(currentDate);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return expenseDate >= oneWeekAgo && expenseDate <= currentDate;
        });
    } else if (filterType === 'monthly') {
        filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentDate.getMonth() &&
                   expenseDate.getFullYear() === currentDate.getFullYear();
        });
    }

    renderTable(filteredExpenses);
    updateActiveFilter(filterType);
}

// Render the expenses table
function renderTable(data) {
    const tbody = document.getElementById('expense-table').querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>$${expense.amount.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update active filter button styling
function updateActiveFilter(filterType) {
    document.querySelectorAll('.filter-buttons button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`button[onclick="filterData('${filterType}')"]`).classList.add('active');
}
