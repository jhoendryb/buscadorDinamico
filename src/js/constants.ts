/**
 * Constantes por defecto para la clase Search.
 */

// Valores por defecto
export const DEFAULT_ITEMS_PER_PAGE = 10;
export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_CACHE_MAX_SIZE = 50;
export const DEFAULT_CACHE_TTL = 50;
export const DEFAULT_Z_INDEX = 1000;
export const DEFAULT_DEVELOPMENT_MODE = true;

// Valores especiales
export const NO_SELECTION = -1;
export const FIRST_PAGE = 1;
export const SORT_ASC = -1;
export const SORT_DESC = 1;
export const SORT_ORDER = "asc";

// Traducciones por defecto
export const DEFAULT_TRANSLATIONS = {
    searchLabel: 'Filtrar por Búsqueda',
    searchPlaceholder: 'Ingrese palabra clave...',
    noResults: 'No se encontraron resultados',
    loading: 'Buscando...'
};

// Clases CSS por defecto
export const DEFAULT_CSS_CLASSES = {
    searchContainer: 'input-search',
    itemsContainer: 'items-search',
    paginationContainer: 'index-search',
    paginationList: 'pagination',
    item: 'items'
};

// Configuración de DOM
export const DOM_ORDERS = {
    SEARCH_ITEMS_PAGINATION: 'sip',
    SEARCH_CONTENT_ITEMS_PAGINATION: 'scip' // Nuevo: incluye contenedor padre
};
