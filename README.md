# 💰 Control Gastos - PWA de Gestión de Finanzas Personales

Una Progressive Web App completa para gestionar tus gastos, ingresos y ahorros con estilo, gráficos interactivos y funcionalidades avanzadas.

## ✨ Características Principales

### 📊 Dashboard
- **Resumen de Finanzas**: Visualiza ingresos, gastos, ahorros y balance en tiempo real
- **Gráficos Interactivos**: 
  - Doughnut chart de distribución por categoría
  - Bar chart comparativo de ingresos vs gastos
- **Movimientos Recientes**: Acceso rápido a los últimos 5 movimientos

### 📋 Tabla de Movimientos
- **Búsqueda y Filtros**: Busca por descripción o filtra por categoría
- **Gestión Masiva**: Checkboxes para seleccionar y eliminar múltiples movimientos
- **Borrar TODO**: Botón para eliminar todos los movimientos de una vez (con doble confirmación)
- **Estado de Computable**: Marca movimientos como "No computables" para excluirlos de cálculos
- **Edición y Eliminación**: Acciones individuales por movimiento

### ➕ Nuevo Movimiento
- **Entrada Manual**: Crea ingresos, gastos o ahorros
- **Gastos Divididos Avanzados**: 
  - Calcula automáticamente tu parte en gastos compartidos
  - Marca tu parte como "computable" o "no computable" de forma independiente
  - Ejemplo: Una comida de €40 entre 2 personas = €20 cada uno, marcas tu parte como no computable si fue personal
- **Categorías Predefinidas**: 11 categorías organizadas por tipo
- **Fecha Flexible**: Registra movimientos de cualquier fecha

### 📥 Importador BBVA
- **Soporte CSV y XLSX**: Arrastra y suelta o selecciona archivos (incluyendo exportaciones directas de BBVA)
- **Detección Automática de Categorías**: Reconoce términos como "Mercadona", "Nómina", "Bizum", "Adeudo", "Endesa", etc.
- **Limpieza de Descripciones**: Elimina referencias bancarias innecesarias como "REF:", "ID:", "IBAN"
- **Preview Editable**: 
  - Revisa los movimientos antes de importar
  - Ajusta categorías detectadas
  - Marca movimientos como "No computables" directamente en la vista previa
  - Elimina movimientos individuales de la importación
- **Mapeo de Categorías**: Visualiza qué términos se detectan automáticamente para cada categoría

### ⚙️ Ajustes
- **Exportar Datos**: Descarga tu datos en JSON para backup
- **Importar Datos**: Carga datos desde un export anterior
- **Tema Oscuro/Claro**: Cambia entre temas con preferencias guardadas
- **Borrar Todo**: Limpia completamente la aplicación (con doble confirmación)

### 🌐 PWA Features
- **Instalable**: Instala como app nativa en tu dispositivo
- **Offline Support**: Funciona sin conexión gracias a Service Worker
- **Almacenamiento Local**: Datos guardados en localStorage del navegador
- **Responsive Design**: Funciona perfectamente en móvil, tablet y desktop

## 🎨 Sistema de Diseño

