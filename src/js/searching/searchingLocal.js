/**
 * Objeto que contiene la lógica de búsqueda en modo local (client-side).
 * Se asigna dinámicamente a la instancia Search cuando procesServer es false.
 * @namespace
 */
export const searchingLocal = {
    /**
     * Extrae datos del DOM si no hay datos proporcionados.
     * Busca elementos con la clase '.items' y extrae sus atributos data-.
     * @returns {boolean} True si extrajo datos, false si ya existían
     */
    isExtractData() {
        if (this.data.length > 0) return false;

        const items = this.renderer.body.content.querySelectorAll('.items');
        if (items.length === 0) return false;

        this.data = Array.from(items).map(item => {
            const data = {};
            Array.from(item.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                    data[attr.name.replace('data-', '')] = attr.value;
                }
            });
            data.children = item.innerHTML;
            return data;
        });

        this._data = this.data;
        return true;
    },

    /**
     * Realiza búsqueda local filtrando los datos en memoria.
     * Usa caché si está habilitado y ordena si sortBy está configurado.
     * @param {string} searchTerm - Término de búsqueda
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario
     * @returns {Search} Instancia de Search para encadenamiento
     */
    searching(searchTerm, isEvent = false) {
        if (this.searchTerm === searchTerm && searchTerm != "") return this;

        this.pagination.goToPage(1)

        const cacheKey = this.getCacheKey(searchTerm, this.pagination.getCurrentPage());
        const cachedData = this.cache.get(cacheKey);
        if (this.cacheEnabled && cachedData) {
            this._data = cachedData;
            this.processPagination();
            return this;
        }

        if (this.sortBy && (this.sortBy !== this.fetch.body.sortBy)) {
            this.fetch.body.sortBy = this.sortBy;
            this.fetch.body.sortOrder = this.sortOrder;
        }

        if (!this.isExtractData()) {
            this._data = this.data;
        }

        this._data = this.data.filter((element) => {
            const values = Object.values(element);
            return values.some((value) =>
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        if (this.sortBy) {
            this.sort(this.sortBy, this.sortOrder);
        }

        this.searchTerm = searchTerm;

        if (this.cacheEnabled) {
            this.cache.set(cacheKey, this._data);
        }

        if (isEvent) {
            this.events.emit('search', {
                searchTerm,
                results: this._data,
                totalResults: this._data.length,
                timestamp: new Date().toISOString()
            });
        }

        return this;
    }
};
