/**
 * APP.JS - Controlador Principal SPA
 * Gestiona navegación, renderizado de tablas, formularios y lógica principal
 */

class App {
    constructor() {
        this.currentSection = 'dashboard';
        this.selectedMovements = new Set();
        this.editingMovementId = null; // Track if editing an existing movement
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.populateCategorySelects();
        this.populateYearFilter();
        this.renderDashboard();
        this.registerServiceWorker();
    }

    /**
     * Registra el Service Worker para PWA
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        }
    }

    /**
     * Configura los event listeners principales
     */
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.navigateToSection(e.target.closest('.nav-item').dataset.section));
        });

        // Tema
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('sidebar-toggle').addEventListener('click', () => this.toggleSidebar());

        // Formulario de movimiento
        document.getElementById('movement-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('form-type').addEventListener('change', () => this.updateSplitContainerVisibility());
        document.getElementById('enable-split').addEventListener('change', () => this.updateSplitDetails());
        document.getElementById('form-split-amount').addEventListener('input', () => this.calculateSplitAmount());
        document.getElementById('form-split-people').addEventListener('input', () => this.calculateSplitAmount());
        document.getElementById('split-your-part-computable').addEventListener('change', () => {
            // Evento para cuando cambia el checkbox de computable en split
            console.log('Estado computable de split actualizado');
        });

        // Botón cancelar edición
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.cancelEditMovement());

        // Tabla de movimientos
        document.getElementById('select-all-expenses').addEventListener('change', (e) => this.selectAllMovements(e.target.checked, 'movements-tbody-expenses'));
        document.getElementById('select-all-income').addEventListener('change', (e) => this.selectAllMovements(e.target.checked, 'movements-tbody-income'));
        document.getElementById('delete-selected-btn').addEventListener('click', () => this.deleteSelectedMovements());
        document.getElementById('search-input').addEventListener('input', () => this.renderMovementsTable());
        document.getElementById('category-filter').addEventListener('change', () => this.renderMovementsTable());
        document.getElementById('movements-sort-by').addEventListener('change', () => this.renderMovementsTable());

        // Filtro de fechas en dashboard
        document.getElementById('dashboard-filter-btn').addEventListener('click', () => this.applyDashboardFilter());
        document.getElementById('dashboard-clear-filter-btn').addEventListener('click', () => this.clearDashboardFilter());
        
        // Filtros rápidos de año y mes
        document.getElementById('dashboard-year-filter').addEventListener('change', () => this.applyDashboardFilter());
        document.getElementById('dashboard-month-filter').addEventListener('change', () => this.applyDashboardFilter());

        // Ordenamiento en dashboard
        document.getElementById('recent-sort-by').addEventListener('change', () => this.renderRecentMovements());

        // Botón de borrar todos (agregar evento)
        const deleteAllBtn = document.getElementById('delete-all-movements-btn');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', () => this.deleteAllMovements());
        }

        // Ajustes
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-json-btn').addEventListener('click', () => document.getElementById('import-json-input').click());
        document.getElementById('import-json-input').addEventListener('change', (e) => this.handleJSONImport(e));
        document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAllData());

        // Categorías personalizadas
        document.getElementById('add-category-btn').addEventListener('click', () => this.addNewCategory());
        document.getElementById('new-category-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNewCategory();
        });

        // Establecer fecha actual por defecto en el formulario
        this.setDefaultDate();
    }

    /**
     * Establece la fecha actual como valor por defecto en el input
     */
    setDefaultDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        document.getElementById('form-date').value = dateString;
    }

    /**
     * Cambia entre temas (Light/Dark)
     */
    toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark-theme');
        
        if (isDark) {
            html.classList.remove('dark-theme');
            html.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            document.querySelector('.theme-icon').textContent = '🌙';
        } else {
            html.classList.add('dark-theme');
            html.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            document.querySelector('.theme-icon').textContent = '☀️';
        }
    }

    /**
     * Configura el tema guardado o preferencia del sistema
     */
    setupTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

        if (isDark) {
            document.documentElement.classList.add('dark-theme');
            document.querySelector('.theme-icon').textContent = '☀️';
        } else {
            document.documentElement.classList.add('light-theme');
            document.querySelector('.theme-icon').textContent = '🌙';
        }
    }

    /**
     * Alterna el sidebar en mobile
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('expanded');
    }

    /**
     * Recarga categorías cuando se navega al formulario
     */
    ensureCategoriesLoaded() {
        const formCategory = document.getElementById('form-category');
        if (formCategory.options.length <= 1) {
            this.populateCategorySelects();
        }
    }

    /**
     * Navega a una sección
     */
    navigateToSection(section) {
        // Actualiza navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });

        // Oculta todas las secciones
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        // Muestra la sección seleccionada
        document.getElementById(section).classList.add('active');
        this.currentSection = section;

        // Cierra sidebar en mobile
        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.remove('expanded');
        }

        // Ejecutar acciones específicas de la sección
        if (section === 'dashboard') {
            this.renderDashboard();
        } else if (section === 'movements') {
            this.renderMovementsTable();
        } else if (section === 'add-movement') {
            // Asegurar que las categorías estén cargadas al abrir el formulario
            this.populateCategorySelects();
            this.setDefaultDate();
        } else if (section === 'settings') {
            this.renderCustomCategories();
        }
    }

    /**
     * Rellena los selects de categorías
     */
    populateCategorySelects() {
        const categories = dataManager.getAllCategories();
        
        // Para el formulario
        const formCategory = document.getElementById('form-category');
        formCategory.innerHTML = '<option value="">Selecciona una categoría</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            formCategory.appendChild(option);
        });

        // Para el filtro
        const filterCategory = document.getElementById('category-filter');
        filterCategory.innerHTML = '<option value="">Todas las categorías</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            filterCategory.appendChild(option);
        });
    }

    /**
     * Llena el selector de años del dashboard con años disponibles
     */
    populateYearFilter() {
        const movements = dataManager.getAllMovements();
        const years = new Set();
        
        // Extraer años únicos de los movimientos
        movements.forEach(movement => {
            const year = movement.date.substring(0, 4);
            years.add(year);
        });

        // Agregar año actual si no está
        const currentYear = new Date().getFullYear().toString();
        years.add(currentYear);

        // Ordenar años descendentemente
        const sortedYears = Array.from(years).sort().reverse();

        // Llenar el selector
        const yearFilter = document.getElementById('dashboard-year-filter');
        yearFilter.innerHTML = '<option value="">Todos</option>';
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    /**
     * Actualiza la visibilidad del contenedor de split
     */
    updateSplitContainerVisibility() {
        const type = document.getElementById('form-type').value;
        const splitContainer = document.getElementById('split-container');
        splitContainer.style.display = type === 'expense' ? 'block' : 'none';
    }

    /**
     * Actualiza los detalles del split
     */
    updateSplitDetails() {
        const isSplit = document.getElementById('enable-split').checked;
        document.getElementById('split-details').style.display = isSplit ? 'block' : 'none';
        if (isSplit) {
            this.calculateSplitAmount();
        }
    }

    /**
     * Calcula la cantidad a dividir
     */
    calculateSplitAmount() {
        const amount = parseFloat(document.getElementById('form-split-amount').value) || 0;
        const people = parseInt(document.getElementById('form-split-people').value) || 2;
        const yourPart = (amount / people).toFixed(2);
        document.getElementById('split-your-part').textContent = `€${yourPart}`;
    }

    /**
     * Maneja el envío del formulario
     */
    handleFormSubmit(e) {
        e.preventDefault();

        const isSplit = document.getElementById('enable-split').checked;
        const splitAmount = isSplit ? parseFloat(document.getElementById('form-split-amount').value) || 0 : 0;
        const finalAmount = isSplit && splitAmount > 0 
            ? splitAmount / parseInt(document.getElementById('form-split-people').value)
            : parseFloat(document.getElementById('form-amount').value);

        const movement = {
            date: document.getElementById('form-date').value,
            description: document.getElementById('form-description').value,
            observations: document.getElementById('form-observations').value,
            category: document.getElementById('form-category').value,
            type: document.getElementById('form-type').value,
            amount: finalAmount,
            computable: isSplit 
                ? document.getElementById('split-your-part-computable').checked
                : document.getElementById('form-computable').checked
        };

        if (this.editingMovementId) {
            // Modo edición: actualizar movimiento existente
            dataManager.updateMovement(this.editingMovementId, movement);
            this.showNotification('✅ Movimiento actualizado correctamente', 'success');
            this.editingMovementId = null;
        } else {
            // Modo crear: agregar nuevo movimiento
            if (dataManager.addMovement(movement)) {
                this.showNotification('✅ Movimiento guardado correctamente', 'success');
            }
        }

        document.getElementById('movement-form').reset();
        this.setDefaultDate();
        
        // Restaura el botón submit
        const submitBtn = document.querySelector('#movement-form button[type="submit"]');
        submitBtn.textContent = 'Guardar Movimiento';
        submitBtn.style.backgroundColor = '';
        
        document.getElementById('cancel-edit-btn').style.display = 'none';
        
        this.updateSplitContainerVisibility();
        this.renderDashboard();
        this.renderMovementsTable();
    }

    /**
     * Renderiza el dashboard con gráficos y resumen
     */
    renderDashboard() {
        // Obtiene fechas del filtro si existen
        const startDate = document.getElementById('dashboard-start-date')?.value || null;
        const endDate = document.getElementById('dashboard-end-date')?.value || null;

        // Actualiza tarjetas de resumen (usa filtro si está activo)
        const movements = startDate || endDate 
            ? dataManager.getMovementsByDateRange(startDate, endDate)
            : dataManager.getComputableMovements();

        const totalIncome = movements.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
        const totalExpense = movements.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
        const totalSavings = movements.filter(m => m.type === 'savings').reduce((sum, m) => sum + m.amount, 0);

        document.getElementById('total-income').textContent = `€${totalIncome.toFixed(2)}`;
        document.getElementById('total-expense').textContent = `€${totalExpense.toFixed(2)}`;
        document.getElementById('total-savings').textContent = `€${totalSavings.toFixed(2)}`;
        document.getElementById('total-balance').textContent = `€${(totalIncome - totalExpense).toFixed(2)}`;

        // Actualiza último movimiento
        document.getElementById('last-update').textContent = new Date(
            dataManager.getData().lastUpdated
        ).toLocaleDateString();

        // Renderiza movimientos recientes
        this.renderRecentMovements();

        // Renderiza gráficos con rango de fechas
        initCharts(startDate, endDate);
    }

    /**
     * Renderiza los movimientos recientes
     */
    renderRecentMovements() {
        const movements = dataManager.getAllMovements();
        const sortBy = document.getElementById('recent-sort-by')?.value || 'date-desc';

        // Aplicar el ordenamiento según la selección
        if (sortBy === 'date-desc') {
            movements.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortBy === 'date-asc') {
            movements.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortBy === 'amount-desc') {
            movements.sort((a, b) => b.amount - a.amount);
        } else if (sortBy === 'amount-asc') {
            movements.sort((a, b) => a.amount - b.amount);
        } else if (sortBy === 'category') {
            movements.sort((a, b) => {
                const catA = dataManager.getCategoryById(a.category)?.name || a.category;
                const catB = dataManager.getCategoryById(b.category)?.name || b.category;
                return catA.localeCompare(catB);
            });
        }

        // Tomar solo los 5 primeros
        const recentMovements = movements.slice(0, 5);

        const recentList = document.getElementById('recent-list');
        recentList.innerHTML = '';

        if (recentMovements.length === 0) {
            recentList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-lg);">No hay movimientos registrados</p>';
            return;
        }

        recentMovements.forEach(movement => {
            const category = dataManager.getCategoryById(movement.category);
            const item = document.createElement('div');
            item.className = 'movement-item';
            item.innerHTML = `
                <div class="movement-info">
                    <div class="movement-description">${movement.description}</div>
                    <div class="movement-meta">
                        <span>${movement.date}</span>
                        <span>${category?.name || movement.category}</span>
                        ${movement.computable ? '' : '<span style="color: var(--text-secondary);">⚠️ No computable</span>'}
                    </div>
                </div>
                <div class="movement-amount ${movement.type}">
                    ${movement.type === 'income' ? '+' : '-'}€${movement.amount.toFixed(2)}
                </div>
            `;
            recentList.appendChild(item);
        });
    }

    /**
     * Aplica el filtro de fechas en el dashboard
     */
    applyDashboardFilter() {
        const year = document.getElementById('dashboard-year-filter').value;
        const month = document.getElementById('dashboard-month-filter').value;
        const startDate = document.getElementById('dashboard-start-date').value;
        const endDate = document.getElementById('dashboard-end-date').value;

        // Si se seleccionó año/mes, calcular fechas
        if (year) {
            if (month) {
                // Año y mes específicos
                document.getElementById('dashboard-start-date').value = `${year}-${month}-01`;
                const nextMonth = parseInt(month) === 12 ? '01' : String(parseInt(month) + 1).padStart(2, '0');
                const nextYear = parseInt(month) === 12 ? String(parseInt(year) + 1) : year;
                const lastDay = new Date(parseInt(nextYear), parseInt(nextMonth) - 1, 0).getDate();
                document.getElementById('dashboard-end-date').value = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
            } else {
                // Solo año
                document.getElementById('dashboard-start-date').value = `${year}-01-01`;
                document.getElementById('dashboard-end-date').value = `${year}-12-31`;
            }
        }
        
        this.renderDashboard();
    }

    /**
     * Limpia el filtro de fechas en el dashboard
     */
    clearDashboardFilter() {
        document.getElementById('dashboard-start-date').value = '';
        document.getElementById('dashboard-end-date').value = '';
        document.getElementById('dashboard-year-filter').value = '';
        document.getElementById('dashboard-month-filter').value = '';
        this.renderDashboard();
    }

    /**
     * Renderiza la tabla de movimientos
     */
    renderMovementsTable() {
        const searchTerm = document.getElementById('search-input').value;
        const category = document.getElementById('category-filter').value;

        const filters = {
            searchTerm,
            category: category || null
        };

        let movements = dataManager.filterMovements(filters);
        movements.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Separa ingresos y gastos
        const expenses = movements.filter(m => m.type === 'expense');
        const incomes = movements.filter(m => m.type === 'income');

        // Calcula totales
        const totalExpenses = expenses.reduce((sum, m) => sum + m.amount, 0);
        const totalIncomes = incomes.reduce((sum, m) => sum + m.amount, 0);
        const totalFiltered = totalExpenses + totalIncomes;
        document.getElementById('filtered-total').textContent = `€${totalFiltered.toFixed(2)}`;

        // Renderiza tabla de gastos
        this.renderMovementsTableByType(expenses, 'expense', totalExpenses);
        
        // Renderiza tabla de ingresos
        this.renderMovementsTableByType(incomes, 'income', totalIncomes);
    }

    /**
     * Renderiza una tabla de movimientos por tipo
     */
    renderMovementsTableByType(movements, type, total) {
        const typeLabel = type === 'expense' ? 'GASTOS' : 'INGRESOS';
        const tbodyId = type === 'expense' ? 'movements-tbody-expenses' : 'movements-tbody-income';
        const tbody = document.getElementById(tbodyId);
        
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (movements.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: var(--spacing-lg); color: var(--text-secondary);">No hay ${type === 'expense' ? 'gastos' : 'ingresos'} que coincidan</td></tr>`;
            return;
        }

        movements.forEach(movement => {
            const category = dataManager.getCategoryById(movement.category);
            const row = document.createElement('tr');
            row.className = movement.computable ? '' : 'excluded';
            row.dataset.movementId = movement.id;

            row.innerHTML = `
                <td><input type="checkbox" class="item-checkbox" data-id="${movement.id}"></td>
                <td>${movement.date}</td>
                <td>${movement.description}</td>
                <td style="font-size: var(--font-size-sm); color: var(--text-secondary);">${movement.observations || '—'}</td>
                <td><span class="badge">${category?.name || movement.category}</span></td>
                <td class="movement-amount ${movement.type}">
                    €${movement.amount.toFixed(2)}
                </td>
                <td><span class="badge ${movement.computable ? 'computable' : 'not-computable'}">
                    ${movement.computable ? '✓ Sí' : '✗ No'}
                </span></td>
                <td>
                    <button class="btn btn-sm" onclick="app.editMovement('${movement.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteMovement('${movement.id}')">Eliminar</button>
                </td>
            `;

            // Checkbox de selección
            row.querySelector('.item-checkbox').addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedMovements.add(movement.id);
                } else {
                    this.selectedMovements.delete(movement.id);
                }
                this.updateDeleteButton();
            });

            tbody.appendChild(row);
        });
        
        // Agrega fila de total
        const totalRow = document.createElement('tr');
        totalRow.style.backgroundColor = 'var(--bg-secondary)';
        totalRow.style.fontWeight = 'bold';
        totalRow.innerHTML = `
            <td colspan="5" style="text-align: right; padding: var(--spacing-md);">TOTAL ${typeLabel}:</td>
            <td colspan="3" style="padding: var(--spacing-md);">€${total.toFixed(2)}</td>
        `;
        tbody.appendChild(totalRow);
    }

    /**
     * Actualiza la visibilidad del botón de eliminar
     */
    updateDeleteButton() {
        const btn = document.getElementById('delete-selected-btn');
        if (this.selectedMovements.size > 0) {
            btn.style.display = 'inline-block';
        } else {
            btn.style.display = 'none';
        }
    }

    /**
     * Selecciona/deselecciona todos los movimientos
     */
    selectAllMovements(checked, tbodyId) {
        // Si no se especifica tbody, seleccionar todos
        if (!tbodyId) {
            document.querySelectorAll('.item-checkbox').forEach(checkbox => {
                checkbox.checked = checked;
                if (checked) {
                    this.selectedMovements.add(checkbox.dataset.id);
                } else {
                    this.selectedMovements.delete(checkbox.dataset.id);
                }
            });
        } else {
            // Seleccionar solo los de la tabla especificada
            const tbody = document.getElementById(tbodyId);
            if (tbody) {
                tbody.querySelectorAll('.item-checkbox').forEach(checkbox => {
                    checkbox.checked = checked;
                    if (checked) {
                        this.selectedMovements.add(checkbox.dataset.id);
                    } else {
                        this.selectedMovements.delete(checkbox.dataset.id);
                    }
                });
            }
        }
        this.updateDeleteButton();
    }

    /**
     * Elimina los movimientos seleccionados
     */
    deleteSelectedMovements() {
        if (this.selectedMovements.size === 0) return;

        if (confirm(`¿Eliminar ${this.selectedMovements.size} movimiento(s)?`)) {
            dataManager.deleteMovements(Array.from(this.selectedMovements));
            this.selectedMovements.clear();
            this.renderMovementsTable();
            this.renderDashboard();
            this.showNotification('✅ Movimientos eliminados', 'success');
        }
    }

    /**
     * Edita un movimiento (placeholder para expansión futura)
     */
    /**
     * Convierte tipo de movimiento a texto en español
     */
    getTypeLabel(type) {
        const types = {
            'income': 'Ingreso',
            'expense': 'Gasto',
            'savings': 'Ahorro'
        };
        return types[type] || type;
    }

    /**
     * Carga un movimiento existente en el formulario para editar
     */
    editMovement(id) {
        const movement = dataManager.getMovementById(id);
        if (!movement) {
            this.showNotification('❌ No se pudo encontrar el movimiento', 'error');
            return;
        }

        try {
            // Navega a la sección de edición
            this.navigateToSection('add-movement');
    
            // Marca que estamos editando
            this.editingMovementId = id;
    
            // Pequeña espera para asegurar que el DOM está listo
            setTimeout(() => {
                try {
                    // Carga los datos en el formulario
                    document.getElementById('form-date').value = movement.date;
                    document.getElementById('form-description').value = movement.description;
                    document.getElementById('form-observations').value = movement.observations || '';
                    
                    // Asegurar que la categoría existe en el select
                    const categorySelect = document.getElementById('form-category');
                    const categoryExists = Array.from(categorySelect.options).some(opt => opt.value === movement.category);
                    if (!categoryExists) {
                        this.populateCategorySelects();
                    }
                    categorySelect.value = movement.category;
                    
                    document.getElementById('form-type').value = movement.type;
                    document.getElementById('form-amount').value = movement.amount;
                    document.getElementById('form-computable').checked = movement.computable;
            
                    // Actualiza el submit button
                    const submitBtn = document.querySelector('#movement-form button[type="submit"]');
                    submitBtn.textContent = '✏️ Actualizar Movimiento';
                    submitBtn.style.backgroundColor = '#FF6DB3';
                    
                    // Muestra el botón de cancelar
                    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
            
                    // Scroll al formulario
                    document.getElementById('movement-form').scrollIntoView({ behavior: 'smooth' });
                    
                    this.showNotification('✏️ Editando movimiento...', 'info');
                } catch (innerError) {
                    console.error('Error en editMovement (inner):', innerError);
                    this.showNotification('❌ Error al cargar campos del movimiento', 'error');
                }
            }, 100);
        } catch (error) {
            console.error('Error al editar movimiento:', error);
            this.showNotification('❌ Error al editar el movimiento', 'error');
        }
    }

    /**
     * Elimina un movimiento individual
     */
    deleteMovement(id) {
        if (confirm('¿Eliminar este movimiento?')) {
            dataManager.deleteMovement(id);
            this.renderMovementsTable();
            this.renderDashboard();
            this.showNotification('✅ Movimiento eliminado', 'success');
        }
    }

    /**
     * Cancela la edición de un movimiento
     */
    cancelEditMovement() {
        this.editingMovementId = null;
        document.getElementById('movement-form').reset();
        this.setDefaultDate();
        
        const submitBtn = document.querySelector('#movement-form button[type="submit"]');
        submitBtn.textContent = 'Guardar Movimiento';
        submitBtn.style.backgroundColor = '';
        
        document.getElementById('cancel-edit-btn').style.display = 'none';
        
        this.showNotification('Edición cancelada', 'info');
    }

    /**
     * Elimina TODOS los movimientos (con triple confirmación)
     */
    deleteAllMovements() {
        const totalMovements = dataManager.getAllMovements().length;
        
        if (totalMovements === 0) {
            this.showNotification('No hay movimientos para eliminar', 'error');
            return;
        }

        if (!confirm(`⚠️ ¿ELIMINAR TODOS LOS ${totalMovements} MOVIMIENTOS? Esta acción no se puede deshacer.`)) {
            return;
        }

        if (!confirm('⚠️ SEGUNDA CONFIRMACIÓN: ¿Estás completamente seguro?')) {
            return;
        }

        const data = dataManager.getData();
        data.movements = [];
        dataManager.saveData(data);
        this.selectedMovements.clear();
        this.renderMovementsTable();
        this.renderDashboard();
        this.showNotification(`✅ Se eliminaron ${totalMovements} movimientos`, 'success');
    }

    /**
     * Exporta datos como JSON
     */
    exportData() {
        const data = dataManager.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `control-gastos-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('✅ Datos exportados', 'success');
    }

    /**
     * Importa datos desde JSON
     */
    handleJSONImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = dataManager.importData(event.target.result);
            if (result.success) {
                this.showNotification(`✅ ${result.message}`, 'success');
                this.renderDashboard();
                this.renderMovementsTable();
            } else {
                this.showNotification(`❌ ${result.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Borra todos los datos
     */
    clearAllData() {
        if (confirm('⚠️ ¿ESTÁS SEGURO? Esto eliminará TODOS los datos permanentemente.')) {
            if (confirm('⚠️ Primera confirmación: ¿Continuar?')) {
                dataManager.clearAllData();
                this.showNotification('✅ Todos los datos han sido eliminados', 'success');
                this.renderDashboard();
                this.renderMovementsTable();
            }
        }
    }

    /**
     * Agrega una nueva categoría personalizada
     */
    addNewCategory() {
        const name = document.getElementById('new-category-name').value.trim();
        const type = document.getElementById('new-category-type').value;
        const color = document.getElementById('new-category-color').value;

        if (!name) {
            this.showNotification('❌ Ingresa un nombre para la categoría', 'error');
            return;
        }

        const result = dataManager.addCustomCategory(name, type, color);
        if (result.success) {
            this.showNotification(`✅ Categoría "${name}" creada correctamente`, 'success');
            // Limpiar el formulario
            document.getElementById('new-category-name').value = '';
            document.getElementById('new-category-type').value = 'expense';
            document.getElementById('new-category-color').value = '#206BFF';
            this.populateCategorySelects();
            this.renderCustomCategories();
        } else {
            this.showNotification(`❌ ${result.message}`, 'error');
        }
    }

    /**
     * Renderiza la lista de categorías personalizadas
     */
    renderCustomCategories() {
        const customCats = dataManager.getCustomCategories();
        const list = document.getElementById('custom-categories-list');

        if (customCats.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">No tienes categorías personalizadas aún</p>';
            return;
        }

        list.innerHTML = customCats.map(cat => `
            <div class="custom-category-item">
                <div class="custom-category-info">
                    <div class="custom-category-color" style="background-color: ${cat.color};"></div>
                    <div>
                        <div class="custom-category-name">${cat.name}</div>
                        <div class="custom-category-type">${cat.type}</div>
                    </div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="app.deleteCustomCategory('${cat.id}')">Eliminar</button>
            </div>
        `).join('');
    }

    /**
     * Elimina una categoría personalizada
     */
    deleteCustomCategory(id) {
        const category = dataManager.getCategoryById(id);
        if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) {
            return;
        }

        const result = dataManager.deleteCustomCategory(id);
        if (result.success) {
            this.showNotification('✅ Categoría eliminada', 'success');
            this.populateCategorySelects();
            this.renderCustomCategories();
        } else {
            this.showNotification(`❌ ${result.message}`, 'error');
        }
    }

    /**
     * Muestra notificaciones
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background-color: ${type === 'success' ? 'rgba(168, 229, 113, 0.2)' : 'rgba(255, 68, 33, 0.2)'};
            color: ${type === 'success' ? '#A8E571' : '#FF4421'};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializa la aplicación
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