### Colores
- **Primarios**: Cobalt (#206BFF), Ice (#EBF2FF)
- **Estados**: 
  - Sky (#6BD6F1) - Información
  - Mauve (#BE52BE) - Ahorros  
  - Lime (#A8E571) - Ingresos
  - Sunrise (#FF4421) - Gastos/Alertas
  - Pink (#FF6DB3) - Acentos

### Estilo
- Bordes redondeados de 16px
- Sombras suaves y animaciones fluidas
- Tipografía sans-serif limpia
- Mobile-First con sidebar colapsable

## 🚀 Instalación

### En el Navegador
1. Abre `index.html` en tu navegador
2. La app se inicializa automáticamente con datos de ejemplo

### Como PWA
1. Abre la app en el navegador
2. Busca el icono "Instalar" (varía según navegador)
3. Instala en tu pantalla de inicio
4. Accede sin conexión

### Requisitos Técnicos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- localStorage disponible

## ⚡ Inicio Rápido

### 1️⃣ Importar movimientos BBVA
1. Ve a **Importar BBVA**
2. Arrastra tu archivo `csv` o `excel` desde BBVA
3. **Si no reconoce datos**: Abre consola (`F12`) para ver logs detallados
4. Revisa la preview y ajusta categorías si es necesario
5. Marca como "No computable" los que no quieras contar
6. Haz clic en **Confirmar Importación**

**💡 Tip**: Compara tu archivo con `EJEMPLO_BBVA_SIMPLE.csv` para verificar formato

### 2️⃣ Borrar movimientos
- **Un movimiento**: Tabla → Botón "Eliminar"
- **Varios movimientos**: Selecciona checkboxes → Botón "Eliminar Seleccionados"
- **TODOS de una vez**: Tabla → Botón "Borrar TODO" (+ confirmación doble)

### 3️⃣ Usar gastos compartidos/splits
1. Ve a **Nuevo Movimiento**
2. Llena: Fecha, Descripción, Categoría, Tipo (debe ser "Gasto")
3. Marca **"Gasto compartido (split)"**
4. Ingresa el monto total y número de personas
5. Se calcula automáticamente **Tu parte**
6. Marca "Tu parte es computable" o desmarca si es personal
7. ¡Listo! Solo tu parte (con su estado) se registra

## 📁 Estructura del Proyecto

```
control-gastos/
├── index.html                # Estructura HTML semántica
├── styles.css                # Sistema de temas y estilos
├── data.js                   # Motor de persistencia localStorage
├── app.js                    # Controlador principal SPA
├── charts.js                 # Gráficos con Chart.js
├── importador.js             # Procesamiento CSV/XLSX
├── manifest.json             # Configuración PWA
├── sw.js                     # Service Worker para offline
├── EJEMPLO_BBVA.csv          # Archivo ejemplo de formato BBVA
└── README.md                 # Este archivo
```

## 💾 Datos de Ejemplo

La app incluye 15 movimientos de ejemplo para abril 2026:
- Nómina (€2,500)
- Varios compras en supermercados
- Servicios, transporte, comidas
- Gastos marcados como "No computables"
- Ahorros y inversiones
- Freelance (€800)

Los datos se guardan automáticamente en localStorage.

## 🔧 Funciones Avanzadas

#### Movimientos Computables y No Computables
```javascript
// Excluye del balance y gráficos
movement.computable = false;
```
Perfecto para:
- Gastos personales que no quieres que afecten análisis
- Gastos de prueba
- Reembolsos pendientes
- Parte de un gasto compartido que es personal

#### Gastos Compartidos (Splits) con Control Granular
Puedes dividir un gasto y marcar tu parte como computable o no:
- Ejemplo: Compra con amigos por €100
  - Tu parte: €25
  - Marca como "No computable" si fue compra personal
  - Solo tu parte se excluye del balance
```javascript
const category = dataManager.detectCategory("Compra Mercadona");
// Retorna: "groceries"
```
Reconoce automáticamente categorías basadas en palabras clave.

### Limpieza de Descripciones
```javascript
const clean = dataManager.cleanBankDescription("REF: 12345 Compra Mercadona IBAN: ES123");
// Retorna: "Compra Mercadona"
```
Elimina referencias bancarias innecesarias.

### Filtrado Flexible
```javascript
const filtered = dataManager.filterMovements({
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    category: 'groceries',
    searchTerm: 'Mercadona'
});
```

## 📊 Cálculos Automáticos

- **Total de Ingresos**: Suma de movimientos con `type='income'` y `computable=true`
- **Total de Gastos**: Suma de movimientos con `type='expense'` y `computable=true`
- **Total de Ahorros**: Suma de movimientos con `type='savings'` y `computable=true`
- **Balance**: Ingresos - Gastos
- **Breakdown por Categoría**: Analiza distribución de gastos

## 🔐 Privacidad y Seguridad

- **Datos Locales**: Todo se guarda en localStorage de tu navegador
- **Sin Servidores**: No se envía información a servidores externos
- **Control Total**: Exporta o borra datos cuando quieras
- **Seguro**: Usa HTTPS si está hosteada en servidor

## 🎯 Categorías

| ID | Nombre | Tipo |
|----|--------|------|
| groceries | Supermercado | Gasto |
| transport | Transporte | Gasto |
| dining | Comidas | Gasto |
| entertainment | Entretenimiento | Gasto |
| utilities | Servicios | Gasto |
| health | Salud | Gasto |
| salary | Nómina | Ingreso |
| freelance | Freelance | Ingreso |
| investment | Ahorro | Ahorro |
| emergency | Fondo Emergencia | Ahorro |
| other | Otros | Gasto |

## 🐛 Troubleshooting

### El importador no reconoce cantidades
1. **Abre la consola**: Presiona `F12` o `Cmd+Option+I` (Mac)
2. **Arrastra tu archivo**: El console mostrará logs detallados
3. **Verifica el formato**: Debe tener columnas con fechas (DD/MM/YYYY) e importes (número + EUR)
4. **Usa el archivo ejemplo**: Descarga `EJEMPLO_BBVA_SIMPLE.csv` para comparar formato

### El importador no reconoce fechas
- Asegúrate que están en formato `DD/MM/YYYY`, `YYYY-MM-DD` o `DD-MM-YYYY`
- Si tu banco usa otro formato, abre consola (F12) y avisa qué formato ves

### Los datos no se guardan
- Verifica que localStorage esté habilitado en el navegador
- Comprueba que no estés en modo incógnito/privado

### Los gráficos no aparecen
- Asegúrate de que Chart.js se carga desde CDN
- Verifica la consola del navegador para errores
- Intenta recargar la página (Ctrl+Shift+R o Cmd+Shift+R)

## 🚀 Mejoras Futuras

- [ ] Sincronización en la nube (Firebase/Supabase)
- [ ] Exportación a PDF
- [ ] Presupuestos y alertas
- [ ] Recurrencias automáticas
- [ ] Multi-usuario con sincronización
- [ ] Soporte para múltiples monedas
- [ ] Análisis y predicciones avanzadas
- [ ] Integración con APIs bancarias reales

## 📝 Licencia

Proyecto de código abierto. Libre para usar y modificar.

## 👨‍💻 Autor

Creado como PWA moderna y completamente funcional con:
- HTML5 semántico
- CSS3 con variables y grid
- JavaScript vanilla (sin dependencias excepto Chart.js)
- Service Workers para offline
- localStorage para persistencia

---

**📌 Nota**: Esta es una PWA de demostración. Para datos financieros reales, considera integrar con servicios de banca abierta o APIs seguras certificadas.

## 🎯 Mejoras Implementadas

### Gestión Avanzada de Movimientos
- ✅ **Borrar TODO**: Botón en tabla de movimientos con doble confirmación
- ✅ **Borrar Seleccionados**: Checkboxes para selección múltiple
- ✅ **No Computables en Splits**: Marca tu parte de un gasto compartido como no computable
- ✅ **Vista Previa Mejorada**: Edita estado "Computable" antes de importar

### Importación Mejorada
- ✅ **Soporte XLSX Real**: Librería XLSX.js desde CDN para archivos Excel nativos
- ✅ **Detección BBVA**: Reconoce formato específico de BBVA con análisis de posición de columnas
- ✅ **Palabras Clave Expandidas**: Incluye "Adeudo", "Endesa", "Naturgy", "Telefónica", "Renfe", etc.
- ✅ **Preview Editable**: Ajusta computable de cada movimiento en preview

### Gastos Compartidos (Splits Avanzados)
- ✅ **Control Granular**: Marca tu parte como computable o no computable
- ✅ **Cálculo Automático**: Tu parte se registra con el estado seleccionado
- ✅ **Flexible**: Mezcla gastos compartidos normales con no-computables

¡Disfruta gestionando tus finanzas de forma moderna! 💪
