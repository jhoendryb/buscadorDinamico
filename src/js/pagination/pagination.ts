/**
 * Clase para manejar lógica de paginación.
 * @class
 */
export class Pagination {
    private currentPage: number;
    public itemsPerPage: number;
    private loadedPages: Set<number>;
    private countFn?: () => number;
    private dataItemsFn?: () => Object[];
    /**
     * Crea una instancia de Pagination.
     * @param {number} [itemsPerPage=10] - Items por página
     * @param {number} [firstPage=1] - Página inicial
     */
    constructor(itemsPerPage: number = 10, firstPage: number = 1) {
        this.currentPage = firstPage;
        this.itemsPerPage = itemsPerPage;
        this.loadedPages = new Set([firstPage]); // Rastrear páginas cargadas
    }
    /**
     * Carga la siguiente página en modo scroll infinito.
     * @returns {number} Nueva página actual o la misma si no hay más
     */
    loadNextPage(): number {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.loadedPages.add(this.currentPage);
            return this.currentPage;
        }
        return this.currentPage; // No hay más páginas
    }

    /**
     * Verifica si hay más páginas disponibles.
     * @returns {boolean} True si hay más páginas
     */
    hasMorePages(): boolean {
        return this.currentPage < this.getTotalPages();
    }

    /**
     * Obtiene el total de items cargados (todas las páginas).
     * @returns {number} Total de items cargados
     */
    getTotalLoaded(): number {
        // En modo scroll infinito, calcular items de todas las páginas cargadas
        const totalItems = this.getTotalItems();
        const loadedItems = Math.min(totalItems, this.currentPage * this.itemsPerPage);
        return loadedItems;
    }
    /**
     * Establece la función para obtener el total de items.
     * @param {Function} countFn - Función que retorna el total de items
     * @returns {void}
     */
    setCountFunction(countFn: () => number): void {
        this.countFn = countFn;
    }
    /**
     * Establece la función para obtener la data actual.
     * @param {Function} dataItemsFn - Función que retorna la data actual
     * @returns {void}
     */
    setDataItemsFunction(dataItemsFn: () => Record<string, any>[]): void {
        this.dataItemsFn = dataItemsFn;
    }
    /**
     * Obtiene el total de items usando la función de conteo configurada.
     * @returns {number} Total de items
     */
    getTotalItems(): number {
        // Si hay función de conteo, usarla
        if (typeof this.countFn === 'function') {
            return this.countFn();
        }
        // Si no, usar la función de dataItems si existe y retornar su longitud
        else if (typeof this.dataItemsFn === 'function') {
            return this.dataItemsFn().length;
        }
        return 0;
    }
    /**
     * Obtiene el total de páginas calculado a partir del total de items.
     * @returns {number} Total de páginas (mínimo 1)
     */
    getTotalPages(): number {
        const totalItems = this.getTotalItems();
        return Math.ceil(totalItems / this.itemsPerPage) || 1;
    }
    /**
     * Avanza a la siguiente página si existe.
     * @returns {number} Nueva página actual
     */
    nextPage(): number {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.currentPage++;
        }
        return this.currentPage;
    }
    /**
     * Retrocede a la página anterior si existe.
     * @returns {number} Nueva página actual
     */
    prevPage(): number {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
        return this.currentPage;
    }
    /**
     * Va a una página específica si es válida.
     * @param {number} page - Página a ir (debe ser >= 1 y <= totalPages)
     * @returns {number} Nueva página actual
     */
    goToPage(page: number): number {
        const totalPages = this.getTotalPages();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
        }
        return this.currentPage;
    }
    /**
     * Va a la primera página.
     * @returns {number} Nueva página actual (siempre 1)
     */
    firstPage(): number {
        this.currentPage = 1;
        return this.currentPage;
    }
    /**
     * Va a la última página.
     * @returns {number} Nueva página actual
     */
    lastPage(): number {
        this.currentPage = this.getTotalPages();
        return this.currentPage;
    }
    /**
     * Obtiene los items de la página actual.
     * @param {Array<Object>} [data] - Array completo de datos (opcional, usa dataItemsFn si no se proporciona)
     * @returns {Array<Object>} Items de la página actual
     */
    getPageItems(data?: Record<string, any>[] | null): Record<string, any>[] {
        if (!data) return this.dataItemsFn ? this.dataItemsFn() : [];
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = this.currentPage * this.itemsPerPage;
        return data.slice(start, end);
    }
    /**
     * Obtiene la página actual.
     * @returns {number} Página actual
     */
    getCurrentPage(): number {
        return this.currentPage;
    }
    /**
     * Establece los items por página y recalcula la página actual si es necesario.
     * @param {number} itemsPerPage - Items por página
     * @returns {void}
     */
    setItemsPerPage(itemsPerPage: number): void {
        this.itemsPerPage = itemsPerPage;
        // Recalcular página actual si es necesario
        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }
    }
}
