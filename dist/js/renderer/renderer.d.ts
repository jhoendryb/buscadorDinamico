import { EventEmitter } from '../events/eventEmitter';
import * as Types from '../types';
/**
 * Clase helper para crear la estructura DOM inicial de los componentes.
 * NO maneja la lógica de negocio de paginación ni renderizado de items.
 * @class
 */
export declare class SearchRenderer {
    #private;
    body: Types.BodyConfig;
    private uniqueClassNameFn;
    timeHiddenResults: number;
    /**
     * Crea una instancia de SearchRenderer.
     * @param {Types.BodyConfig} body - Objeto con referencias a elementos del DOM
     * @param {Function} uniqueClassNameFn - Función para generar nombres de clase únicos
     * @param {number} timeHiddenResults - Tiempo en milisegundos para ocultar los resultados
     */
    constructor(body: Types.BodyConfig, uniqueClassNameFn: (baseClass: string) => string, timeHiddenResults: number);
    /**
     * Agrega una clase de tema al contenedor principal y devuelve la instancia actual.
     * @param {string} theme - Nombre del tema (ej: "light", "dark")
     * @returns {SearchRenderer} Instancia actual de SearchRenderer
     */
    setTheme(theme: string): SearchRenderer;
    /**
     * Genera un nombre de clase único usando la función proporcionada.
     * @param {string} baseClass - Clase base (ej: "input-search")
     * @returns {string} Nombre de clase único
     */
    getUniqueClassName(baseClass: string): string;
    /**
     * Renderiza el contenedor del input de búsqueda (label + contenedor).
     * NO crea el input con debounce, eso lo hace renderSearch().
     * @returns {HTMLElement} Contenedor de búsqueda
     */
    contentSearch(): HTMLElement;
    /**
     * Renderiza el input de búsqueda con debounce.
     * Debe llamarse después de contentSearch().
     * @param {Object} options - Opciones de configuración
     * @param {Function} options.onInput - Callback al escribir en el input
     * @param {number} options.debounceTime - Tiempo de debounce en ms
     * @param {string} options.placeholder - Placeholder del input
     * @param {string} options.ariaLabel - Label ARIA para accesibilidad
     * @returns {HTMLElement} Input de búsqueda
     */
    renderSearch({ onInput, debounceTime, placeholder, ariaLabel }: Types.RenderSearchOptions): HTMLElement;
    /**
     * Renderiza el contenedor donde se mostrarán los resultados de búsqueda.
     * @param {number} [zIndex=999] - z-index del contenedor de items
     * @returns {HTMLElement} Contenedor de items
     */
    renderItems({ zIndex, ready }: {
        zIndex?: number;
        ready?: () => void;
    }): HTMLElement;
    /**
     * Renderiza el contenedor de paginación.
     * @returns {HTMLElement} Contenedor de paginación
     */
    renderPagination({ ready }: {
        ready?: () => void;
    }): HTMLElement;
    /**
     * Renderiza el contador de registros.
     * @returns {HTMLElement} Contador de registros
     */
    renderCounter(): HTMLElement;
    /**
     * Añade items al contenedor sin reemplazar el contenido existente.
     * @param {Record<string, any>[]} data - Items a añadir
     * @param {string|Function|null} template - Template personalizado (opcional)
     * @param {string} [noResults=Constants.DEFAULT_TRANSLATIONS.noResults] - Mensaje sin resultados
     * @param {EventEmitter} events - Instancia de EventEmitter
     * @param {boolean} [firstLoad=false] - Si es la primera carga
     * @param {Function} [highlightText] - Función para resaltar texto de búsqueda
     * @returns {boolean} Indica si se pudo añadir los items exitosamente
     */
    appendItems(data: Record<string, any>[], template: string | Function | null, noResults: string | undefined, events: EventEmitter, firstLoad?: boolean, highlightText?: ((text: string) => string) | undefined): boolean;
    /**
     * Actualiza el contador de registros.
     * @param {object} pagination - Objeto con la información de paginación
     * @param {number} pagination.from - Desde qué item se está mostrando
     * @param {number} pagination.to - Hasta qué item se está mostrando
     * @param {number} pagination.total - Total de items
     * @param {string} [pagination.textPagination] - Texto personalizado para paginación (ej: "{{to}} de {{total}}")
     * @returns {void}
     */
    updateCounter(pagination: {
        from: number;
        to: number;
        total: number;
        textPagination?: string;
    }): void;
    /**
     * Renderiza los componentes en el orden especificado por la propiedad 'dom'.
     * @param {string} domString - String con el orden (ej: 'scip' = search, ContentItemPagination, Items, Pagination)
     * @param {Object} options - Opciones para cada componente
     * @param {Object} options.search - Opciones para el componente de búsqueda
     * @returns {void}
     */
    renderByDom(domString: string, options: Record<string, any>): void;
    /**
     * Muestra el indicador de carga.
     * @param {string} loadingText - Texto a mostrar mientras se carga
     */
    showLoading(loadingText: string): void;
    /**
     * Renderiza el contenedor padre que envuelve items-search y pagination-items.
     * @returns {HTMLElement} Contenedor padre content-pagination-items
     */
    renderContentPaginationItems({ ready }: {
        ready?: () => void;
    }): HTMLElement;
    destroy(): void;
}
//# sourceMappingURL=renderer.d.ts.map