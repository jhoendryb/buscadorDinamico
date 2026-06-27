# Search Component

Una clase TypeScript flexible y moderna para crear buscadores dinámicos con soporte para paginación, scroll infinito, búsqueda en tiempo real, navegación por teclado, temas CSS predefinidos y gestión de errores centralizada. Compatible con datos locales y peticiones AJAX al servidor usando Fetch API.

## Características Principales

- **Búsqueda en tiempo real** con debounce configurable
- **Modo local** (datos en memoria) y **modo servidor** (AJAX con Fetch API)
- **Scroll infinito** automático con Intersection Observer
- **Navegación por teclado** (ArrowUp, ArrowDown, Enter)
- **Sistema de eventos** personalizado y extensible
- **Caché LRU** con TTL para optimizar rendimiento
- **Templates personalizados** para renderizado de items
- **Internacionalización** (i18n) con traducciones configurables
- **Temas CSS predefinidos** (clean-white, blue-black, onyx-black, forest-green)
- **30+ variables CSS** personalizables
- **Gestión de errores centralizada** con mensajes claros
- **TypeScript** con type safety completo
- **Múltiples instancias** en la misma página sin conflictos
- **Accesibilidad** con ARIA attributes
- **Build moderno** con Vite (ES Module + UMD)

## Tabla de Contenidos

