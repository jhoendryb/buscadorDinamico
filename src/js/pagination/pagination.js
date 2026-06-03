/**
 * Clase para manejar lógica de paginación.
 * @class
 */
export class Pagination {
    /**
     * Crea una instancia de Pagination.
     * @param {number} [itemsPerPage=10] - Items por página
     * @param {number} [firstPage=1] - Página inicial
     */
    constructor(itemsPerPage = 10, FIRST_PAGE) {
        this.currentPage = FIRST_PAGE;
        this.itemsPerPage = itemsPerPage;
    }
    /**
     * Establece la función para obtener el total de items.
     * @param {Function} countFn - Función que retorna el total de items
     * @returns {void}
     */
    setCountFunction(countFn) {
        this.countFn = countFn;
    }
    /**
     * Establece la función para obtener la data actual.
     * @param {Function} dataItemsFn - Función que retorna la data actual
     * @returns {void}
     */
    setDataItemsFunction(dataItemsFn) {
        this.dataItemsFn = dataItemsFn;
    }
    /**
     * Obtiene el total de items usando la función de conteo configurada.
     * @returns {number} Total de items
     */
    getTotalItems() {
        if (typeof this.countFn === 'function') {
            return this.countFn();
        }
        return 0;
    }
    /**
     * Obtiene el total de páginas calculado a partir del total de items.
     * @returns {number} Total de páginas (mínimo 1)
     */
    getTotalPages() {
        const totalItems = this.getTotalItems();
        return Math.ceil(totalItems / this.itemsPerPage) || 1;
    }
    /**
     * Avanza a la siguiente página si existe.
     * @returns {number} Nueva página actual
     */
    nextPage() {
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
    prevPage() {
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
    goToPage(page) {
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
    firstPage() {
        this.currentPage = 1;
        return this.currentPage;
    }
    /**
     * Va a la última página.
     * @returns {number} Nueva página actual
     */
    lastPage() {
        this.currentPage = this.getTotalPages();
        return this.currentPage;
    }
    /**
     * Obtiene los items de la página actual.
     * @param {Array<Object>} [data] - Array completo de datos (opcional, usa dataItemsFn si no se proporciona)
     * @returns {Array<Object>} Items de la página actual
     */
    getPageItems(data) {
        if (!data) return this.dataItemsFn();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = this.currentPage * this.itemsPerPage;
        return data.slice(start, end);
    }
    /**
     * Obtiene la página actual.
     * @returns {number} Página actual
     */
    getCurrentPage() {
        return this.currentPage;
    }
    /**
     * Establece los items por página y recalcula la página actual si es necesario.
     * @param {number} itemsPerPage - Items por página
     * @returns {void}
     */
    setItemsPerPage(itemsPerPage) {
        this.itemsPerPage = itemsPerPage;
        // Recalcular página actual si es necesario
        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }
    }
}
