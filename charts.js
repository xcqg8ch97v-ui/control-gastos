/**
 * CHARTS.JS - Implementación de Gráficos con Chart.js
 * Crea gráficos de distribución por categoría e ingresos vs gastos
 */

let expensesChart = null;
let incomeChart = null;

/**
 * Inicializa y renderiza todos los gráficos
 */
function initCharts(startDate = null, endDate = null) {
    destroyCharts();
    
    const expensesChartCanvas = document.getElementById('expenses-chart');
    const incomeChartCanvas = document.getElementById('income-chart');

    if (expensesChartCanvas) {
        createPieChart(expensesChartCanvas, 'expenses', startDate, endDate);
    }

    if (incomeChartCanvas) {
        createPieChart(incomeChartCanvas, 'income', startDate, endDate);
    }
}

/**
 * Destruye los gráficos anteriores para evitar conflictos
 */
function destroyCharts() {
    if (expensesChart) {
        expensesChart.destroy();
        expensesChart = null;
    }
    if (incomeChart) {
        incomeChart.destroy();
        incomeChart = null;
    }
}

/**
 * Crea un pie chart para gastos o ingresos filtrados por rango de fechas
 */
function createPieChart(canvas, type, startDate = null, endDate = null) {
    // Obtiene datos según el tipo (gastos o ingresos)
    const categoryData = type === 'expenses' 
        ? dataManager.getExpensesByCategory(startDate, endDate)
        : dataManager.getIncomeByCategory(startDate, endDate);
    
    // Filtra solo aquellas categorías con datos
    const labels = [];
    const data = [];
    const colors = [];

    for (const [categoryId, amount] of Object.entries(categoryData)) {
        const category = dataManager.getCategoryById(categoryId);
        if (category && amount > 0) {
            labels.push(category.name);
            data.push(amount);
            colors.push(category.color);
        }
    }

    // Si no hay datos, muestra un mensaje
    if (data.length === 0) {
        canvas.parentElement.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-lg);">No hay ${type === 'expenses' ? 'gastos' : 'ingresos'} para mostrar</p>`;
        return;
    }

    const ctx = canvas.getContext('2d');
    const chartObj = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim(),
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim()
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary').trim(),
                    titleColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim(),
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `€${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Guarda la referencia del gráfico
    if (type === 'expenses') {
        expensesChart = chartObj;
    } else {
        incomeChart = chartObj;
    }
}

/**
 * Redibuja los gráficos cuando cambia el tema
 */
function redrawChartsOnThemeChange() {
    if (document.getElementById('dashboard').classList.contains('active')) {
        // Obtiene el rango de fechas actual si existen
        const startDate = document.getElementById('dashboard-start-date')?.value || null;
        const endDate = document.getElementById('dashboard-end-date')?.value || null;
        initCharts(startDate, endDate);
    }
}

// Observa cambios en el tema
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        setTimeout(redrawChartsOnThemeChange, 100);
    });
}

// Redibuja gráficos cuando cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    if (window.app && window.app.currentSection === 'dashboard') {
        const startDate = document.getElementById('dashboard-start-date')?.value || null;
        const endDate = document.getElementById('dashboard-end-date')?.value || null;
        initCharts(startDate, endDate);
    }
});
