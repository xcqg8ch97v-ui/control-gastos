/**
 * DATA.JS - Motor de Persistencia y Gestión de Datos
 * Gestiona localStorage, generación de IDs, normalización de datos y datos de ejemplo
 */

class DataManager {
    constructor() {
        this.STORAGE_KEY = 'controlGastosData';
        this.CATEGORIES_STORAGE_KEY = 'controlGastosCategorias';
        this.DEFAULT_CATEGORIES = [
            { id: 'groceries', name: 'Supermercado', type: 'expense', color: '#FF4421' },
            { id: 'transport', name: 'Transporte', type: 'expense', color: '#FF6DB3' },
            { id: 'dining', name: 'Comidas', type: 'expense', color: '#FF4421' },
            { id: 'entertainment', name: 'Entretenimiento', type: 'expense', color: '#FF6DB3' },
            { id: 'utilities', name: 'Servicios', type: 'expense', color: '#6BD6F1' },
            { id: 'health', name: 'Salud', type: 'expense', color: '#A8E571' },
            { id: 'salary', name: 'Nómina', type: 'income', color: '#A8E571' },
            { id: 'freelance', name: 'Freelance', type: 'income', color: '#A8E571' },
            { id: 'investment', name: 'Ahorro', type: 'savings', color: '#BE52BE' },
            { id: 'emergency', name: 'Fondo Emergencia', type: 'savings', color: '#BE52BE' },
            { id: 'other', name: 'Otros', type: 'expense', color: '#666666' }
        ];

        this.CATEGORIES = [...this.DEFAULT_CATEGORIES];

        this.CATEGORY_KEYWORDS = {
            'groceries': ['mercadona', 'carrefour', 'lidl', 'alcampo', 'compra', 'supermercado', 'tienda', 'dia', 'consum'],
            'transport': ['gasolina', 'uber', 'taxi', 'autobús', 'tren', 'metro', 'aparcamiento', 'parking', 'renfe', 'repsol', 'cepsa'],
            'dining': ['restaurante', 'bar', 'cafe', 'mcdonalds', 'pizza', 'comida', 'cena', 'pizzeria', 'burger', 'kebab'],
            'entertainment': ['cine', 'teatro', 'musica', 'netflix', 'spotify', 'gaming', 'ocio', 'cines'],
            'utilities': ['luz', 'agua', 'gas', 'internet', 'telefono', 'electricidad', 'adeudo', 'endesa', 'naturgy', 'telefonica'],
            'health': ['farmacia', 'doctor', 'hospital', 'medico', 'dentista', 'salud', 'clinica'],
            'salary': ['nómina', 'salary', 'sueldo', 'nómina'],
            'freelance': ['freelance', 'proyecto', 'cliente'],
            'investment': ['ahorro', 'inversion', 'bolsa', 'fondo'],
            'emergency': ['fondo emergencia', 'emergencia']
        };

        this.loadCustomCategories();
        this.initializeData();
    }

    /**
     * Carga categorías personalizadas desde localStorage
     */
    loadCustomCategories() {
        try {
            const customCats = localStorage.getItem(this.CATEGORIES_STORAGE_KEY);
            if (customCats) {
                const parsed = JSON.parse(customCats);
                this.CATEGORIES = [...this.DEFAULT_CATEGORIES, ...parsed];
            }
        } catch (error) {
            console.warn('Error loading custom categories:', error);
        }
    }

    /**
     * Agrega una nueva categoría personalizada
     */
    addCustomCategory(name, type = 'expense', color = null) {
        const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        if (!id) {
            return { success: false, message: 'Nombre de categoría inválido' };
        }

        // Valida que no exista ya
        if (this.CATEGORIES.find(c => c.id === id)) {
            return { success: false, message: 'Ya existe una categoría con este nombre' };
        }

        const normalized = {
            id,
            name,
            type: type || 'expense',
            color: color || this.generateRandomColor(),
            custom: true
        };

        this.CATEGORIES.push(normalized);
        this.saveCustomCategories();
        return { success: true, category: normalized };
    }

    /**
     * Guarda categorías personalizadas en localStorage
     */
    saveCustomCategories() {
        const customCats = this.CATEGORIES.filter(c => c.custom === true);
        localStorage.setItem(this.CATEGORIES_STORAGE_KEY, JSON.stringify(customCats));
    }

