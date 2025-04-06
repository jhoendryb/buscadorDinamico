# Search Class Documentation

Una clase JavaScript flexible para crear buscadores dinámicos con soporte para paginación y búsqueda en tiempo real, tanto con datos locales como con peticiones AJAX.

## Tabla de Contenidos
- [Instalación](#instalación)
- [Uso Básico](#uso-básico)
- [Configuración](#configuración)
- [Métodos](#métodos)
- [Eventos](#eventos)
- [Ejemplos](#ejemplos)

## Instalación

```html
<script src="path/to/search.js"></script>
```

## Uso Básico

```javascript
const buscador = new search({
    element: ".app-search",
    procesServer: true,
    data: {
        url: "./api/endpoint.php",
        method: "POST",
        body: {
            page: 1,
            searchTerm: ""
        }
    }
});
```

## Configuración

### Opciones Básicas

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `element` | String | - | Selector CSS del contenedor del buscador |
| `itemsPerPage` | Number | 10 | Número de items por página |
| `procesServer` | Boolean | false | Habilita peticiones AJAX |
| `data` | Array/Object | - | Datos locales o configuración AJAX |

### Configuración AJAX

```javascript
{
    url: "URL_del_endpoint",
    method: "POST",  // GET, POST, PUT, PATCH
    body: {
        // Parámetros a enviar
    },
    headers: {
        // Headers personalizados
    },
    success: function(response, instance) {
        // Callback de éxito
    },
    error: function(error) {
        // Callback de error
    }
}
```

## Métodos

### init()
Inicializa el buscador y configura los elementos necesarios.

### initializeWithData()
Configura los eventos y realiza la búsqueda inicial.

### buscarEImprimir(searchTerm)
Realiza la búsqueda y muestra los resultados.
- `searchTerm`: Término de búsqueda

### filtrarDatos(data, searchTerm)
Filtra los datos según el término de búsqueda.
- `data`: Array de datos a filtrar
- `searchTerm`: Término de búsqueda

### imprimirDatos(data)
Renderiza los datos en el DOM.
- `data`: Array de datos a mostrar

### renderPagination(totalPages)
Genera la paginación.
- `totalPages`: Número total de páginas

### renderizarItem(element)
Personaliza el renderizado de cada item.
- `element`: Objeto con los datos del item

### ajax(config)
Realiza peticiones AJAX.
- config: Objeto de configuración AJAX

## Eventos

El buscador incluye un debounce de 500ms en el input de búsqueda para optimizar el rendimiento.

## Ejemplos

### Buscador Local

```javascript
const buscadorLocal = new search({
    element: ".app-search",
    data: [
        {
            name: "Item 1",
            descripcion: "Descripción 1"
        },
        // ... más items
    ]
});
```

### Buscador con AJAX

```javascript
const buscadorAJAX = new search({
    element: ".app-search",
    procesServer: true,
    data: {
        url: "./api/search.php",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: {
            page: 1,
            searchTerm: ""
        },
        success: function(response, instance) {
            console.log('Datos recibidos:', response);
        },
        error: function(error) {
            console.error('Error:', error);
        }
    }
});
```

### Personalización del Renderizado

```javascript
const buscadorPersonalizado = new search({
    element: ".app-search",
    renderizarItem: function(element) {
        return `
            <div class="item-personalizado">
                <h3>${element.name}</h3>
                <p>${element.descripcion}</p>
            </div>
        `;
    }
});
```

## Estructura HTML Requerida

```html
<div class="app-search">
    <!-- El buscador generará automáticamente: -->
    <search class="input-search">
        <!-- Input de búsqueda -->
    </search>
    <div class="body">
        <!-- Resultados -->
    </div>
    <footer>
        <!-- Paginación -->
    </footer>
</div>
```

## Respuesta del Servidor Esperada

```json
{
    "data": [], // Array de items
    "page": 1,  // Página actual
    "countPage": 10 // Total de páginas
}
