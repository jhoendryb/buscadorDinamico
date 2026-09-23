/**
 * Clase para manejar lógica de paginación.
 * @class
 */
export declare class Pagination {
    private currentPage;
    private _itemsPerPage;
    get itemsPerPage(): number;
    private countFn?;
    private dataItemsFn?;
    private onPageChange?;
    /**
     * Crea una instancia de Pagination.
     * @param {number} [itemsPerPage=10] - Items por página
     * @param {number} [firstPage=1] - Página inicial
     */
    constructor(itemsPerPage?: number, firstPage?: number);
    /**
     * Carga la siguiente página en modo scroll infinito.
     * @returns {number} Nueva página actual o la misma si no hay más
     */
    loadNextPage(): number;
    /**
     * Verifica si hay más páginas disponibles.
     * @returns {boolean} True si hay más páginas
     */
    hasMorePages(): boolean;
    /**
     * Obtiene el total de items cargados (todas las páginas).
     * @returns {number} Total de items cargados
     */
    getTotalLoaded(): number;
    /**
     * Establece la función para obtener el total de items.
     * @param {Function} countFn - Función que retorna el total de items
     * @returns {void}
     */
    setCountFunction(countFn: () => number): void;
    /**
     * Establece la función para obtener la data actual.
     * @param {Function} dataItemsFn - Función que retorna la data actual
     * @returns {void}
     */
    setDataItemsFunction(dataItemsFn: () => Record<string, any>[]): void;
    onPageChangeCallback(callback: (page: number, totalPages: number) => void): void;
    /**
     * Obtiene el total de items usando la función de conteo configurada.
     * @returns {number} Total de items
     */
    getTotalItems(): number;
    /**
     * Obtiene el total de páginas calculado a partir del total de items.
     * @returns {number} Total de páginas (mínimo 1)
     */
    getTotalPages(): number;
    /**
     * Retrocede a la página anterior si existe.
     * @returns {number} Nueva página actual
     */
    prevPage(): number;
    /**
     * Va a una página específica si es válida.
     * @param {number} page - Página a ir (debe ser >= 1 y <= totalPages)
     * @returns {number} Nueva página actual
     */
    goToPage(page: number): number;
    /**
     * Va a la primera página.
     * @returns {number} Nueva página actual (siempre 1)
     */
    firstPage(): number;
    /**
     * Va a la última página.
     * @returns {number} Nueva página actual
     */
    lastPage(): number;
    /**
     * Obtiene los items de la página actual.
     * @param {Array<Object>} [data] - Array completo de datos (opcional, usa dataItemsFn si no se proporciona)
     * @returns {Array<Object>} Items de la página actual
     */
    getPageItems(data?: Record<string, any>[] | null): Record<string, any>[];
    getRange(): {
        from: number;
        to: number;
        total: number;
    };
    /**
     * Obtiene la página actual.
     * @returns {number} Página actual
     */
    getCurrentPage(): number;
    /**
     * Establece los items por página y recalcula la página actual si es necesario.
     * @param {number} itemsPerPage - Items por página
     * @returns {void}
     */
    setItemsPerPage(itemsPerPage: number): void;
    /**
     * Reinicia la paginación a la primera página.
     * @param {number} [firstPage=1] - Página inicial
     * @returns {void}
     */
    reset(firstPage?: number): void;
}
//# sourceMappingURL=pagination.d.ts.map