- [Instalación](#instalación)
- [Arquitectura del Componente](#arquitectura-del-componente)
- [Configuración Completa](#configuración-completa)
- [Estructura HTML](#estructura-html)
- [CSS y Estilos](#css-y-estilos)
- [Modos de Uso](#modos-de-uso)
- [API Fetch](#api-fetch)
- [Sistema de Eventos](#sistema-de-eventos)
- [Métodos Públicos](#métodos-públicos)
- [Métodos de Paginación](#métodos-de-paginación)
- [Scroll Infinito](#scroll-infinito)
- [Navegación por Teclado](#navegación-por-teclado)
- [Templates Personalizados](#templates-personalizados)
- [Internacionalización](#internacionalización-i18n)
- [Sistema de Caché](#sistema-de-caché)
- [Gestión de Errores](#gestión-de-errores)
- [Servidor Backend](#servidor-backend)
- [Ejemplos Completos](#ejemplos-completos)
- [Personalización Avanzada](#personalización-avanzada)
- [TypeScript](#typescript)
- [Rendimiento y Optimización](#rendimiento-y-optimización)
- [Accesibilidad](#accesibilidad)
- [Troubleshooting](#troubleshooting)
- [Migración desde XMLHttpRequest](#migración-desde-xmlhttprequest)
- [Changelog](#changelog)
- [Licencia](#licencia)

## Instalación

### Instalación con npm/pnpm

```bash
npm install buscador-dinamico
# o
pnpm install buscador-dinamico
```

### Instalación Manual

Descarga los archivos del proyecto e importa la clase Search:

```html
<script type="module">
    import { Search } from './src/js/app.js';
</script>
```

**Nota:** El proyecto usa TypeScript pero compila a JavaScript. Si estás usando el código fuente directamente, usa `./src/js/app.ts`.

### Dependencias

**Requeridas:**

- Ninguna (Vanilla JavaScript + TypeScript)

**Opcionales (para mejor visualización):**

- Bootstrap CSS y JS
- Popper.js (para componentes de Bootstrap)

```html
<!-- Opcional: Solo si deseas usar los estilos de Bootstrap -->
<link rel="stylesheet" href="./node_modules/bootstrap/dist/css/bootstrap.min.css">
<script src="./node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="./node_modules/@popperjs/core/dist/umd/popper.min.js"></script>
```

### Scripts de Desarrollo

El proyecto usa Vite como bundler y Jest para tests:

```bash
# Instalar dependencias
pnpm install

# Desarrollo con hot reload
pnpm dev

# Build de producción
pnpm build

# Ejecutar tests
pnpm test

# Verificar tipos TypeScript
pnpm type-check
```

### Salida del Build

El build genera dos versiones en `dist/`:

- **ES Module:** `buscador-dinamico.es.js` (para import/export)
- **UMD:** `buscador-dinamico.umd.js` (para script tags, exporta `window.BuscadorDinamico`)
- **CSS:** `css/buscador-dinamico.*.css` (CSS bundle con hash)

### Estructura de Archivos

```
buscadorDinamico/
├── src/
│   ├── js/
│   │   ├── main.ts                 # Entry point del build (importa CSS + re-exporta)
│   │   ├── index.ts                # Barrel export de todo el módulo
│   │   ├── app.ts                  # Clase principal Search
│   │   ├── types.ts                # Interfaces TypeScript
│   │   ├── constants.ts            # Constantes y valores por defecto
│   │   ├── renderElement.ts        # Función helper createElement
│   │   ├── search.ts               # Ejemplos de uso / demo
│   │   ├── searching/
│   │   │   ├── index.ts            # Barrel export
│   │   │   ├── searchingLocal.ts   # Búsqueda local
│   │   │   └── searchingServer.ts  # Búsqueda por servidor
│   │   ├── error-handler/
│   │   │   ├── index.ts            # Barrel export
│   │   │   ├── error-handler.ts    # SearchError + ErrorHandler
│   │   │   └── error-codes.ts      # Enum ErrorCode + ErrorDetails
│   │   ├── cache/
│   │   │   ├── index.ts            # Barrel export
│   │   │   └── cache.ts            # Sistema de caché LRU
│   │   ├── events/
│   │   │   ├── index.ts            # Barrel export
│   │   │   └── eventEmitter.ts     # Sistema de eventos
│   │   ├── pagination/
│   │   │   ├── index.ts            # Barrel export
│   │   │   └── pagination.ts       # Lógica de paginación
│   │   └── renderer/
│   │       ├── index.ts            # Barrel export
│   │       └── renderer.ts         # SearchRenderer
│   ├── css/
│   │   ├── index.css               # CSS entry point
│   │   ├── core/                   # CSS obligatorio
│   │   │   ├── index.css
│   │   │   ├── structure.css       # Layout del componente
│   │   │   ├── visibility.css      # Visibilidad/ocultamiento
│   │   │   ├── animations.css      # Transiciones y reduced-motion
│   │   │   ├── states.css          # Loading spinner
│   │   │   └── scrollbar.css       # Scrollbar personalizado
│   │   ├── theme/                  # Variables y estilos base
│   │   │   ├── index.css
│   │   │   ├── variables.css       # CSS custom properties
│   │   │   ├── colors.css          # Colores de componentes
│   │   │   ├── dimensions.css      # Dimensiones y espaciados
│   │   │   ├── borders.css         # Bordes y border-radius
│   │   │   └── typography.css      # Tipografía
│   │   └── themes/                 # Temas predefinidos
│   │       ├── index.css
│   │       ├── clean-white.css     # Tema blanco limpio
│   │       ├── blue-black.css      # Tema azul oscuro
│   │       ├── onyx-black.css      # Tema negro onyx
│   │       └── forest-green.css    # Tema verde bosque
│   ├── php/
│   │   ├── modelo.php              # Conexión BD (ejemplo)
│   │   └── responseAjax.php        # Endpoint de ejemplo
│   ├── json/
│   │   └── search.json             # Estructura HTML de referencia
│   └── tests/
│       └── unit/                   # Tests unitarios
├── dist/                           # Build de producción
│   ├── buscador-dinamico.es.js     # Módulo ES
│   ├── buscador-dinamico.umd.js    # UMD (window.BuscadorDinamico)
│   └── css/
│       └── buscador-dinamico.*.css # CSS bundle
├── index.html                      # Ejemplo de uso
├── README.md                       # Documentación
├── package.json                    # Configuración del paquete
├── vite.config.ts                  # Configuración de build
├── tsconfig.json                   # Configuración de TypeScript
├── jest.config.cjs                 # Configuración de tests
└── babel.config.js                 # Configuración de Babel
```

## Arquitectura del Componente

### Clases Principales

El componente sigue una arquitectura orientada a objetos (OOP) con separación de responsabilidades:

- **Search**: Clase principal que orquesta todas las funcionalidades
- **SearchingLocal**: Maneja la búsqueda en el cliente (datos locales)
- **SearchingServer**: Maneja la búsqueda por servidor usando Fetch API
- **Pagination**: Gestiona la paginación y scroll infinito
- **SearchRenderer**: Renderiza el DOM y maneja la visualización
- **EventEmitter**: Sistema de eventos personalizado
- **ErrorHandler**: Gestión centralizada de errores
- **LRUCache**: Sistema de caché con política LRU y TTL

### Patrón OOP y Composición

El componente utiliza:

- **Encapsulamiento**: Propiedades privadas con `#` y métodos públicos bien definidos
- **Composición**: Search compone instancias de SearchingLocal, SearchingServer, Pagination, etc.
- **Herencia**: Clases especializadas extienden funcionalidades base
- **Polimorfismo**: Interfaces compartidas entre clases similares

### Fetch API vs XMLHttpRequest

El componente ha migrado de XMLHttpRequest a **Fetch API** por las siguientes ventajas:

- **API moderna y basada en Promises**
- **Mejor manejo de streams**
- **Soporte nativo para AbortController** (timeout)
- **Sintaxis más limpia y legible**
- **Mejor integración con async/await**
- **Soporte para diferentes Content-Type** (JSON, FormData, URL-encoded)

### Sistema de Gestión de Errores

El sistema ErrorHandler proporciona:

- Validación centralizada de parámetros
- Códigos de error estandarizados
- Mensajes de error con guías de solución
- Logging en modo desarrollo
- Type safety con TypeScript

### Sistema de Eventos

El EventEmitter permite:

- Suscripción a eventos personalizados
- Múltiples listeners por evento
- Remoción de listeners
- Emisión de datos estructurados
- Encadenamiento de métodos

### Sistema de Caché LRU con TTL

El sistema de caché implementa:

- **LRU (Least Recently Used)**: Elimina los items menos usados
- **TTL (Time To Live)**: Expiración por tiempo
- **Configuración de tamaño máximo**
- **Invalidación manual**
- **Claves únicas por búsqueda**

## Configuración Completa

### Parámetros del Constructor

```typescript
const search = new Search({
    // Requerido
    element: '.app-search',
    
    // Tema
    theme: 'default',
    
    // Datos y búsqueda
    data: [],
    procesServer: false,
    searchTerm: '',
    
    // Paginación
    itemsPerPage: 10,
    
    // Performance
    debounceTime: 500,
    
    // Caché
    cacheEnabled: false,
    cacheMaxSize: 50,
    cacheTtlSeconds: 300,
    
    // Ordenamiento
    sortBy: null,
    sortOrder: 'asc',
    
    // UI/UX
    keyboardEnabled: false,
    zIndex: 1000,
    dom: 'scip',
    template: null,
    translation: {},
    
    // Desarrollo
    developmentMode: false,
    
    // Fetch API (modo servidor)
    fetch: {
        url: '',
        method: 'POST',
        headers: {},
        body: {},
        timeout: 10000,
        success: () => {},
        error: () => {}
    }
});
```

### Descripción Detallada de Parámetros

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `element` | String | - | Selector CSS del contenedor (requerido) |
| `theme` | String | `"default"` | Nombre del tema CSS (`default`, `clean-white`, `blue-black`, `onyx-black`, `forest-green`) |
| `data` | Array | `[]` | Array de objetos para búsqueda local |
| `procesServer` | Boolean | `false` | Habilita búsqueda por servidor (AJAX) |
| `searchTerm` | String | `""` | Término de búsqueda inicial |
| `itemsPerPage` | Number | `10` | Cantidad de items por página |
| `debounceTime` | Number | `500` | Tiempo de debounce en milisegundos |
| `cacheEnabled` | Boolean | `false` | Habilita caché LRU |
| `cacheMaxSize` | Number | `50` | Tamaño máximo del caché |
| `cacheTtlSeconds` | Number | `300` | Tiempo de vida del caché en segundos |
| `keyboardEnabled` | Boolean | `false` | Habilita navegación por teclado |
| `sortBy` | String | `null` | Campo para ordenamiento |
| `sortOrder` | String | `'asc'` | Orden: `'asc'` o `'desc'` |
| `zIndex` | Number | `1000` | z-index del componente |
| `dom` | String | `'scip'` | Orden de renderizado (s=search, c=content, i=items, p=pagination) |
| `template` | String/Function | `null` | Template personalizado para items |
| `translation` | Object | `{}` | Traducciones personalizadas |
| `developmentMode` | Boolean | `true` | Modo desarrollo con logs detallados |
| `fetch` | Object | `{}` | Configuración de Fetch API (solo si `procesServer: true`) |

### Configuración del Objeto `fetch`

```typescript
fetch: {
    url: "./src/php/responseAjax.php",  // URL del endpoint (requerido)
    method: "POST",                      // Método HTTP (GET, POST, PUT, PATCH)
    headers: {                           // Headers adicionales
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: {                              // Cuerpo de la petición
        page: 1,
        searchTerm: "",
        itemsPerPage: 10
    },
    timeout: 10000,                      // Timeout en milisegundos
    success: (resp, instance) => {        // Callback de éxito
        console.log('Respuesta:', resp);
    },
    error: (err) => {                    // Callback de error
        console.error('Error:', err);
    }
}
```

## Estructura HTML

### Contenedor Básico

La clase Search requiere un contenedor con una clase CSS:

```html
<div class="app-search">
    <!-- La clase generará automáticamente:
         - Input de búsqueda
         - Contenedor de resultados
         - Paginación -->
</div>
```

### Estructura con Datos Preexistentes en HTML

Si tienes datos ya en el HTML, puedes incluir elementos con data attributes:

```html
<div class="app-search app-search1">
    <search class="input-search prueba">
        <input type="text" name="filterSearch" id="filter-search" class="filter-search form-control input-sm"
            placeholder="Ingrese palabra clave...">
    </search>
    <div class="content-pagination-items">
        <ul class="items-search scroll-personalize">
            <li class="items" data-country="VE" data-name="Venezuela"
                data-descripcion="El pais mas rico en petroleo.">
            </li>
            <li class="items" data-country="CO" data-name="Colombia"
                data-descripcion="Un pais con una gran riqueza cultural.">
            </li>
            <!-- ... más items -->
        </ul>
        <div class="pagination-items">
            <div class="items-counter">20 de 498</div>
        </div>
    </div>
</div>
```

La clase extraerá automáticamente los datos de los atributos `data-*` de los elementos `.items`.

### Estructura Generada Automáticamente

Si el contenedor está vacío, la clase Search generará automáticamente:

```html
<div class="app-search">
    <search class="input-search">
        <input type="text" name="filterSearch" class="filter-search form-control input-lg"
            placeholder="Ingrese palabra clave..."
            aria-label="Campo de búsqueda">
    </search>
    <div class="content-pagination-items">
        <ul class="items-search scroll-personalize">
            <!-- Aquí se renderizan los resultados -->
        </ul>
        <div class="pagination-items">
            <div class="items-counter">0 de 0</div>
        </div>
    </div>
</div>
```

### Clases CSS Únicas

La clase genera automáticamente clases CSS únicas para múltiples instancias:

```javascript
// Para `.app-search1`: `input-search-app-search1`, `items-search-app-search1`
// Para `.app-search2`: `input-search-app-search2`, `items-search-app-search2`
```

Esto evita conflictos de estilos entre múltiples instancias.

### ARIA Attributes y Accesibilidad

El componente incluye atributos ARIA para accesibilidad:

```html
<input type="text" 
    aria-label="Campo de búsqueda"
    placeholder="Ingrese palabra clave..."
    role="searchbox">
```

## CSS y Estilos

### CSS Core (Obligatorio)

CSS necesario para el funcionamiento del componente:

- Estructura de layout
- Visibilidad y ocultamiento
- Animaciones
- Estados (selected, loading)
- Scrollbar

```html
<link rel="stylesheet" href="./src/css/index.css">
```

### CSS Theme (Opcional)

CSS de estilización personalizable:

- Variables CSS
- Colores
- Dimensiones
- Bordes
- Tipografía

### Variables CSS Personalizables

```css
:root {
    /* Dimensiones */
    --search-width: 280px;
    --search-max-height: 400px;
    --search-padding: 10px;
    --search-gap: 10px;
    --search-item-padding: 10px;
    --search-font-size: 15px;
    --search-counter-font-size: 0.9em;
    --search-counter-text-align: center;
    --search-icon-size: 1.2em;
    
    /* Colores principales */
    --search-bg-color: #ffffff;
    --search-border-color: #d0d0d0;
    --search-text-color: #333333;
    --search-text-color-items: #444444;
    --search-light-text-color: #666666;
    --search-placeholder-color: #888888;
    
    /* Colores del input */
    --search-input-bg-color: #ffffff;
    --search-input-border-color: #cccccc;
    
    /* Colores de items */
    --search-item-bg-color: #f5f5f5;
    --search-item-hover-bg-color: #e8e8e8;
    --search-selected-bg-color: #d4edff;
    --search-selected-border-color: #0066cc;
    
    /* Colores del contador/paginación */
    --search-counter-color: #666666;
    --search-counter-bg-color: #f8f8f8;
    
    /* Bordes */
    --search-border-radius: 8px;
    --search-border-radius-open: 8px 8px 0 0;
    
    /* Sombras e iconos */
    --shadow-color: rgba(0,0,0,0.1);
    --search-icon-color: #666666;
    
    /* Scrollbar */
    --scrollbar-thumb-color: #cccccc;
    
    /* Spinner de carga */
    --spinner-border-color: #e0e0e0;
    --spinner-top-color: #0066cc;
}
```

### Creación de Temas Personalizados

```html
<link rel="stylesheet" href="./src/css/index.css">
<link rel="stylesheet" href="./mi-tema-personalizado.css">
```

### Temas Predefinidos

El componente incluye 4 temas predefinidos que puedes usar directamente:

| Tema | Descripción |
|------|-------------|
| `default` | Tema por defecto con colores neutros |
| `clean-white` | Blanco limpio, bordes sutiles, azul para selección |
| `blue-black` | Azul oscuro (#21213e), hover azul intenso |
| `onyx-black` | Negro puro (#121212), azul brillante para selección |
| `forest-green` | Verde bosque (#2c3e2e), verde oliva para hover |

Para usar un tema predefinido:

```javascript
const search = new Search({
    element: '.app-search',
    theme: 'clean-white',  // Usar tema blanco limpio
    data: [/* datos */]
});
```

O aplicar vía CSS:

```html
<link rel="stylesheet" href="./src/css/index.css">
<link rel="stylesheet" href="./src/css/themes/clean-white.css">
```

### Ejemplo de Personalización

```css
:root {
    --search-width: 400px;
    --search-bg-color: #f5f5f5;
    --search-selected-bg-color: #ffeb3b;
}

.app-search {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.items-search .items {
    transition: all 0.3s ease;
}

.content-pagination-items {
    background: #f5f5f5;
}
```

## Modos de Uso

### 1. Búsqueda Local con Datos del Array

```javascript
const search = new Search({
    element: '.app-search',
    data: [
        {
            country: 'VE',
            name: 'Venezuela',
            descripcion: 'El pais mas rico en petroleo.'
        },
        {
            country: 'CO',
            name: 'Colombia',
            descripcion: 'El pais mas rico en cafe.'
        },
        {
            country: 'MX',
            name: 'Mexico',
            descripcion: 'El pais mas rico en tacos.'
        }
    ]
});

search.init();
```

**Cómo funciona:**

- Los datos se pasan directamente en el parámetro `data`
- La búsqueda se realiza filtrando el array en el cliente
- La paginación se calcula basándose en los resultados filtrados

### 2. Búsqueda Local con Datos del DOM

```javascript
const search = new Search({
    element: '.app-search'
});

search.init();
```

**Cómo funciona:**

- La clase busca elementos `.items` dentro del contenedor
- Extrae los datos de los atributos `data-*` de cada elemento
- También captura el `innerHTML` del elemento en la propiedad `children`
- Los datos extraídos se convierten en un array para la búsqueda

**Estructura HTML requerida:**

```html
<div class="app-search app-search1">
    <search class="input-search prueba">
        <input type="text" name="filterSearch" id="filter-search" class="filter-search form-control input-sm"
            placeholder="Ingrese palabra clave...">
    </search>
    <div class="content-pagination-items">
        <ul class="items-search scroll-personalize">
            <li class="items" data-country="VE" data-name="Venezuela"
                data-descripcion="El pais mas rico en petroleo.">
            </li>
        </ul>
        <div class="pagination-items">
            <div class="items-counter">20 de 498</div>
        </div>
    </div>
</div>
```

### 3. Búsqueda por Servidor (Fetch API)

```javascript
const search = new Search({
    element: '.app-search',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: {
            page: 1,
            searchTerm: ""
        }
    }
});

search.init();
```

**Cómo funciona:**

- La clase usa Fetch API para hacer peticiones al servidor
- Envía parámetros: `searchTerm`, `page`, `itemsPerPage`
- El servidor debe responder con JSON conteniendo: `data`, `page`, `countPage`
- La paginación se maneja del lado del servidor
- Soporta timeout configurable con AbortController

### 4. Múltiples Instancias en la Misma Página

```javascript
const search1 = new Search({
    element: '.app-search1',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

const search2 = new Search({
    element: '.app-search2'
});

const search3 = new Search({
    element: '.app-search3',
    data: [
        { name: 'Item 1', descripcion: 'Descripción 1' }
    ]
});

search1.init();
search2.init();
search3.init();
```

## API Fetch

### Configuración de Fetch API

El componente usa la API Fetch moderna en lugar de XMLHttpRequest:

```javascript
fetch: {
    url: "./src/php/responseAjax.php",
    method: "POST",
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: {
        page: 1,
        searchTerm: "",
        itemsPerPage: 10
    },
    timeout: 10000,
    success: (resp, instance) => {
        console.log('Respuesta:', resp);
    },
    error: (err) => {
        console.error('Error:', err);
    }
}
```

### Timeout Configurable con AbortController

```javascript
fetch: {
    url: "./src/php/responseAjax.php",
    timeout: 10000  // 10 segundos
}
```

Si la petición excede el timeout, se cancela automáticamente y se emite un error.

### Soporte para Diferentes Content-Type

**JSON:**

```javascript
fetch: {
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ page: 1, searchTerm: "" })
}
```

**URL-encoded:**

```javascript
fetch: {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: {
        page: 1,
        searchTerm: ""
    }
}
```

**FormData:**

```javascript
const formData = new FormData();
formData.append('page', '1');
formData.append('searchTerm', '');

fetch: {
    body: formData
}
```

### Callbacks de Éxito y Error

```javascript
fetch: {
    success: (resp, instance) => {
        console.log('Datos recibidos:', resp.data);
        console.log('Instancia:', instance);
    },
    error: (err) => {
        console.error('Error en petición:', err);
    }
}
```

## Sistema de Eventos

### Lista Completa de Eventos

| Evento | Cuándo se emite | Datos emitidos |
|--------|----------------|----------------|
| `init` | Al inicializar el componente | `{ searchTerm, itemsPerPage, procesServer }` |
| `search` | Al realizar una búsqueda | `{ searchTerm, results, totalResults, timestamp }` |
| `pageChange` | Al cambiar de página | `{ page, totalPages, itemsOnPage, totalLoaded }` |
| `sortChange` | Al cambiar el ordenamiento | `{ field, order }` |
| `itemSelected` | Al seleccionar un item | `{ item, index }` |
| `itemHighlighted` | Al destacar un item con teclado | `{ item, index }` |
| `renderItems` | Al renderizar items | `{ items, content }` |
| `appendItems` | Al añadir items (scroll infinito) | `{ items, content }` |
| `destroy` | Al destruir la instancia | `{ timestamp }` |
| `error` | Al ocurrir un error | `{ code, message, solution }` |

### Ejemplos de Uso de Eventos

```javascript
const search = new Search({
    element: '.app-search',
    data: [/* datos */]
});

// Evento init
search.on('init', (data) => {
    console.log('Componente inicializado:', data);
});

// Evento search
search.on('search', (data) => {
    console.log('Búsqueda realizada:', data.searchTerm);
    console.log('Resultados:', data.totalResults);
});

// Evento pageChange
search.on('pageChange', (data) => {
    console.log('Página actual:', data.page);
    console.log('Total páginas:', data.totalPages);
});

// Evento itemSelected
search.on('itemSelected', (data) => {
    console.log('Item seleccionado:', data.item);
    console.log('Índice:', data.index);
});

// Evento sortChange
search.on('sortChange', (data) => {
    console.log('Ordenado por:', data.field);
    console.log('Orden:', data.order);
});

// Evento destroy
search.on('destroy', (data) => {
    console.log('Componente destruido:', data.timestamp);
});

search.init();
```

### Remover Listeners

```javascript
const listener = search.on('search', (data) => {
    console.log('Búsqueda:', data);
});

// Remover el listener específico
listener.off();

// Remover todos los listeners de un evento
search.events.removeAllListeners('search');

// Remover todos los listeners de todos los eventos
search.events.removeAllListeners();
```

### Listener de Una Sola Vez

```javascript
// Ejecutar solo la primera vez que se emita el evento
search.events.once('init', (data) => {
    console.log('Solo se ejecuta una vez:', data);
});
```

### Información de Listeners

```javascript
// Obtener cantidad de listeners de un evento
const count = search.events.listenerCount('search');

// Obtener nombres de todos los eventos registrados
const eventNames = search.events.eventNames();
```

## Métodos Públicos

### init()

Inicializa el buscador y configura los elementos necesarios.

```javascript
search.init();
```

**Retorna:** Instancia de Search para encadenamiento

**Funcionamiento:**

- Valida que el contenedor exista
- Extrae datos del DOM si es modo local
- Renderiza la estructura del DOM
- Configura navegación por teclado si está habilitada
- Ejecuta búsqueda inicial
- Emite evento `init`

### draw(searchTerm, isEvent)

Ejecuta una búsqueda y renderiza los resultados.

```javascript
await search.draw('venezuela', true);
```

**Parámetros:**

- `searchTerm` (string): Término de búsqueda (opcional, usa `this.searchTerm` si no se proporciona)
- `isEvent` (boolean): Si fue iniciado por evento del usuario (default: false)

**Retorna:** Promise<Search> para encadenamiento

**Funcionamiento:**

- Resetea el scroll si cambia el término de búsqueda
- Ejecuta la búsqueda (local o servidor)
- Procesa scroll infinito
- Emite eventos correspondientes

### sort(field, order)

Ordena los datos por un campo específico.

```javascript
search.sort('name', 'asc');
```

**Parámetros:**

- `field` (string): Campo por el cual ordenar
- `order` (string): Orden de ordenamiento ('asc' o 'desc', default: 'asc')

**Retorna:** Instancia de Search para encadenamiento

**Funcionamiento:**

- En modo local: ordena el array `_data`
- En modo servidor: envía parámetros de ordenamiento al servidor
- Emite evento `sortChange`

### clearSort()

Elimina el orden actual y reinicia a orden natural.

```javascript
search.clearSort();
```

**Retorna:** Instancia de Search para encadenamiento

**Funcionamiento:**

- Reinicia `sortBy` a null
- Reinicia `sortOrder` a 'asc'
- Limpia el caché
- En modo servidor: envía parámetros de reinicio al servidor

### on(eventName, callback)

Registra un listener para un evento.

```javascript
search.on('search', (data) => {
    console.log('Búsqueda:', data);
});
```

**Parámetros:**

- `eventName` (string): Nombre del evento
- `callback` (function): Función a ejecutar

**Retorna:** Objeto con método `off()` para remover el listener

### showLoading()

Muestra el indicador de carga.

```javascript
search.showLoading();
```

**Retorna:** Instancia de Search para encadenamiento

### getCacheKey(searchTerm, page)

Genera una clave única para el caché basada en el término de búsqueda y página.

```javascript
const key = search.getCacheKey('venezuela', 1);
// Retorna: 'venezuela_1'
```

**Parámetros:**

- `searchTerm` (string): Término de búsqueda
- `page` (number): Página actual

**Retorna:** string con clave única

### clearCacheByPrefix(prefix)

Limpia el caché por prefijo de búsqueda.

```javascript
search.clearCacheByPrefix('venezuela');
```

**Parámetros:**

- `prefix` (string): Prefijo de búsqueda a limpiar

**Retorna:** Instancia de Search para encadenamiento

### setupKeyboardNavigation()

Configura la navegación por teclado para el componente.

```javascript
search.setupKeyboardNavigation();
```

**Retorna:** Instancia de Search para encadenamiento

**Funcionamiento:**

- Requiere que `keyboardEnabled` sea true
- Habilita teclas: ArrowUp, ArrowDown, Enter
- Emite eventos `itemHighlighted` y `itemSelected`

### destroy()

Destruye la instancia de Search, limpiando recursos y event listeners.

```javascript
search.destroy();
```

**Retorna:** void

**Funcionamiento:**

- Emite evento `destroy`
- Limpia IntersectionObserver
- Limpia timeouts de animación
- Remueve event listeners del input
- Limpia todas las referencias internas
- No elimina el HTML del DOM

## Métodos de Paginación

### prevPage()

Retrocede una página si no es la primera.

```javascript
search.pagination.prevPage();
```

**Retorna:** number (página actual)

### goToPage(page)

Va a una página específica si es válida (1..totalPages).

```javascript
search.pagination.goToPage(3);
```

**Parámetros:**
- `page` (number): Número de página

**Retorna:** number (página actual)

### firstPage()

Va a la primera página.

```javascript
search.pagination.firstPage();
```

**Retorna:** number (página actual, siempre 1)

### lastPage()

Va a la última página.

```javascript
search.pagination.lastPage();
```

**Retorna:** number (página actual)

### getCurrentPage()

Retorna la página actual.

```javascript
const currentPage = search.pagination.getCurrentPage();
```

**Retorna:** number

### getPageItems(data?)

Retorna los items de la página actual (slice de datos).

```javascript
const pageItems = search.pagination.getPageItems(search._data);
```

**Parámetros:**
- `data` (Array, opcional): Array de datos a filtrar

**Retorna:** Array de items de la página actual

### setItemsPerPage(itemsPerPage)

Cambia la cantidad de items por página.

```javascript
search.pagination.setItemsPerPage(20);
```

**Parámetros:**
- `itemsPerPage` (number): Nueva cantidad de items por página

## Scroll Infinito

### Cómo Funciona el Scroll Infinito

El scroll infinito carga automáticamente más items cuando el usuario llega al final del contenedor de resultados, usando la API Intersection Observer.

### Intersection Observer API

```javascript
this.scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && this.pagination.hasMorePages()) {
            this.#loadMore();
        }
    });
}, {
    root: container,
    rootMargin: '100px',  // Cargar 100px antes del final
    threshold: 0.1
});
```

### Carga Automática al Final del Scroll

- Se crea un elemento "sentinel" al final del contenedor
- Cuando el sentinel entra en el viewport, se carga la siguiente página
- Los nuevos items se añaden al DOM sin reemplazar los existentes
- El contador se actualiza automáticamente

### Configuración del Detector de Scroll

El detector se configura automáticamente al inicializar el componente. No requiere configuración manual.

### Eventos Emitidos Durante Scroll

- `pageChange`: Se emite cada vez que se carga una nueva página
- `appendItems`: Se emite cuando se añaden items al DOM

## Navegación por Teclado

### Teclas Disponibles

| Tecla | Acción |
|-------|--------|
| ArrowDown | Navegar al siguiente item |
| ArrowUp | Navegar al item anterior |
| Enter | Seleccionar item destacado |

### Habilitación con keyboardEnabled

```javascript
const search = new Search({
    element: '.app-search',
    keyboardEnabled: true,
    data: [/* datos */]
});

search.init();
```

### Eventos Emitidos

- `itemHighlighted`: Se emite al navegar entre items con ArrowUp/ArrowDown
- `itemSelected`: Se emite al presionar Enter en un item destacado

### Ejemplo de Uso

```javascript
const search = new Search({
    element: '.app-search',
    keyboardEnabled: true,
    data: [
        { name: 'Venezuela' },
        { name: 'Colombia' },
        { name: 'Mexico' }
    ]
});

search.on('itemHighlighted', (data) => {
    console.log('Item destacado:', data.item);
});

search.on('itemSelected', (data) => {
    console.log('Item seleccionado:', data.item);
});

search.init();
```

## Templates Personalizados

### Uso de Templates con Strings

```javascript
const search = new Search({
    element: '.app-search',
    data: [
        { name: 'Venezuela', id: 1 },
        { name: 'Colombia', id: 2 }
    ],
    template: `<div>{{name}} - {{id}}</div>`
});

search.init();
```

### Uso de Templates con Funciones

```javascript
const search = new Search({
    element: '.app-search',
    data: [
        { name: 'Venezuela', id: 1 },
        { name: 'Colombia', id: 2 }
    ],
    template: (item) => {
        return `<div class="custom-item">
            <strong>${item.name}</strong>
            <span>ID: ${item.id}</span>
        </div>`;
    }
});

search.init();
```

### Sintaxis de Variables

- Usar `{{variable}}` para templates con strings
- La variable debe coincidir con una propiedad del objeto de datos
- Se pueden usar múltiples variables en un template

### Ejemplos de Templates

```javascript
// Template simple
template: `<div>{{name}}</div>`

// Template con múltiples variables
template: `<div>{{name}} - {{country}}</div>`

// Template con función
template: (item) => {
    return `<div class="item">
        <h3>${item.name}</h3>
        <p>${item.descripcion}</p>
    </div>`;
}
```

## Internacionalización (i18n)

### Traducciones Disponibles

| Clave | Default | Descripción |
|-------|---------|-------------|
| `searchPlaceholder` | "Ingrese palabra clave..." | Placeholder del input |
| `searchLabel` | "Campo de búsqueda" | Label del input (aria-label) |
| `noResults` | "No se encontraron resultados" | Mensaje sin resultados |
| `loading` | "Cargando..." | Mensaje de carga |

### Configuración de Traducciones Personalizadas

```javascript
const search = new Search({
    element: '.app-search',
    translation: {
        searchPlaceholder: 'Escribe la búsqueda aquí...',
        searchLabel: 'Buscar',
        noResults: 'No hay resultados',
        loading: 'Cargando datos...'
    },
    data: [/* datos */]
});

search.init();
```

### Traducciones por Defecto

```javascript
static #defaultTranslations = {
    searchPlaceholder: "Ingrese palabra clave...",
    searchLabel: "Campo de búsqueda",
    noResults: "No se encontraron resultados",
    loading: "Cargando..."
};
```

### Ejemplo de Uso

```javascript
const search = new Search({
    element: '.app-search',
    translation: {
        searchPlaceholder: 'Escribe la busqueda aqui.'
    },
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

search.init();
```

## Sistema de Caché

### Caché LRU con TTL

El sistema de caché implementa:

- **LRU (Least Recently Used)**: Elimina los items menos usados cuando se llena
- **TTL (Time To Live)**: Expira items después de un tiempo configurable
- **Claves únicas**: Cada búsqueda tiene una clave única basada en término y página

### Configuración de Caché

```javascript
const search = new Search({
    element: '.app-search',
    cacheEnabled: true,
    cacheMaxSize: 50,      // Máximo 50 items en caché
    cacheTtlSeconds: 60,   // Expirar después de 60 segundos
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

search.init();
```

### Métodos de Caché

```javascript
// Generar clave única
const key = search.getCacheKey('venezuela', 1);

// Limpiar caché por prefijo
search.clearCacheByPrefix('venezuela');
```

### Invalidación de Caché

El caché se invalida automáticamente:

- Cuando se llama a `clearSort()`
- Cuando expira el TTL
- Cuando se llena el caché (política LRU)
- Manualmente con `clearCacheByPrefix()`

### Ejemplos de Uso

```javascript
const search = new Search({
    element: '.app-search',
    cacheEnabled: true,
    cacheMaxSize: 100,
    cacheTtlSeconds: 300,  // 5 minutos
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

// La primera búsqueda hace petición al servidor
await search.draw('venezuela');

// La segunda búsqueda con el mismo término usa caché
await search.draw('venezuela');

// Limpiar caché manualmente
search.clearCacheByPrefix('venezuela');
```

## Gestión de Errores

### Sistema ErrorHandler

El componente incluye un sistema robusto de gestión de errores que proporciona mensajes claros con guías de solución.

### Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| SEARCH_001 | El parámetro 'element' es requerido | Proporciona el selector CSS del contenedor |
| SEARCH_002 | El parámetro 'element' debe ser un string | Usa un selector CSS válido |
| SEARCH_003 | El parámetro 'fetch.url' es requerido | Configura la URL del endpoint |
| SEARCH_004 | itemsPerPage debe ser un número | Configura itemsPerPage con un número |
| SEARCH_005 | itemsPerPage debe ser mayor a 0 | Configura itemsPerPage con un valor positivo |
| SEARCH_010 | No existe el contenedor especificado | Verifica el selector CSS |
| SEARCH_011 | No existe el contenedor de resultados | Verifica la estructura DOM del componente |
| SEARCH_020 | Error de conexión al servidor | Verifica tu conexión a internet |
| SEARCH_021 | Error en la petición Fetch | Verifica la URL, método HTTP y configuración del servidor |
| SEARCH_030 | Formato de datos inválido | Verifica que los datos tengan el formato correcto |
| SEARCH_031 | Respuesta vacía del servidor | Verifica que el servidor retorne datos |
| SEARCH_040 | Error al inicializar el componente | Revisa la configuración y el DOM |
| SEARCH_041 | Error al renderizar el componente | Verifica la configuración de templates y DOM |

### Manejo de Errores en Eventos

```javascript
search.on('error', (data) => {
    console.error('Código:', data.code);
    console.error('Mensaje:', data.message);
    console.error('Solución:', data.solution);
});
```

### Modo Development vs Production

```javascript
// Modo development: muestra logs detallados
const search = new Search({
    element: '.app-search',
    developmentMode: true,
    data: [/* datos */]
});

// Modo production: no muestra logs
const search = new Search({
    element: '.app-search',
    developmentMode: false,
    data: [/* datos */]
});
```

### Ejemplo de Manejo de Errores

```javascript
const search = new Search({
    element: '.app-search',
    developmentMode: true,
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" },
        error: (err) => {
            console.error('Error en petición:', err);
        }
    }
});

search.on('error', (data) => {
    alert(`Error: ${data.message}\nSolución: ${data.solution}`);
});

try {
    search.init();
} catch (error) {
    console.error('Error al inicializar:', error);
}
```

## Servidor Backend

### Parámetros Esperados por el Servidor

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `searchTerm` | String | Término de búsqueda |
| `page` | Number | Página actual |
| `itemsPerPage` | Number | Items por página |
| `sortBy` | String (opcional) | Campo para ordenamiento |
| `sortOrder` | String (opcional) | Orden: 'asc' o 'desc' |

### Respuesta JSON Esperada

```json
{
    "data": [
        {
            "id_ciudad": 1,
            "name": "Caracas"
        }
    ],
    "page": 1,
    "countPage": 25
}
```

### Ejemplo de Implementación en PHP

**Nota importante:** La implementación de los archivos PHP del servidor es a discreción del usuario. Los ejemplos mostrados a continuación son solo referencias. Puedes usar cualquier lenguaje de programación, framework o método de tu preferencia, siempre y cuando respetes la respuesta JSON esperada por la clase Search.

#### modelo.php (Ejemplo)

```php
<?php
$HOST = "localhost";
$USER = "root";
$PASS = "password";
$DB = "mi_base_de_datos";
$conexion = mysqli_connect($HOST, $USER, $PASS, $DB) or die("Error de conexion");
```

#### responseAjax.php (Ejemplo)

```php
<?php
header("Content-Type: application/json; charset=UTF-8");

require __DIR__ . "/modelo.php";

$busqueda = $_POST['searchTerm'];
$page = $_POST['page'];
$itemsPerPage = $_POST['itemsPerPage'];
$start = ($page - 1) * $itemsPerPage;

$busqueda = (!empty($busqueda) ? "WHERE ciudad LIKE '%{$busqueda}%'" : "");
$consulta = mysqli_query($conexion, "SELECT id_ciudad, ciudad AS name FROM ciudades {$busqueda} ORDER BY id_ciudad ASC LIMIT $start, $itemsPerPage");
$consultaRow = mysqli_query($conexion, "SELECT COUNT(*) AS totalCount FROM ciudades {$busqueda} ORDER BY id_ciudad ASC");
$consultaRow = mysqli_fetch_assoc($consultaRow);

$newDatos = array();
while ($filas = mysqli_fetch_assoc($consulta)) {
    $filas['name'] = utf8_encode($filas['name']);
    $newDatos[] = $filas;
}

$response = [
    "data" => $newDatos,
    "page" => (int) $page,
    "countPage" => (int) $consultaRow['totalCount']
];

mysqli_close($conexion);
echo json_encode($response);
```

### Ejemplo de Implementación en Node.js

```javascript
const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mi_base_de_datos'
});

app.post('/api/search', (req, res) => {
    const { searchTerm, page, itemsPerPage } = req.body;
    const start = (page - 1) * itemsPerPage;
    
    let query = 'SELECT id, name FROM ciudades';
    let params = [];
    
    if (searchTerm) {
        query += ' WHERE name LIKE ?';
        params.push(`%${searchTerm}%`);
    }
    
    query += ' ORDER BY id ASC LIMIT ?, ?';
    params.push(start, itemsPerPage);
    
    connection.query(query, params, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        const countQuery = searchTerm 
            ? 'SELECT COUNT(*) as count FROM ciudades WHERE name LIKE ?'
            : 'SELECT COUNT(*) as count FROM ciudades';
        const countParams = searchTerm ? [`%${searchTerm}%`] : [];
        
        connection.query(countQuery, countParams, (error, countResults) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            
            res.json({
                data: results,
                page: parseInt(page),
                countPage: countResults[0].count
            });
        });
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});
```

### Nota Sobre Implementación

Puedes implementar el backend con:

- Cualquier lenguaje de programación (PHP, Node.js, Python, Ruby, etc.)
- Cualquier framework (Laravel, Express, Django, Rails, etc.)
- Cualquier base de datos (MySQL, PostgreSQL, MongoDB, etc.)
- Siempre y cuando respetes la respuesta JSON esperada.

## Ejemplos Completos

### Ejemplo 1: Búsqueda Local Simple

```html
<div class="app-search"></div>

<script type="module">
import { Search } from './src/js/app.js';

const search = new Search({
    element: '.app-search',
    data: [
        { country: 'VE', name: 'Venezuela', descripcion: 'El pais mas rico en petroleo.' },
        { country: 'CO', name: 'Colombia', descripcion: 'El pais mas rico en cafe.' },
        { country: 'MX', name: 'Mexico', descripcion: 'El pais mas rico en tacos.' }
    ]
});

search.init();
</script>
```

### Ejemplo 2: Búsqueda Local con DOM

```html
<div class="app-search app-search1">
    <div class="content-pagination-items">
        <ul class="items-search scroll-personalize">
            <li class="items" data-country="VE" data-name="Venezuela"
                data-descripcion="El pais mas rico en petroleo.">
            </li>
            <li class="items" data-country="CO" data-name="Colombia"
                data-descripcion="Un pais con una gran riqueza cultural.">
            </li>
        </ul>
    </div>
</div>

<script type="module">
import { Search } from './src/js/app.js';

const search = new Search({
    element: '.app-search1'
});

search.init();
</script>
```

### Ejemplo 3: Búsqueda por Servidor con Fetch

```html
<div class="app-search"></div>

<script type="module">
import { Search } from './src/js/app.js';

const search = new Search({
    element: '.app-search',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: {
            page: 1,
            searchTerm: ""
        }
    }
});

search.init();
</script>
```

### Ejemplo 4: Múltiples Instancias

```html
<div class="app-search app-search1"></div>
<div class="app-search app-search2"></div>
<div class="app-search app-search3"></div>

<script type="module">
import { Search } from './src/js/app.js';

const search1 = new Search({
    element: '.app-search1',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

const search2 = new Search({
    element: '.app-search2'
});

const search3 = new Search({
    element: '.app-search3',
    data: [
        { name: 'Item 1', descripcion: 'Descripción 1' }
    ]
});

search1.init();
search2.init();
search3.init();
</script>
```

### Ejemplo 5: Con Eventos Personalizados

```javascript
const search = new Search({
    element: '.app-search',
    data: [/* datos */]
});

search.on('init', (data) => {
    console.log('Inicializado:', data);
});

search.on('search', (data) => {
    console.log('Búsqueda:', data.searchTerm);
});

search.on('pageChange', (data) => {
    console.log('Página:', data.page);
});

search.on('itemSelected', (data) => {
    console.log('Seleccionado:', data.item);
});

search.init();
```

### Ejemplo 6: Con Scroll Infinito

```javascript
const search = new Search({
    element: '.app-search',
    procesServer: true,
    itemsPerPage: 20,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

search.on('pageChange', (data) => {
    console.log('Cargando página:', data.page);
    console.log('Total cargado:', data.totalLoaded);
});

search.init();
```

### Ejemplo 7: Con Navegación por Teclado

```javascript
const search = new Search({
    element: '.app-search',
    keyboardEnabled: true,
    data: [
        { name: 'Venezuela' },
        { name: 'Colombia' },
        { name: 'Mexico' }
    ]
});

search.on('itemHighlighted', (data) => {
    console.log('Destacado:', data.item);
});

search.on('itemSelected', (data) => {
    console.log('Seleccionado:', data.item);
});

search.init();
```

### Ejemplo 8: Con Templates Personalizados

```javascript
const search = new Search({
    element: '.app-search',
    data: [
        { name: 'Venezuela', id: 1 },
        { name: 'Colombia', id: 2 }
    ],
    template: `<div class="custom-item">
        <strong>{{name}}</strong>
        <span>ID: {{id}}</span>
    </div>`
});

search.init();
```

### Ejemplo 9: Con Internacionalización

```javascript
const search = new Search({
    element: '.app-search',
    translation: {
        searchPlaceholder: 'Escribe la búsqueda aquí...',
        noResults: 'No hay resultados',
        loading: 'Cargando datos...'
    },
    data: [/* datos */]
});

search.init();
```

### Ejemplo 10: Con Caché Habilitado

```javascript
const search = new Search({
    element: '.app-search',
    cacheEnabled: true,
    cacheMaxSize: 100,
    cacheTtlSeconds: 300,
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

search.init();
```

## Personalización Avanzada

### Personalización del Renderizado de Items

```javascript
const search = new Search({
    element: '.app-search',
    data: [/* datos */]
});

// Sobrescribe el método de renderizado
search.renderer.appendItems = function(data, template, noResults, events) {
    const container = this.body.renderItems;
    container.innerHTML = data.map((item, index) => {
        return `
            <div class="custom-item" data-index="${index}">
                <h3>${item.name}</h3>
                <p>${item.descripcion}</p>
                <button class="select-btn">Seleccionar</button>
            </div>
        `;
    }).join('');
    
    // Agregar event listeners
    container.querySelectorAll('.select-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            events.emit('itemSelected', { item: data[index], index });
        });
    });
};

search.init();
```

### Sobrescritura de Métodos

```javascript
const search = new Search({
    element: '.app-search',
    data: [/* datos */]
});

// Sobrescribir método de búsqueda
const originalSearching = search.searching.bind(search);
search.searching = async function(searchTerm, isEvent) {
    console.log('Búsqueda iniciada:', searchTerm);
    await originalSearching(searchTerm, isEvent);
    console.log('Búsqueda completada');
};

search.init();
```

### Clases CSS Únicas

```javascript
// Método privado que genera clases únicas
#getUniqueClassName(baseClass) {
    const parentSelector = this.element.replace(/^\.|^\#/, '');
    return `${baseClass}-${parentSelector}`;
}

// Ejemplo:
// Para `.app-search1`: `input-search-app-search1`, `items-search-app-search1`
// Para `.app-search2`: `input-search-app-search2`, `items-search-app-search2`
```

### Variables CSS

```css
:root {
    --search-width: 400px;
    --search-bg-color: #f5f5f5;
    --search-selected-bg-color: #ffeb3b;
    --search-border-radius: 8px;
    --search-font-size: 16px;
    --search-padding: 12px;
}
```

### Creación de Temas

```css
/* tema-oscuro.css */
:root {
    --search-bg-color: #1a1a1a;
    --search-selected-bg-color: #333;
    --search-text-color: #fff;
}

/* tema-claro.css */
:root {
    --search-bg-color: #fff;
    --search-selected-bg-color: #f0f0f0;
    --search-text-color: #333;
}
```

```html
<link rel="stylesheet" href="./src/css/index.css">
<link rel="stylesheet" href="./tema-oscuro.css">
```

## TypeScript

### Tipos Disponibles

El componente incluye interfaces TypeScript completas:

```typescript
interface SearchParams {
    element: string;
    searchTerm?: string;
    data?: Object[];
    procesServer?: boolean;
    keyboardEnabled?: boolean;
    cacheEnabled?: boolean;
    template?: string | ((item: any) => string);
    sortBy?: string;
    zIndex?: number;
    sortOrder?: 'asc' | 'desc';
    itemsPerPage?: number;
    debounceTime?: number;
    cacheMaxSize?: number;
    cacheTtlSeconds?: number;
    dom?: string;
    fetch?: FetchConfig;
    translation?: TranslationCache;
    developmentMode?: boolean;
}

interface FetchConfig {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    timeout?: number;
    success?: (resp: any, instance: any) => void;
    error?: (err: any) => void;
}
```

### Interfaces TypeScript

```typescript
interface TranslationCache {
    searchPlaceholder?: string;
    loading?: string;
    noResults?: string;
    [key: string]: string | undefined;
}

interface SearchEventInit {
    searchTerm: string;
    itemsPerPage: number;
    procesServer: boolean;
}

interface PageChangeEventData {
    page: number;
    totalPages: number;
    itemsOnPage: number;
    totalLoaded: number;
}
```

### Autocompletado en IDEs

Al usar TypeScript, obtienes:

- Autocompletado de métodos y propiedades
- Type checking en tiempo de compilación
- Documentación inline en el IDE
- Refactorización segura
- Detección de errores antes de ejecutar

### Ejemplos con TypeScript

```typescript
import { Search, SearchParams, FetchConfig } from './src/js/app';

const config: SearchParams = {
    element: '.app-search',
    procesServer: true,
    cacheEnabled: true,
    keyboardEnabled: true,
    developmentMode: true,
    template: `<div>{{name}} - {{id_ciudad}}</div>`,
    translation: {
        searchPlaceholder: 'Escribe la busqueda aqui.'
    },
    fetch: {
        url: "/buscadorDinamico/src/php/responseAjax.php",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: {
            page: 1,
            searchTerm: ""
        }
    } as FetchConfig
};

const search = new Search(config);

search.on('renderItems', (data: any) => {
    const { content } = data;
    const item = content.children;
    console.log('Item content:', item[0].innerHTML);
});

search.on('itemSelected', (data: any) => {
    console.log('Item seleccionado:', data.item);
});

search.init();
```

## Rendimiento y Optimización

### Debounce en el Input

El input de búsqueda tiene un debounce configurable para optimizar el rendimiento:

```javascript
debounceTime: 500  // 500ms por defecto
```

Esto evita hacer peticiones excesivas mientras el usuario escribe.

### Caché de Resultados

El sistema de caché LRU con TTL optimiza el rendimiento:

- Evita peticiones repetidas al servidor
- Almacena resultados temporalmente
- Expira automáticamente después del TTL
- Elimina items menos usados cuando se llena

### Scroll Infinito vs Paginación Tradicional

**Scroll Infinito:**

- Mejor UX para grandes cantidades de datos
- Carga progresiva de contenido
- Mejor en dispositivos móviles
- Requiere Intersection Observer

**Paginación Tradicional:**

- Mejor para datos pequeños
- Control explícito del usuario
- Más fácil de implementar
- Compatible con navegadores antiguos

### Fetch API vs XMLHttpRequest

**Fetch API (actual):**

- API moderna basada en Promises
- Mejor manejo de streams
- Soporte nativo para AbortController
- Sintaxis más limpia
- Mejor integración con async/await

**XMLHttpRequest (antiguo):**

- API basada en callbacks
- Manejo más complejo de streams
- Timeout manual
- Sintaxis más verbosa
- Menos legible

### Optimizaciones Implementadas

1. **Debounce**: Reduce peticiones al escribir
2. **Caché LRU**: Evita peticiones repetidas
3. **Scroll Infinito**: Carga progresiva
4. **Virtual DOM**: Solo renderiza cambios necesarios
5. **Intersection Observer**: Detección eficiente de scroll
6. **AbortController**: Cancela peticiones timeout

## Accesibilidad

### ARIA Attributes

El componente incluye atributos ARIA para accesibilidad:

```html
<input type="text" 
    aria-label="Campo de búsqueda"
    placeholder="Ingrese palabra clave..."
    role="searchbox">
```

### Navegación por Teclado

- **ArrowUp/ArrowDown**: Navegar entre items
- **Enter**: Seleccionar item destacado
- **Tab**: Navegar entre elementos del formulario

### Roles Semánticos

```html
<search class="input-search">
    <input type="text" name="filterSearch" class="filter-search" role="searchbox">
</search>
<div class="content-pagination-items">
    <ul class="items-search scroll-personalize" role="listbox">
        <li class="items" role="option"></li>
    </ul>
</div>
```

### Labels Descriptivos

```javascript
translation: {
    searchPlaceholder: 'Ingrese palabra clave...'
}
```

### Soporte de Screen Readers

El componente es compatible con screen readers gracias a:

- ARIA attributes
- Roles semánticos
- Labels descriptivos
- Navegación por teclado
- Estados visuales claros

## Troubleshooting

### Errores Comunes

**Error: "No existe el contenedor"**

- Causa: El selector CSS no coincide con ningún elemento
- Solución: Verifica que el selector sea correcto y que el elemento exista en el DOM

**Error: "fetch.url es requerido"**

- Causa: `procesServer: true` pero no se configuró `fetch.url`
- Solución: Configura la URL del endpoint en `fetch.url`

**Error: Timeout de petición**

- Causa: El servidor tarda más que el timeout configurado
- Solución: Aumenta el timeout o verifica el rendimiento del servidor

**Error: "Error al parsear JSON"**

- Causa: El servidor no retorna JSON válido
- Solución: Verifica que el servidor retorne JSON con el formato correcto

### Soluciones a Problemas Frecuentes

**El scroll infinito no funciona:**

- Verifica que IntersectionObserver esté disponible en el navegador
- Verifica que el contenedor tenga altura fija o max-height
- Verifica que haya suficientes items para activar el scroll

**La navegación por teclado no funciona:**

- Verifica que `keyboardEnabled: true`
- Verifica que el input tenga foco
- Verifica que haya items renderizados

**El caché no funciona:**

- Verifica que `cacheEnabled: true`
- Verifica que `cacheMaxSize` sea mayor a 0
- Verifica que `cacheTtlSeconds` sea mayor a 0

### Debugging con developmentMode

```javascript
const search = new Search({
    element: '.app-search',
    developmentMode: true,  // Habilita logs detallados
    data: [/* datos */]
});
```

En modo development:

- Se muestran logs de errores detallados
- Se muestran logs de eventos
- Se muestran logs de caché
- Se muestran logs de peticiones

### Logs de Errores

```javascript
search.on('error', (data) => {
    console.error('Código:', data.code);
    console.error('Mensaje:', data.message);
    console.error('Solución:', data.solution);
});
```

### Verificación de Configuración

```javascript
const search = new Search({
    element: '.app-search',
    data: [/* datos */]
});

console.log('Configuración:', {
    element: search.element,
    procesServer: search.procesServer,
    itemsPerPage: search.itemsPerPage,
    cacheEnabled: search.cacheEnabled,
    keyboardEnabled: search.keyboardEnabled
});
```

## Migración desde XMLHttpRequest

### Cambios Realizados

El componente ha migrado de XMLHttpRequest a Fetch API:

**Antes (XMLHttpRequest):**

```javascript
ajax(config) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(config.method, config.url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error('Error en petición'));
            }
        };
        xhr.send(JSON.stringify(config.body));
    });
}
```

**Después (Fetch API):**

```javascript
async fetch(config) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    try {
        const response = await fetch(config.url, {
            method: config.method,
            headers: config.headers,
            body: this.#formatBody(config.body),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
```

### Diferencias entre XHR y Fetch

| Aspecto | XMLHttpRequest | Fetch API |
|---------|----------------|-----------|
| API | Callbacks | Promises |
| Timeout | Manual | AbortController |
| Streams | Limitado | Nativo |
| Sintaxis | Verbosa | Limpia |
| async/await | No compatible | Compatible |
| Type Safety | Limitado | Mejor |

### Guía de Migración

Si tienes código antiguo con XMLHttpRequest:

1. **Reemplazar llamadas ajax con fetch:**

```javascript
// Antes
search.ajax({ url: '/api', method: 'POST', body: data });

// Después (automático con el componente)
// El componente usa fetch internamente
```

1. **Actualizar configuración de fetch:**

```javascript
fetch: {
    url: '/api',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}
```

1. **Manejar errores con callbacks:**

```javascript
fetch: {
    error: (err) => {
        console.error('Error:', err);
    }
}
```

### Compatibilidad con Navegadores Antiguos

Fetch API es compatible con:

- Chrome 42+
- Firefox 39+
- Safari 10.1+
- Edge 14+
- Opera 29+

Para navegadores antiguos, usa un polyfill:

```html
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.min.js"></script>
```

## Changelog

### Versión 2.1.0 (Actual)

**Nuevas características:**

- Temas CSS predefinidos (clean-white, blue-black, onyx-black, forest-green)
- Propiedad `theme` para seleccionar tema desde configuración
- 30+ variables CSS personalizables
- Métodos de paginación: `prevPage()`, `goToPage()`, `firstPage()`, `lastPage()`, `getCurrentPage()`, `getPageItems()`, `setItemsPerPage()`
- Métodos de EventEmitter: `once()`, `removeAllListeners()`, `listenerCount()`, `eventNames()`
- Build con Vite (ES Module + UMD)
- Tests unitarios con Jest
- Función helper `createElement` para renderizado de DOM
- Soporte para métodos HTTP: GET, POST, PUT, DELETE, PATCH
- Validación de Content-Type automática (JSON, FormData, URL-encoded)
- Soporte para `prefers-reduced-motion` en animaciones

**Cambios:**

- `developmentMode` ahora es `true` por defecto (antes `false`)
- `cacheTtlSeconds` ahora es `300` segundos por defecto (antes `60`)
- Códigos de error actualizados y expandidos (SEARCH_001 a SEARCH_041)
- Estructura de archivos reorganizada con barrel exports
- CSS separado en 3 capas: core, theme, themes

### Versión 2.0.0

**Nuevas características:**

- Migración a TypeScript
- Migración de XMLHttpRequest a Fetch API
- Sistema de gestión de errores centralizado (ErrorHandler)
- Clases SearchingLocal y SearchingServer (antes mixins)
- Scroll infinito con Intersection Observer
- Navegación por teclado
- Templates personalizados
- Internacionalización (i18n)
- Sistema de caché LRU con TTL
- Sistema de eventos mejorado
- Timeout configurable con AbortController

**Breaking changes:**

- Requiere TypeScript o transpilación
- XMLHttpRequest reemplazado por Fetch API
- Mixins reemplazados por clases
- Nueva estructura de archivos

**Mejoras:**

- Mejor performance con caché
- Mejor UX con scroll infinito
- Mejor accesibilidad con ARIA
- Mejor type safety con TypeScript
- Mejor manejo de errores

### Versión 1.0.0

**Características iniciales:**

- Búsqueda local y por servidor
- Paginación
- XMLHttpRequest para AJAX
- Mixins para lógica de búsqueda
- Sistema de eventos básico

## Licencia

MIT License - Puedes usar este componente en proyectos personales y comerciales.

## Soporte

Para más información, ejemplos y soporte:

- Revisa el código fuente en `src/js/`
- Ejecuta los ejemplos en `index.html`
- Revisa los tests en `src/tests/`
- Reporta issues en el repositorio del proyecto
