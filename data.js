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
}

// Instancia global del DataManager
const dataManager = new DataManager();