    /**
     * Genera un color aleatorio para nuevas categorías
     */
    generateRandomColor() {
        const colors = ['#206BFF', '#6BD6F1', '#BE52BE', '#A8E571', '#FF4421', '#FF6DB3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Elimina una categoría personalizada
     */
    deleteCustomCategory(id) {
        const category = this.CATEGORIES.find(c => c.id === id);
        if (!category || !category.custom) {
            return { success: false, message: 'No se puede eliminar categorías predeterminadas' };
        }

        this.CATEGORIES = this.CATEGORIES.filter(c => c.id !== id);
        this.saveCustomCategories();
        return { success: true };
    }

    /**
     * Obtiene todas las categorías personalizadas
     */
    getCustomCategories() {
        return this.CATEGORIES.filter(c => c.custom === true);
    }

    /**
     * Inicializa los datos en localStorage si no existen
     */
    initializeData() {
        if (!this.getData()) {
            const initialData = {
                movements: this.getExampleMovements(),
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            this.saveData(initialData);
        }
    }

    /**
     * Obtiene dados de ejemplo realistas para abril de 2026
     */
    getExampleMovements() {
        return [
            {
                id: this.generateUUID(),
                date: '2026-04-01',
                description: 'Nómina Abril',                observations: 'Pago mensual',                category: 'salary',
                type: 'income',
                amount: 2500,
                computable: true,
                createdAt: new Date('2026-04-01').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-02',
                description: 'Compra Mercadona - Alimentación',
                category: 'groceries',
                type: 'expense',
                amount: 85.42,
                computable: true,
                createdAt: new Date('2026-04-02').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-03',
                description: 'Adeudo Servicios - Agua y Electricidad',
                category: 'utilities',
                type: 'expense',
                amount: 125.50,
                computable: true,
                createdAt: new Date('2026-04-03').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-05',
                description: 'Gasolina - Repostaje',
                category: 'transport',
                type: 'expense',
                amount: 60.00,
                computable: true,
                createdAt: new Date('2026-04-05').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-05',
                description: 'Restaurante - Cena con amigos',
                category: 'dining',
                type: 'expense',
                amount: 45.80,
                computable: true,
                createdAt: new Date('2026-04-05').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-07',
                description: 'Bizum - María (cena)',
                category: 'dining',
                type: 'expense',
                amount: 15.00,
                computable: true,
                createdAt: new Date('2026-04-07').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-08',
                description: 'Compra Carrefour - Bebidas y snacks',
                category: 'groceries',
                type: 'expense',
                amount: 32.15,
                computable: false,
                createdAt: new Date('2026-04-08').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-10',
                description: 'Ahorro Mensual',
                category: 'investment',
                type: 'savings',
                amount: 300,
                computable: true,
                createdAt: new Date('2026-04-10').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-12',
                description: 'Netflix - Suscripción',
                category: 'entertainment',
                type: 'expense',
                amount: 15.99,
                computable: true,
                createdAt: new Date('2026-04-12').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-15',
                description: 'Farmacia - Medicinas',
                category: 'health',
                type: 'expense',
                amount: 23.60,
                computable: true,
                createdAt: new Date('2026-04-15').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-18',
                description: 'Compra LIDL - Alimentos',
                observations: 'Compra semanal de alimentos',
                category: 'groceries',
                type: 'expense',
                amount: 67.89,
                computable: true,
                createdAt: new Date('2026-04-18').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-20',
                description: 'Freelance - Proyecto Web',
                observations: 'Proyecto cliente XYZ',
                category: 'freelance',
                type: 'income',
                amount: 800,
                computable: true,
                createdAt: new Date('2026-04-20').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-22',
                description: 'Cine - Entrada 2 personas',
                observations: 'Película estrenos',
                category: 'entertainment',
                type: 'expense',
                amount: 28.00,
                computable: true,
                createdAt: new Date('2026-04-22').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-25',
                description: 'Compra Alcampo - Semanal',
                observations: 'Compra semanal completa',
                category: 'groceries',
                type: 'expense',
                amount: 94.30,
                computable: true,
                createdAt: new Date('2026-04-25').toISOString()
            },
            {
                id: this.generateUUID(),
                date: '2026-04-28',
                description: 'Fondo Emergencia - Transferencia',
                observations: 'Transferencia fondo emergencia',
                category: 'emergency',
                type: 'savings',
                amount: 200,
                computable: true,
                createdAt: new Date('2026-04-28').toISOString()
            }
        ];
    }

    /**
     * Genera un UUID único usando crypto.randomUUID
     */
    generateUUID() {
        return crypto.randomUUID();
    }

    /**
     * Normaliza los datos de un movimiento
     */
    normalizeMovement(movement) {
        return {
            id: movement.id || this.generateUUID(),
            date: movement.date,
            description: movement.description?.trim() || '',
            observations: movement.observations?.trim() || '',
            category: movement.category || 'other',
            type: movement.type || 'expense',
            amount: parseFloat(movement.amount) || 0,
            computable: movement.computable === true || movement.computable === 'true',
            createdAt: movement.createdAt || new Date().toISOString()
        };
    }

    /**
     * Obtiene todos los datos del localStorage
     */
    getData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return null;
        }
    }

    /**
     * Guarda datos en localStorage
     */
    saveData(data) {
        try {
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Obtiene todos los movimientos
     */
    getAllMovements() {
        const data = this.getData();
        return data?.movements || [];
    }

    /**
     * Añade un nuevo movimiento
     */
    addMovement(movement) {
        const normalized = this.normalizeMovement(movement);
        const data = this.getData();
        data.movements.push(normalized);
        this.saveData(data);
        return normalized;
    }

    /**
     * Actualiza un movimiento existente
     */
    updateMovement(id, updates) {
        const data = this.getData();
        const index = data.movements.findIndex(m => m.id === id);
        if (index !== -1) {
            // Normaliza y preserva el ID y createdAt original
            const normalized = this.normalizeMovement({ ...data.movements[index], ...updates });
            data.movements[index] = normalized;
            this.saveData(data);
            return data.movements[index];
        }
        return null;
    }

    /**
     * Obtiene un movimiento por ID
     */
    getMovementById(id) {
        return this.getAllMovements().find(m => m.id === id);
    }

    /**
     * Elimina un movimiento
     */
    deleteMovement(id) {
        const data = this.getData();
        data.movements = data.movements.filter(m => m.id !== id);
        this.saveData(data);
    }

    /**
     * Elimina varios movimientos por IDs
     */
    deleteMovements(ids) {
        const data = this.getData();
        data.movements = data.movements.filter(m => !ids.includes(m.id));
        this.saveData(data);
    }

    /**
     * Obtiene movimientos computables (para cálculos)
     */
    getComputableMovements() {
        return this.getAllMovements().filter(m => m.computable === true);
    }

    /**
     * Calcula el total de ingresos
     */
    getTotalIncome() {
        return this.getComputableMovements()
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + m.amount, 0);
    }

    /**
     * Calcula el total de gastos
     */
    getTotalExpense() {
        return this.getComputableMovements()
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);
    }

    /**
     * Calcula el total de ahorros
     */
    getTotalSavings() {
        return this.getComputableMovements()
            .filter(m => m.type === 'savings')
            .reduce((sum, m) => sum + m.amount, 0);
    }

    /**
     * Calcula el balance (ingresos - gastos)
     */
    getBalance() {
        return this.getTotalIncome() - this.getTotalExpense();
    }

    /**
     * Obtiene movimientos filtrados por rango de fechas
     */
    getMovementsByDateRange(startDate, endDate) {
        return this.getComputableMovements().filter(m => {
            const movDate = new Date(m.date);
            const start = startDate ? new Date(startDate) : new Date('1900-01-01');
            const end = endDate ? new Date(endDate) : new Date('2099-12-31');
            return movDate >= start && movDate <= end;
        });
    }

    /**
     * Obtiene el breakdown de gastos por categoría
     */
    getExpensesByCategory(startDate = null, endDate = null) {
        const expenses = {};
        const movements = startDate || endDate ? this.getMovementsByDateRange(startDate, endDate) : this.getComputableMovements();
        movements
            .filter(m => m.type === 'expense')
            .forEach(m => {
                expenses[m.category] = (expenses[m.category] || 0) + m.amount;
            });
        return expenses;
    }

    /**
     * Obtiene el breakdown de ingresos por categoría
     */
    getIncomeByCategory(startDate = null, endDate = null) {
        const income = {};
        const movements = startDate || endDate ? this.getMovementsByDateRange(startDate, endDate) : this.getComputableMovements();
        movements
            .filter(m => m.type === 'income')
            .forEach(m => {
                income[m.category] = (income[m.category] || 0) + m.amount;
            });
        return income;
    }

    /**
     * Detecta automáticamente la categoría basándose en la descripción
     */
    detectCategory(description) {
        const lowerDesc = description.toLowerCase();
        
        for (const [categoryId, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
            for (const keyword of keywords) {
                if (lowerDesc.includes(keyword)) {
                    return categoryId;
                }
            }
        }
        
        return 'other';
    }

    /**
     * Limpia descripciones bancarias (quita referencias innecesarias)
     */
    cleanBankDescription(description) {
        // Quita referencias de tipo "REF:", "TRX:", "ID:" al principio
        let cleaned = description.replace(/^(REF|TRX|ID|REFERENCIA|TRANSACCION):\s*/i, '');
        
        // Quita códigos IBAN/SWIFT al final
        cleaned = cleaned.replace(/\s(IBAN|SWIFT|BIC):[A-Z0-9]{10,}/i, '');
        
        // Quita espacios múltiples
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        return cleaned;
    }

    /**
     * Exporta todos los datos como JSON
     */
    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    }

    /**
     * Importa datos desde JSON
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.movements && Array.isArray(data.movements)) {
                // Normaliza todos los movimientos
                data.movements = data.movements.map(m => this.normalizeMovement(m));
                this.saveData(data);
                return { success: true, message: `Se importaron ${data.movements.length} movimientos` };
            }
            return { success: false, message: 'Formato JSON inválido' };
        } catch (error) {
            return { success: false, message: `Error al parsear JSON: ${error.message}` };
        }
    }

    /**
     * Limpia todos los datos
     */
    clearAllData() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.initializeData();
    }

