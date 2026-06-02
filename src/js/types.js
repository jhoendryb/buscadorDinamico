/**
 * @typedef {Object} SearchParams
 * @property {string} element - Selector CSS del contenedor (requerido)
 * @property {Array} [data] - Array de datos para búsqueda local
 * @property {boolean} [procesServer=false] - Habilita búsqueda por servidor
 * @property {number} [itemsPerPage=10] - Items por página
 * @property {number} [debounceTime=500] - Tiempo de debounce en ms
 * @property {number} [cacheMaxSize=50] - Tamaño máximo del caché
 * @property {boolean} [cacheEnabled=false] - Habilita caché
 * @property {Object} [fetch] - Configuración AJAX
 * @property {string} [sortBy] - Campo para ordenamiento
 * @property {'asc'|'desc'} [sortOrder='asc'] - Orden de ordenamiento
 * @property {boolean} [keyboardEnabled=false] - Habilita navegación por teclado
 * @property {string} [dom='sip'] - Orden de renderizado (s=search, i=items, p=pagination)
 * @property {string|Function} [template] - Template personalizado
 * @property {Object} [translation] - Traducciones personalizadas
 */

/**
 * @typedef {Object} FetchConfig
 * @property {string} url - URL del endpoint (requerido)
 * @property {'GET'|'POST'|'PUT'|'PATCH'} [method='POST'] - Método HTTP
 * @property {Object} [body] - Cuerpo de la petición
 * @property {Object} [header] - Headers adicionales
 * @property {Function} [sucess] - Callback de éxito
 * @property {Function} [error] - Callback de error
 */

/**
 * @typedef {Object} TranslationConfig
 * @property {string} [searchLabel] - Etiqueta del input
 * @property {string} [searchPlaceholder] - Placeholder del input
 * @property {string} [noResults] - Mensaje sin resultados
 * @property {string} [loading] - Mensaje de carga
 */

/**
 * @typedef {Object} PaginationConfig
 * @property {number} page - Página actual
 * @property {number} countPage - Total de items
 * @property {Function} next - Función para obtener items de página actual
 */

/**
 * @typedef {Object} BodyConfig
 * @property {HTMLElement} content - Contenedor principal
 * @property {HTMLElement} [contentSearch] - Contenedor de búsqueda
 * @property {HTMLElement} [inputSearch] - Input de búsqueda
 * @property {HTMLElement} [renderItems] - Contenedor de items
 * @property {HTMLElement} [paginationItems] - Contenedor de paginación
 */

/**
 * @typedef {Object} CacheItem
 * @property {*} data - Datos almacenados
 * @property {number} timestamp - Timestamp de almacenamiento
 */

/**
 * @typedef {Object} EventCallback
 * @property {Function} callback - Función callback
 * @property {number} [id] - ID del listener
 */

/**
 * @typedef {Object} SearchResult
 * @property {Array} data - Datos de resultados
 * @property {string} searchTerm - Término de búsqueda
 * @property {number} page - Página actual
 * @property {number} totalPages - Total de páginas
 */

/**
 * @typedef {Object} AjaxResponse
 * @property {boolean} success - Si la petición fue exitosa
 * @property {Array} data - Datos de respuesta
 * @property {number} countPage - Total de items
 * @property {number} page - Página actual
 */
