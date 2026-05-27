# Search Class Documentation

Una clase JavaScript flexible para crear buscadores dinámicos con soporte para paginación y búsqueda en tiempo real, tanto con datos locales como con peticiones AJAX al servidor.

## Tabla de Contenidos

- [Instalación](#instalación)
- [Estructura HTML](#estructura-html)
- [Configuración](#configuración)
- [Modos de Uso](#modos-de-uso)
- [Archivos PHP del Servidor](#archivos-php-del-servidor)
- [Métodos de la Clase](#métodos-de-la-clase)
- [Mixins](#mixins)
- [Función createElement](#función-createelement)
- [Ejemplos Completos](#ejemplos-completos)
- [Personalización](#personalización)
- [Notas Importantes](#notas-importantes)

## Instalación

La clase Search se importa como módulo ES6:

```html
<script src="./src/js/app.js" type="module"></script>
```

**Dependencias opcionales:**

- Bootstrap CSS y JS (para estilos - opcional, solo para mejorar la visualización del ejemplo)
- Popper.js (para componentes de Bootstrap - opcional, solo para mejorar la visualización del ejemplo)

```html
<!-- Opcional: Solo si deseas usar los estilos de Bootstrap para mejorar la visualización -->
<link rel="stylesheet" href="./node_modules/bootstrap/dist/css/bootstrap.min.css">
<script src="./node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="./node_modules/@popperjs/core/dist/umd/popper.min.js"></script>
```

## Estructura HTML

### Contenedor Básico

La clase Search requiere un contenedor con una clase CSS (por ejemplo, `.app-search`):

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
<div class="app-search">
    <main class="items-search">
        <section class="items" data-country="VE" data-name="Venezuela"
            data-descripcion="El pais mas rico en petroleo.">
        </section>
        <section class="items" data-country="CO" data-name="Colombia"
            data-descripcion="Un pais con una gran riqueza cultural.">
        </section>
        <!-- ... más items -->
    </main>
</div>
```

La clase extraerá automáticamente los datos de los atributos `data-*` de los elementos `.items`.

### Estructura Generada Automáticamente

Si el contenedor está vacío, la clase Search generará automáticamente:

```html
<div class="app-search">
    <search class="input-search">
        <label for="filter-search">Filtrar por Busqueda</label>
        <input type="text" name="filterSearch" class="filter-search form-control input-lg"
            placeholder="Ingrese palabra clave...">
    </search>
    <main class="items-search scroll-personalize">
        <!-- Aquí se renderizan los resultados -->
    </main>
    <footer class="index-search">
        <ul class="pagination">
            <!-- Aquí se renderiza la paginación -->
        </ul>
    </footer>
</div>
```

## Configuración

### Parámetros del Constructor

```javascript
const search = new Search({
    element: '.app-search',      // Selector CSS del contenedor (requerido)
    data: [],                    // Array de datos para búsqueda local (opcional)
    procesServer: false,         // Habilita búsqueda por servidor (opcional, default: false)
    itemsPerPage: 10,            // Items por página (opcional, default: 10)
    fetch: {                     // Configuración AJAX para servidor (opcional)
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: {
            page: 1,
            searchTerm: ""
        }
    }
});
```

### Descripción de Parámetros

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `element` | String | - | Selector CSS del contenedor del buscador (requerido) |
| `data` | Array | `[]` | Array de objetos con datos para búsqueda local |
| `procesServer` | Boolean | `false` | Habilita modo de búsqueda por servidor (AJAX) |
| `itemsPerPage` | Number | `10` | Cantidad de items a mostrar por página |
| `fetch` | Object | `{}` | Configuración de la petición AJAX (solo si `procesServer: true`) |

### Configuración del Objeto `fetch`

```javascript
fetch: {
    url: "./src/php/responseAjax.php",  // URL del endpoint PHP
    method: "POST",                      // Método HTTP (POST, GET, PUT, PATCH)
    body: {
        page: 1,                          // Página inicial
        searchTerm: "",                   // Término de búsqueda inicial
        itemsPerPage: 10                  // Items por página (se sincroniza con itemsPerPage)
    },
    sucess: function(response, instance) { },  // Callback de éxito (opcional)
    error: function(error) { }                   // Callback de error (opcional)
    header: { }                                  // Headers adicionales (opcional)
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
<div class="app-search">
    <main class="items-search">
        <section class="items" data-country="VE" data-name="Venezuela">
            Contenido HTML del item
        </section>
    </main>
</div>
```

### 3. Búsqueda por Servidor (AJAX)

```javascript
const search = new Search({
    element: '.app-search',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: {
            page: 1,
            searchTerm: ""
        }
    }
});

search.init();
```

**Cómo funciona:**

- La clase usa XMLHttpRequest para hacer peticiones al servidor
- Envía parámetros: `searchTerm`, `page`, `itemsPerPage`
- El servidor debe responder con JSON conteniendo: `data`, `page`, `countPage`
- La paginación se maneja del lado del servidor

## Archivos PHP del Servidor

**Nota importante:** La implementación de los archivos PHP del servidor es a discreción del usuario. Los ejemplos mostrados a continuación son solo referencias. Puedes usar cualquier lenguaje de programación, framework o método de tu preferencia, siempre y cuando respetes la respuesta JSON esperada por la clase Search.

### Ejemplo de Implementación

A continuación se muestra un ejemplo de implementación en PHP con MySQL, pero puedes adaptarlo según tus necesidades:

#### modelo.php (Ejemplo)

Configuración de conexión a la base de datos:

```php
<?php
$HOST = "localhost";
$USER = "root";
$PASS = "xample";
$DB = "venezuela";
$conexion = mysqli_connect($HOST, $USER, $PASS, $DB) or die("Error de conexion");
```

#### responseAjax.php (Ejemplo)

Endpoint para paginación del lado del servidor:

```php
<?php
header("Content-Type: application/json; charset=UTF-8");

require __DIR__ . "/modelo.php";

$busqueda = $_POST['searchTerm'];
$page = $_POST['page'];
$start = ($page - 1) * 10;

$busqueda = (!empty($busqueda) ? "WHERE ciudad LIKE '%{$busqueda}%'" : "");
$consulta = mysqli_query($conexion, "SELECT id_ciudad, ciudad AS name FROM ciudades {$busqueda} ORDER BY id_ciudad ASC LIMIT $start, {$_POST['itemsPerPage']}");
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

**Puedes implementar esto con:**

- Cualquier cosa de tu preferencia.

### Parámetros Esperados por el Servidor

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `searchTerm` | String | Término de búsqueda |
| `page` | Number | Página actual |
| `itemsPerPage` | Number | Items por página |

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

## Métodos de la Clase

### init()

Inicializa el buscador y configura los elementos necesarios.

```javascript
search.init();
```

**Funcionamiento:**

- Si `procesServer: true`, ejecuta búsqueda inicial en el servidor
- Si `procesServer: false`, extrae datos del DOM si no hay datos en el array
- Procesa y renderiza la paginación
- Ejecuta búsqueda inicial con término vacío

### searching(searchTerm)

Realiza la búsqueda según el término proporcionado.

```javascript
search.searching("venezuela");
```

**Funcionamiento:**

- **Modo local**: Filtra el array de datos según el término
- **Modo servidor**: Envía petición AJAX al servidor con el término
- Implementa debounce de 500ms en el input para optimizar rendimiento

### processPagination()

Procesa y renderiza la paginación.

```javascript
search.processPagination();
```

**Funcionamiento:**

- Calcula el número total de páginas
- Genera botones de paginación (start, prev, current, next, end)
- Renderiza los items correspondientes a la página actual
- Actualiza el DOM con los resultados paginados

### isExtractData()

Extrae datos del DOM si no hay datos en el array.

```javascript
search.isExtractData();
```

**Funcionamiento:**

- Busca elementos `.items` en el contenedor
- Extrae atributos `data-*` de cada elemento
- Captura el `innerHTML` en la propiedad `children`
- Retorna `true` si extrajo datos, `false` si ya existían datos

### _renderItems(data, callback)

Renderiza los items en el DOM.

```javascript
search._renderItems(data, (item) => {
    return `<div class="custom-item">${item.name}</div>`;
});
```

**Parámetros:**

- `data`: Array de items a renderizar
- `callback`: Función opcional para personalizar el renderizado

### Métodos de Renderizado

Estos métodos generan automáticamente los elementos HTML si no existen:

- `contentSearch()` - Genera el contenedor del input de búsqueda
- `renderSearch()` - Genera el input de búsqueda con evento de input
- `renderItems()` - Genera el contenedor de resultados
- `renderPagination()` - Genera el contenedor de paginación

## Mixins

La clase Search usa mixins para separar la lógica de búsqueda local y servidor.

### searchingLocal

Mixin que contiene la lógica para búsqueda local:

```javascript
const searchingLocal = {
    isExtractData() { /* ... */ },
    searching(searchTerm) { /* ... */ },
    processPagination() { /* ... */ }
}
```

**Características:**

- Filtra datos en el cliente usando `Array.filter()`
- Busca en todos los valores de cada objeto
- Maneja paginación local con `Array.slice()`

### searchingServer

Mixin que contiene la lógica para búsqueda por servidor:

```javascript
const searchingServer = {
    async searching(searchTerm) { /* ... */ },
    async ajax(resp) { /* ... */ },
    processPagination() { /* ... */ }
}
```

**Características:**

- Usa XMLHttpRequest para peticiones AJAX
- Soporta métodos POST, GET, PUT, PATCH
- Maneja errores HTTP y de parseo JSON
- Sincroniza página actual con el servidor

### Método ajax()

Realiza peticiones HTTP:

```javascript
async ajax(config) {
    // config: { url, method, body, header, sucess, error }
}
```

**Características:**

- Retorna una Promise
- Soporta form-urlencoded para POST
- Callbacks `sucess` y `error` opcionales
- Manejo automático de errores

## Función createElement

Función auxiliar para crear elementos HTML dinámicamente.

```javascript
import { createElement } from './renderElement.js';

const element = createElement({
    element: "div",
    className: "my-class",
    textContent: "Hello",
    dataset: { id: "123" },
    event: {
        click: () => console.log("Clicked")
    },
    children: [
        { element: "span", textContent: "Child" }
    ]
});
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `element` | String/Object | Nombre del elemento HTML o elemento existente |
| `dataset` | Object | Atributos data-* del elemento |
| `children` | Array | Array de objetos para crear elementos hijos |
| `child` | Object/HTMLElement | Elemento hijo único |
| `event` | Object | Event listeners (ej: `{ click: handler }`) |
| `...attributes` | Any | Otros atributos HTML (className, id, etc.) |

### Atributos Especiales

Algunos atributos se manejan especialmente:

- `value` - Se usa `setAttribute` para input, textarea, select
- `selected` - Se usa `setAttribute` para option

## Ejemplos Completos

### Ejemplo 1: Búsqueda Local con Datos del Array

```html
<div class="app-search">
</div>

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

### Ejemplo 2: Búsqueda Local con Datos del DOM

```html
<div class="app-search">
    <main class="items-search">
        <section class="items" data-country="VE" data-name="Venezuela"
            data-descripcion="El pais mas rico en petroleo.">
        </section>
        <section class="items" data-country="CO" data-name="Colombia"
            data-descripcion="Un pais con una gran riqueza cultural.">
        </section>
    </main>
</div>

<script type="module">
import { Search } from './src/js/app.js';

const search = new Search({
    element: '.app-search'
});

search.init();
</script>
```

### Ejemplo 3: Búsqueda por Servidor con PHP

```html
<div class="app-search">
</div>

<script type="module">
import { Search } from './src/js/app.js';

const search = new Search({
    element: '.app-search',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: {
            page: 1,
            searchTerm: ""
        }
    }
});

search.init();
</script>
```

### Ejemplo 4: Múltiples Instancias en la Misma Página

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

## Personalización

### Personalización del Renderizado de Items

Puedes personalizar cómo se renderizan los items usando el callback en `_renderItems()`:

```javascript
const search = new Search({
    element: '.app-search',
    data: [/* datos */]
});

// Sobrescribe el método _renderItems
search._renderItems = function(data, callback) {
    const container = this._body.renderItems;
    container.innerHTML = data.map((item) => {
        if (callback) return callback(item);
        return `
            <div class="custom-item">
                <h3>${item.name}</h3>
                <p>${item.descripcion}</p>
            </div>
        `;
    }).join('');
};

search.init();
```

### Clases CSS Únicas

La clase genera automáticamente clases CSS únicas para múltiples instancias:

```javascript
// Método privado que genera clases únicas
#getUniqueClassName(baseClass) {
    const parentSelector = this.element.replace(/^\.|^\#/, '');
    return `${baseClass}-${parentSelector}`;
}
```

**Ejemplo:**

- Para `.app-search1`: `input-search-app-search1`, `items-search-app-search1`
- Para `.app-search2`: `input-search-app-search2`, `items-search-app-search2`

Esto evita conflictos de estilos entre múltiples instancias.

## Notas Importantes

### Debounce en el Input

El input de búsqueda tiene un debounce de 500ms para optimizar el rendimiento:

```javascript
let timeOut;
input.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    clearTimeout(timeOut);
    timeOut = setTimeout(() => {
        this.searching(searchTerm);
    }, 500);
});
```

### Manejo de Errores

Si el contenedor especificado no existe, la clase lanza un error:

```javascript
if (!element) {
    let msgError = `No existe el contenedor ${this.element}`;
    alert(msgError);
    throw new Error(msgError);
}
```

### Compatibilidad con Módulos ES6

La clase usa módulos ES6, por lo que debes importarla con `type="module"`:

```html
<script src="./src/js/app.js" type="module"></script>
```

### Múltiples Instancias

Puedes crear múltiples instancias de Search en la misma página sin conflictos gracias a la generación automática de clases CSS únicas.

### Sincronización de itemsPerPage

El parámetro `itemsPerPage` se sincroniza automáticamente con el body de la petición AJAX en modo servidor, asegurando consistencia en la paginación.