    /**
     * Obtiene categorías por tipo
     */
    getCategoriesByType(type) {
        return this.CATEGORIES.filter(c => c.type === type);
    }

    /**
     * Obtiene todas las categorías
     */
    getAllCategories() {
        return this.CATEGORIES;
    }

    /**
     * Obtiene una categoría por ID
     */
    getCategoryById(id) {
        return this.CATEGORIES.find(c => c.id === id);
    }

    /**
     * Filtra movimientos por criterios
     */
    filterMovements(filters = {}) {
        let movements = this.getAllMovements();

        if (filters.startDate) {
            movements = movements.filter(m => m.date >= filters.startDate);
        }

        if (filters.endDate) {
            movements = movements.filter(m => m.date <= filters.endDate);
        }

        if (filters.category) {
            movements = movements.filter(m => m.category === filters.category);
        }

        if (filters.type) {
            movements = movements.filter(m => m.type === filters.type);
        }

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            movements = movements.filter(m => 
                m.description.toLowerCase().includes(term)
            );
        }

        return movements;
    }

    /* ================================
       PRESUPUESTOS (BUDGETS)
       ================================ */
    
    /**
     * Obtiene todos los presupuestos del localStorage
     */
    getBudgets() {
        try {
            const budgets = localStorage.getItem('controlGastosBudgets');
            return budgets ? JSON.parse(budgets) : {};
        } catch (error) {
            console.warn('Error loading budgets:', error);
            return {};
        }
    }

    /**
     * Guarda presupuestos en localStorage
     */
    saveBudgets(budgets) {
        localStorage.setItem('controlGastosBudgets', JSON.stringify(budgets));
    }

    /**
     * Actualiza o crea un presupuesto para una categoría
     */
    updateBudget(categoryId, amount) {
        const budgets = this.getBudgets();
        budgets[categoryId] = parseFloat(amount) || 0;
        this.saveBudgets(budgets);
        return budgets[categoryId];
    }

    /**
     * Obtiene el presupuesto de una categoría
     */
    getBudgetForCategory(categoryId) {
        const budgets = this.getBudgets();
        return budgets[categoryId] || 0;
    }

    /**
     * Calcula el estado del presupuesto para una categoría (mes actual)
     */
    getBudgetStatus(categoryId, startDate = null, endDate = null) {
        // Si no proporciona fechas, usa mes actual
        if (!startDate || !endDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            startDate = `${year}-${month}-01`;
            
            const nextMonth = parseInt(month) === 12 ? '01' : String(parseInt(month) + 1).padStart(2, '0');
            const nextYear = parseInt(month) === 12 ? String(parseInt(year) + 1) : year;
            const lastDay = new Date(parseInt(nextYear), parseInt(nextMonth) - 1, 0).getDate();
            endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
        }

        const budget = this.getBudgetForCategory(categoryId);
        const spent = this.getMovementsByDateRange(startDate, endDate)
            .filter(m => m.type === 'expense' && m.category === categoryId && m.computable)
            .reduce((sum, m) => sum + m.amount, 0);

        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        const remaining = budget - spent;
        const exceeded = spent > budget;

        return {
            categoryId,
            budget,
            spent,
            remaining,
            percentage: Math.min(percentage, 100),
            exceeded,
            warning: percentage > 80 && percentage <= 100,
            critical: percentage > 100
        };
    }

    /**
     * Obtiene todos los presupuestos con sus estados para el mes actual
     */
    getAllBudgetStatus() {
        const budgets = this.getBudgets();
        const statuses = {};

        Object.keys(budgets).forEach(categoryId => {
            statuses[categoryId] = this.getBudgetStatus(categoryId);
        });

        return statuses;
    }

    /**
     * Obtiene alertas por presupuestos excedidos
     */
    getBudgetAlerts() {
        const alerts = [];
        const statuses = this.getAllBudgetStatus();

        Object.values(statuses).forEach(status => {
            if (status.warning || status.exceeded) {
                const category = this.getCategoryById(status.categoryId);
                alerts.push({
                    categoryId: status.categoryId,
                    categoryName: category?.name || 'Desconocida',
                    type: status.exceeded ? 'danger' : 'warning',
                    message: status.exceeded 
                        ? `${category?.name} ha excedido su presupuesto: €${status.spent.toFixed(2)} de €${status.budget.toFixed(2)}`
                        : `${category?.name} está al ${status.percentage.toFixed(0)}% de su presupuesto: €${status.spent.toFixed(2)} de €${status.budget.toFixed(2)}`
                });
            }
        });

        return alerts;
    }

    /* ================================
       ANÁLISIS COMPARATIVO Y TENDENCIAS
       ================================ */

    /**
     * Obtiene gastos agrupados por mes para el último año
     */
    getMonthlyExpenses(months = 12) {
        const monthlyData = {};
        const today = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`;

            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            const startDate = `${year}-${month}-01`;
            const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

            const expenses = this.getMovementsByDateRange(startDate, endDate)
                .filter(m => m.type === 'expense')
                .reduce((sum, m) => sum + m.amount, 0);

            monthlyData[monthKey] = expenses;
        }

        return monthlyData;
    }

    /**
     * Obtiene ingresos agrupados por mes para el último año
     */
    getMonthlyIncome(months = 12) {
        const monthlyData = {};
        const today = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`;

            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            const startDate = `${year}-${month}-01`;
            const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

            const income = this.getMovementsByDateRange(startDate, endDate)
                .filter(m => m.type === 'income')
                .reduce((sum, m) => sum + m.amount, 0);

            monthlyData[monthKey] = income;
        }

        return monthlyData;
    }

    /**
     * Obtiene gastos del mes anterior
     */
    getPreviousMonthExpenses() {
        const today = new Date();
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const year = prevMonth.getFullYear();
        const month = String(prevMonth.getMonth() + 1).padStart(2, '0');

        const lastDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        return this.getMovementsByDateRange(startDate, endDate)
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);
    }

    /**
     * Obtiene gastos del mes actual
     */
    getCurrentMonthExpenses() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-${day}`;

        return this.getMovementsByDateRange(startDate, endDate)
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);
    }

    /**
     * Calcula la tendencia de gastos (mes anterior vs mes actual)
     */
    expenseTrend() {
        const current = this.getCurrentMonthExpenses();
        const previous = this.getPreviousMonthExpenses();
        const difference = current - previous;
        const percentChange = previous > 0 ? (difference / previous) * 100 : 0;

        return {
            currentMonth: current,
            previousMonth: previous,
            difference: difference,
            percentChange: percentChange,
            trend: difference > 0 ? 'UP' : difference < 0 ? 'DOWN' : 'STABLE'
        };
    }

    /**
     * Obtiene las tendencias por categoría
     */
    getCategoryTrends() {
        const trends = {};

        this.CATEGORIES
            .filter(c => c.type === 'expense')
            .forEach(category => {
                const currentExpenses = this.getMovementsByDateRange(
                    new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-01'
                ).filter(m => m.category === category.id && m.type === 'expense')
                    .reduce((sum, m) => sum + m.amount, 0);

                const prevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
                const previousExpenses = this.getMovementsByDateRange(
                    prevMonth.getFullYear() + '-' + String(prevMonth.getMonth() + 1).padStart(2, '0') + '-01'
                ).filter(m => m.category === category.id && m.type === 'expense')
                    .reduce((sum, m) => sum + m.amount, 0);

                const difference = currentExpenses - previousExpenses;
                const percentChange = previousExpenses > 0 ? (difference / previousExpenses) * 100 : 0;

                trends[category.id] = {
                    name: category.name,
                    current: currentExpenses,
                    previous: previousExpenses,
                    difference: difference,
                    percentChange: percentChange,
                    trend: difference > 0 ? 'UP' : difference < 0 ? 'DOWN' : 'STABLE'
                };
            });

        return trends;
    }

    /* ================================
       MOVIMIENTOS RECURRENTES
       ================================ */

    /**
     * Obtiene todos los movimientos recurrentes
     */
    getRecurringMovements() {
        try {
            const recurring = localStorage.getItem('controlGastosRecurring');
            return recurring ? JSON.parse(recurring) : [];
        } catch (error) {
            console.warn('Error loading recurring movements:', error);
            return [];
        }
    }

    /**
     * Guarda movimientos recurrentes
     */
    saveRecurringMovements(recurring) {
        localStorage.setItem('controlGastosRecurring', JSON.stringify(recurring));
    }

    /**
     * Agrega un nuevo movimiento recurrente
     */
    addRecurringMovement(movement) {
        const recurring = this.getRecurringMovements();
        const newRecurring = {
            id: this.generateUUID(),
            description: movement.description,
            category: movement.category,
            type: movement.type,
            amount: parseFloat(movement.amount),
            frequency: movement.frequency, // 'daily', 'weekly', 'monthly', 'yearly'
            dayOfMonth: movement.dayOfMonth || null,
            startDate: movement.startDate || new Date().toISOString().split('T')[0],
            endDate: movement.endDate || null,
            enabled: true,
            lastApplied: null,
            createdAt: new Date().toISOString()
        };
        recurring.push(newRecurring);
        this.saveRecurringMovements(recurring);
        return newRecurring;
    }

    /**
     * Actualiza un movimiento recurrente
     */
    updateRecurringMovement(id, updates) {
        const recurring = this.getRecurringMovements();
        const index = recurring.findIndex(r => r.id === id);
        if (index !== -1) {
            recurring[index] = { ...recurring[index], ...updates };
            this.saveRecurringMovements(recurring);
            return recurring[index];
        }
        return null;
    }

    /**
     * Elimina un movimiento recurrente
     */
    deleteRecurringMovement(id) {
        const recurring = this.getRecurringMovements();
        this.saveRecurringMovements(recurring.filter(r => r.id !== id));
    }

    /**
     * Aplica los movimientos recurrentes pendientes
     */
    applyRecurringMovements() {
        const recurring = this.getRecurringMovements();
        const today = new Date().toISOString().split('T')[0];
        const appliedMovements = [];

        recurring.forEach(recur => {
            if (!recur.enabled) return;

            const lastApplied = recur.lastApplied ? new Date(recur.lastApplied) : new Date('1900-01-01');
            const startDate = new Date(recur.startDate);
            const endDate = recur.endDate ? new Date(recur.endDate) : new Date('2099-12-31');
            const todayDate = new Date();

            // Valida que esté dentro del rango de fechas
            if (todayDate < startDate || todayDate > endDate) return;

            let shouldApply = false;
            let nextApplyDate = null;

            switch (recur.frequency) {
                case 'daily':
                    shouldApply = lastApplied.toDateString() !== todayDate.toDateString();
                    nextApplyDate = new Date(todayDate);
                    nextApplyDate.setDate(nextApplyDate.getDate() + 1);
                    break;

                case 'weekly':
                    const daysDiff = Math.floor((todayDate - lastApplied) / (1000 * 60 * 60 * 24));
                    shouldApply = daysDiff >= 7;
                    nextApplyDate = new Date(lastApplied);
                    nextApplyDate.setDate(nextApplyDate.getDate() + 7);
                    break;

                case 'monthly':
                    const dayOfMonth = recur.dayOfMonth || startDate.getDate();
                    shouldApply = todayDate.getDate() === dayOfMonth && 
                                 (lastApplied.getMonth() !== todayDate.getMonth() ||
                                  lastApplied.getFullYear() !== todayDate.getFullYear());
                    nextApplyDate = new Date(todayDate);
                    nextApplyDate.setMonth(nextApplyDate.getMonth() + 1);
                    nextApplyDate.setDate(dayOfMonth);
                    break;

                case 'yearly':
                    const month = startDate.getMonth();
                    const day = startDate.getDate();
                    shouldApply = todayDate.getMonth() === month && 
                                 todayDate.getDate() === day && 
                                 lastApplied.getFullYear() !== todayDate.getFullYear();
                    nextApplyDate = new Date(todayDate);
                    nextApplyDate.setFullYear(nextApplyDate.getFullYear() + 1);
                    break;
            }

            if (shouldApply) {
                // Crea el movimiento
                const movement = {
                    date: today,
                    description: recur.description + ' (Recurrente)',
                    category: recur.category,
                    type: recur.type,
                    amount: recur.amount,
                    computable: true,
                    observations: `Movimiento automático recurrente (ID: ${recur.id})`
                };

                this.addMovement(movement);
                appliedMovements.push(recur.id);

                // Actualiza la fecha de aplicación
                this.updateRecurringMovement(recur.id, { lastApplied: new Date().toISOString() });
            }
        });

        return appliedMovements;
    }

    /**
     * Obtiene próximas aplicaciones de movimientos recurrentes
     */
    getUpcomingRecurringMovements(days = 30) {
        const recurring = this.getRecurringMovements();
        const upcoming = [];
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + days);

        recurring.forEach(recur => {
            if (!recur.enabled) return;

            const endDate = recur.endDate ? new Date(recur.endDate) : new Date('2099-12-31');
            if (today > endDate) return;

            // Calcula la próxima fecha de aplicación
            const lastApplied = recur.lastApplied ? new Date(recur.lastApplied) : new Date(recur.startDate);
            let nextApplyDate = new Date(lastApplied);

            switch (recur.frequency) {
                case 'daily':
                    nextApplyDate.setDate(nextApplyDate.getDate() + 1);
                    break;
                case 'weekly':
                    nextApplyDate.setDate(nextApplyDate.getDate() + 7);
                    break;
                case 'monthly':
                    const dayOfMonth = recur.dayOfMonth || new Date(recur.startDate).getDate();
                    nextApplyDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
                    if (nextApplyDate <= today) {
                        nextApplyDate.setMonth(nextApplyDate.getMonth() + 1);
                    }
                    break;
                case 'yearly':
                    const startDateObj = new Date(recur.startDate);
                    nextApplyDate = new Date(today.getFullYear(), startDateObj.getMonth(), startDateObj.getDate());
                    if (nextApplyDate <= today) {
                        nextApplyDate.setFullYear(nextApplyDate.getFullYear() + 1);
                    }
                    break;
            }

            if (nextApplyDate <= futureDate) {
                const category = this.getCategoryById(recur.category);
                upcoming.push({
                    ...recur,
                    nextApplyDate: nextApplyDate.toISOString().split('T')[0],
                    categoryName: category?.name || 'Desconocida'
                });
            }
        });

        return upcoming.sort((a, b) => new Date(a.nextApplyDate) - new Date(b.nextApplyDate));
    }
}

// Instancia global del DataManager
const dataManager = new DataManager();
