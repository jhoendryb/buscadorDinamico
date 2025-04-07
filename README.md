# Search Class Documentation

Una clase JavaScript flexible para crear buscadores dinámicos con soporte para paginación y búsqueda en tiempo real, tanto con datos locales como con peticiones AJAX.

## Tabla de Contenidos
- [Instalación](#instalación)
- [Uso Básico](#uso-básico)
- [Configuración](#configuración)
- [Métodos](#métodos)
- [Sistema de Caché](#sistema-de-caché)
- [Eventos](#eventos)
- [Ejemplos](#ejemplos)
- [Respuesta del Servidor](#respuesta-del-servidor)
- [Estructura HTML](#estructura-html)

## Instalación

```html
<script src="path/to/search.js"></script>
```

## Uso Básico

```javascript
// Buscador con datos locales
const buscadorLocal = new search({
    element: ".app-search",
    itemsPerPage: 10,
    data: [
        {
            name: "Item 1",
            descripcion: "Descripción 1"
        },
        // ... más items
    ]
});

// Buscador con datos HTML existentes
const buscadorHTML = new search({
    element: ".app-search",
    itemsPerPage: 10
    // No se necesita data ya que lee los items del HTML
});

// Buscador con AJAX
const buscadorAJAX = new search({
    element: ".app-search",
    procesServer: true,
    itemsPerPage: 10,
    data: {
        url: "./api/search.php",
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
| `renderizarItem` | Function | - | Función para personalizar el renderizado de items |

### Configuración AJAX

```javascript
{
    url: "URL_del_endpoint",
    method: "POST",  // GET, POST, PUT, PATCH
    body: {
        // Parámetros a enviar
        page: 1,
        searchTerm: ""
    },
    headers: {
        // Headers personalizados
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
- Utiliza el sistema de caché para optimizar búsquedas repetidas

### calcularPaginacion(totalItems)
Calcula la paginación basada en el número total de items.
- `totalItems`: Número total de items o array de items

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

## Sistema de Caché

La clase implementa un sistema de caché unificado que funciona tanto para datos locales como para peticiones al servidor:

### Características
- Almacena resultados de búsquedas previas
- Funciona automáticamente para datos locales y del servidor
- Tiempo de expiración: 5 minutos por defecto
- Se limpia automáticamente al hacer nuevas búsquedas
- Optimiza el rendimiento evitando recálculos innecesarios

### Funcionamiento
- Para datos locales: Cachea los resultados filtrados
- Para datos del servidor: Cachea las respuestas de las peticiones
- La clave del caché se genera usando: tipo (server/local) + término de búsqueda + página actual

## Eventos

El buscador incluye un debounce de 300ms en el input de búsqueda para optimizar el rendimiento.

## Ejemplos

### Buscador con HTML Existente y Renderizado Personalizado

```html
<div class="app-search">
    <search class="input-search">
        <!-- Input de búsqueda -->
    </search>
    <div class="body">
        <section class="items" data-name="Item 1" data-descripcion="Descripción 1">
            Contenido del item
        </section>
        <!-- ... más items -->
    </div>
    <footer>
        <!-- Paginación -->
    </footer>
</div>

<script>
const buscador = new search({
    element: ".app-search",
    itemsPerPage: 10,
    renderizarItem: function(element) {
        return `
            <div class="item-personalizado">
                <h3>${element.name}</h3>
                <p>${element.descripcion}</p>
            </div>
        `;
    }
});
</script>
```

### Buscador con Datos Locales

```javascript
const data = [
    { name: "Item 1", descripcion: "Descripción 1" },
    { name: "Item 2", descripcion: "Descripción 2" }
];

const buscador = new search({
    element: ".app-search",
    itemsPerPage: 10,
    data: data
});
```

### Buscador con AJAX y Renderizado Personalizado

```javascript
const buscador = new search({
    element: ".app-search",
    procesServer: true,
    itemsPerPage: 10,
    data: {
        url: "./api/search.php",
        method: "POST",
        body: {
            page: 1,
            searchTerm: ""
        }
    },
    renderizarItem: function(element) {
        return `
            <div class="item-card">
                <h3>${element.title}</h3>
                <p>${element.description}</p>
            </div>
        `;
    }
});
```

## Respuesta del Servidor Esperada

```json
{
    "data": [], // Array de items
    "page": 1,  // Página actual
    "countPage": 10 // Total de páginas
}
```

## Estructura HTML Requerida

```html
<div class="app-search">
    <search class="input-search">
        <!-- El buscador generará automáticamente el input -->
    </search>
    <div class="body">
        <!-- Resultados -->
    </div>
    <footer>
        <!-- Paginación -->
    </footer>
</div>
