function updateSpendingChart() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    // Data for the pie chart
    const chartData = [income, expense];
    
    const ctx = document.getElementById('spending-chart').getContext('2d');
    
    if (window.spendingChart) {
        window.spendingChart.destroy();  // Destroy previous chart instance if it exists
    }

    window.spendingChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expense'], // Dynamic labels
            datasets: [{
                label: 'Spending by Category',
                data: chartData,  // Use calculated data
                backgroundColor: ['#36a2eb', '#ff6384'] // Colors for Income and Expense
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

