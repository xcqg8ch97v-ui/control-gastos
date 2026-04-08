/**
 * IMPORTADOR.JS - Lógica para Procesar Archivos CSV/XLSX
 * Incluye limpieza de descripciones bancarias y detección automática de categorías
 */

class Importer {
    constructor() {
        this.previewData = [];
        this.setupEventListeners();
        this.renderCategoryMappings();
    }

    /**
     * Configura los event listeners para el importa
     */
    setupEventListeners() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const confirmBtn = document.getElementById('confirm-import-btn');
        const cancelBtn = document.getElementById('cancel-import-btn');

        // Click en drop zone
        dropZone.addEventListener('click', () => fileInput.click());

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('active');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('active');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('active');
            const file = e.dataTransfer.files[0];
            if (file) this.handleFile(file);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleFile(e.target.files[0]);
        });

        // Botones de confirmación
        confirmBtn.addEventListener('click', () => this.confirmImport());
        cancelBtn.addEventListener('click', () => this.cancelImport());
    }

    /**
     * Maneja la selección de archivo
     */
    handleFile(file) {
        const fileName = file.name.toLowerCase();

        console.log('File selected:', fileName, 'Size:', file.size, 'bytes');

        if (fileName.endsWith('.csv')) {
            this.readCSV(file);
        } else if (fileName.endsWith('.xlsx')) {
            this.readXLSX(file);
        } else {
            this.showMessage('❌ Formato no soportado. Usa CSV o XLSX', 'error');
        }
    }

    /**
     * Lee y procesa archivos CSV
     */
    readCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                this.processCSV(csv);
            } catch (error) {
                this.showMessage(`❌ Error al leer CSV: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Procesa datos CSV
     */
    processCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const movements = [];
        const errors = [];

        console.log(`Processing ${lines.length} lines total`);

        // Detecta y salta línea de encabezado
        let startIndex = 0;
        if (lines.length > 0) {
            const firstLine = lines[0].toLowerCase();
            // Si contiene palabras de encabezado comunes, salta
            if (firstLine.includes('fecha') || firstLine.includes('concepto') || firstLine.includes('f.valor') || firstLine.includes('importe')) {
                startIndex = 1;
                console.log('Header detected, starting from line 1');
            }
        }

        // Procesa líneas de datos
        for (let i = startIndex; i < lines.length; i++) {
            const parts = this.parseCSVLine(lines[i]);
            if (parts.length >= 2) {
                const movement = this.parseMovementFromCSV(parts);
                if (movement) {
                    movements.push(movement);
                    console.log(`✓ Line ${i}: Movement parsed`);
                } else {
                    console.warn(`✗ Line ${i}: Failed to parse`);
                    errors.push(i);
                }
            }
        }

        if (movements.length === 0) {
            const errorMsg = errors.length > 0 
                ? `❌ No se reconocieron movimientos (${errors.length}/${lines.length - startIndex} líneas fallaron). Abre la consola (F12) para ver detalles.`
                : '❌ No se encontraron movimientos en el archivo';
            this.showMessage(errorMsg, 'error');
            return;
        }

        console.log(`✓ Successfully parsed ${movements.length} movements of ${lines.length - startIndex} lines`);
        this.showPreview(movements);
    }

    /**
     * Parseea una línea CSV manejando comillas
     */
    parseCSVLine(line) {
        const parts = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current) {
            parts.push(current.trim());
        }

        // Debug: log para verificar parsing
        if (parts.length > 0 && parts.some(p => p.includes('EUR'))) {
            console.log('Parsed CSV line:', parts);
        }

        return parts;
    }

    /**
     * Parseea un movimiento desde línea CSV con soporte BBVA
     */
    parseMovementFromCSV(parts) {
        try {
            // Formato BBVA esperado:
            // F.Valor, Fecha, Concepto, Movimiento, Importe, Divisa, Disponible, Divisa, Observaciones
            // Índices:   0      1        2           3         4        5          6         7         8
            
            let dateStr = '';
            let descriptionStr = '';
            let observacionesStr = '';
            let amountStr = '';
            let conceptStr = '';

            // Limpia los campos
            parts = parts.map(p => p.replace(/["']/g, '').trim());

            console.log('Processing parts:', parts.length, 'values');

            // Estrategia 1: Detecta formato BBVA por columnna de "Importe" (índice 4 típicamente)
            // Busca primero una columna que tenga número + EUR
            let amountIndex = -1;
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].includes('EUR') && /^[-+]?\d+[.,]\d{1,2}/.test(parts[i])) {
                    amountIndex = i;
                    console.log(`Amount found at index ${i}: ${parts[i]}`);
                    break;
                }
            }

            if (amountIndex !== -1) {
                // Formato BBVA detectado
                // Fecha típicamente está en índice 0 o 1
                dateStr = (parts[0] && this.isValidDate(parts[0])) ? this.formatDate(parts[0]) : 
                         (parts[1] && this.isValidDate(parts[1]) ? this.formatDate(parts[1]) : '');
                
                // Descripción: combina Concepto (idx ~2) + Movimiento (idx ~3)
                const concepto = parts[2] || '';
                const movimiento = parts[3] || concepto || '';
                descriptionStr = movimiento || concepto;
                
                // Observaciones (última columna - idx 8 típicamente)
                // Dentro del array, la última columna es parts[parts.length - 1]
                const lastColumn = parts[parts.length - 1] || '';
                const secondLastColumn = parts[parts.length - 2] || '';
                
                // La observación es la última columna si no es vacía y no es el monto
                if (lastColumn && lastColumn.length > 3 && !lastColumn.includes('EUR') && lastColumn !== descriptionStr) {
                    observacionesStr = lastColumn;
                } else if (secondLastColumn && secondLastColumn.length > 3 && !secondLastColumn.includes('EUR')) {
                    observacionesStr = secondLastColumn;
                }
                
                // Monto
                amountStr = parts[amountIndex];
                
                console.log('BBVA detected:', { dateStr, descriptionStr, observacionesStr, amountStr });
            } else {
                // Estrategia 2: Formato genérico - busca fecha, descripción, monto en cualquier parte
                console.log('Generic format, analyzing parts...');
                
                for (let i = 0; i < Math.min(parts.length, 8); i++) {
                    const part = parts[i];
                    const isDate = this.isValidDate(part);
                    const isAmount = this.isValidAmount(part);

                    if (isDate && !dateStr) {
                        dateStr = this.formatDate(part);
                        console.log(`Date at index ${i}: ${part} -> ${dateStr}`);
                    }
                    else if (isAmount && !amountStr) {
                        amountStr = part;
                        console.log(`Amount at index ${i}: ${part}`);
                    }
                    else if (!descriptionStr && part.length > 2 && !isDate && !isAmount) {
                        descriptionStr = part;
                        console.log(`Description at index ${i}: ${part}`);
                    }
                }
            }

            if (!dateStr) {
                console.warn('No date found in parts:', parts);
                return null;
            }
            
            if (!amountStr) {
                console.warn('No amount found in parts:', parts);
                return null;
            }

            // Extrae el número de la cadena (maneja "15 EUR", "-20.98 EUR", etc.)
            const numberMatch = amountStr.match(/^[-+]?(\d+[.,]\d{1,2}|\d+)/);
            if (!numberMatch) {
                console.warn('Could not extract number from:', amountStr);
                return null;
            }

            const amountNumber = parseFloat(numberMatch[0].replace(/,/g, '.'));
            const cleanedDesc = dataManager.cleanBankDescription(descriptionStr || 'Movimiento');
            const detectedCategory = dataManager.detectCategory(cleanedDesc);

            console.log('Parsed movement:', { date: dateStr, description: cleanedDesc, amount: amountNumber, type: amountNumber > 0 ? 'income' : 'expense' });

            return {
                date: dateStr,
                description: cleanedDesc,
                observations: observacionesStr || '',
                amount: Math.abs(amountNumber),
                category: detectedCategory,
                type: amountNumber > 0 ? 'income' : 'expense',
                computable: true
            };
        } catch (error) {
            console.error('Error parsing CSV line:', error, { parts });
            return null;
        }
    }

    /**
     * Lee y procesa archivos XLSX
     */
    readXLSX(file) {
        // Carga la librería XLSX dinámicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const csvtext = XLSX.utils.sheet_to_csv(firstSheet);
                    this.processCSV(csvtext);
                } catch (error) {
                    this.showMessage(`❌ Error al leer XLSX: ${error.message}`, 'error');
                }
            };
            reader.readAsArrayBuffer(file);
        };
        script.onerror = () => {
            this.showMessage('❌ No se pudo cargar la librería XLSX. Intenta con CSV.', 'error');
        };
        document.head.appendChild(script);
    }

    /**
     * Valida si es una fecha válida
     */
    isValidDate(str) {
        // Formatos comunes: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
        const datePatterns = [
            /^\d{1,2}\/\d{1,2}\/\d{4}$/,  // DD/MM/YYYY
            /^\d{4}-\d{1,2}-\d{1,2}$/,   // YYYY-MM-DD
            /^\d{1,2}-\d{1,2}-\d{4}$/    // DD-MM-YYYY
        ];

        const isValid = datePatterns.some(pattern => pattern.test(str));
        if (isValid) {
            console.log('Valid date recognized:', str);
        }
        return isValid;
    }

    /**
     * Valida si es un monto válido
     */
    isValidAmount(str) {
        const cleaned = str.trim();
        // Patrones: "15 EUR", "-20.98 EUR", "225EUR", "-40,50 €", etc.
        const amountPattern = /^[-+]?(\d+[.,]\d{1,2}|\d+)[\s]*(EUR|€|$)?$/i;
        return amountPattern.test(cleaned);
    }

    /**
     * Formatea fecha a YYYY-MM-DD
     */
    formatDate(dateStr) {
        // DD/MM/YYYY
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('/');
            const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            console.log(`Format DD/MM/YYYY: ${dateStr} -> ${formatted}`);
            return formatted;
        }
        
        // YYYY-MM-DD (ya está bien)
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split('-');
            const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            console.log(`Format YYYY-MM-DD: ${dateStr} -> ${formatted}`);
            return formatted;
        }

        // DD-MM-YYYY
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('-');
            const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            console.log(`Format DD-MM-YYYY: ${dateStr} -> ${formatted}`);
            return formatted;
        }

        console.warn('Could not parse date:', dateStr);
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Muestra la preview de importación
     */
    showPreview(movements) {
        this.previewData = movements;

        const preview = document.getElementById('import-preview');
        const tbody = document.getElementById('import-tbody');
        
        tbody.innerHTML = '';

        movements.forEach((movement, index) => {
            const category = dataManager.getCategoryById(movement.category);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${movement.date}</td>
                <td>${movement.description}</td>
                <td class="movement-amount ${movement.type}">
                    ${movement.type === 'income' ? '+' : '-'}€${movement.amount.toFixed(2)}
                </td>
                <td>
                    <select class="category-select" data-index="${index}">
                        ${dataManager.getAllCategories().map(cat => 
                            `<option value="${cat.id}" ${cat.id === movement.category ? 'selected' : ''}>
                                ${cat.name}
                            </option>`
                        ).join('')}
                    </select>
                </td>
                <td>
                    <input type="checkbox" class="computable-checkbox" data-index="${index}" ${movement.computable ? 'checked' : ''}>
                </td>
                <td>
                    <button type="button" onclick="importer.removeFromPreview(${index})" class="btn btn-sm btn-danger">
                        Eliminar
                    </button>
                </td>
            `;

            // Actualiza categoría cuando cambia el select
            row.querySelector('.category-select').addEventListener('change', (e) => {
                this.previewData[index].category = e.target.value;
            });

            // Actualiza estado de computable
            row.querySelector('.computable-checkbox').addEventListener('change', (e) => {
                this.previewData[index].computable = e.target.checked;
            });

            tbody.appendChild(row);
        });

        preview.style.display = 'block';
        document.getElementById('import-message').style.display = 'none';
    }

    /**
     * Elimina un movimiento de la preview
     */
    removeFromPreview(index) {
        this.previewData.splice(index, 1);
        if (this.previewData.length === 0) {
            document.getElementById('import-preview').style.display = 'none';
            this.showMessage('Preview vacía. Importación cancelada.', 'error');
        } else {
            this.showPreview(this.previewData);
        }
    }

    /**
     * Confirma la importación
     */
    confirmImport() {
        if (this.previewData.length === 0) return;

        try {
            this.previewData.forEach(movement => {
                dataManager.addMovement(movement);
            });

            this.showMessage(`✅ Se importaron ${this.previewData.length} movimientos correctamente`, 'success');
            
            // Limpia preview
            this.cancelImport();
            this.previewData = [];

            // Actualiza vistas
            app.renderDashboard();
            app.renderMovementsTable();

        } catch (error) {
            this.showMessage(`❌ Error al importar: ${error.message}`, 'error');
        }
    }

    /**
     * Cancela la importación
     */
    cancelImport() {
        document.getElementById('import-preview').style.display = 'none';
        document.getElementById('import-message').style.display = 'none';
        document.getElementById('file-input').value = '';
        this.previewData = [];
    }

    /**
     * Muestra un mensaje
     */
    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('import-message');
        messageDiv.textContent = message;
        messageDiv.className = `import-message ${type}`;
        messageDiv.style.display = 'block';
        
        if (type === 'error') {
            document.getElementById('import-preview').style.display = 'none';
            console.error('Import error:', message);
        }
    }

    /**
     * Renderiza el mapeo de categorías detectadas
     */
    renderCategoryMappings() {
        const mappingList = document.getElementById('mapping-list');
        
        const mappings = [
            { terms: ['Mercadona', 'Carrefour', 'LIDL', 'Alcampo'], category: 'Supermercado' },
            { terms: ['Gasolina', 'Uber', 'Taxi', 'Autobús', 'Tren'], category: 'Transporte' },
            { terms: ['Restaurante', 'Bar', 'Café', 'Pizza'], category: 'Comidas' },
            { terms: ['Nómina', 'Salary', 'Sueldo'], category: 'Nómina' },
            { terms: ['Bizum', 'Transferencia', 'Transferencia'], category: 'Transferencia' },
            { terms: ['Adeudo', 'Domiciliación', 'Recibo'], category: 'Servicios' }
        ];

        mappingList.innerHTML = mappings.map(mapping => `
            <div class="mapping-item">
                <div class="mapping-term">${mapping.terms.join(', ')}</div>
                <div class="mapping-category">${mapping.category}</div>
            </div>
        `).join('');
    }
}

// Instancia global del Importer
let importer;
document.addEventListener('DOMContentLoaded', () => {
    if (!importer) {
        importer = new Importer();
    }
});
