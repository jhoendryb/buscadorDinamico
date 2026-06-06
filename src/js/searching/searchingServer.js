import * as Types from '../types.js';
/**
 * Objeto que contiene la lógica de búsqueda en modo servidor (server-side).
 * Se asigna dinámicamente a la instancia Search cuando procesServer es true.
 * @namespace
 */
export const searchingServer = {
    /**
     * Realiza búsqueda en servidor vía AJAX.
     * Usa caché para paginación si está habilitado.
     * @param {string} searchTerm - Término de búsqueda
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario
     * @returns {Promise<Search>} Promesa que resuelve con la instancia de Search
     */
    async searching(searchTerm, isEvent = false) {

        if (searchTerm != this.searchTerm) {
            this.pagination.goToPage(1)
            this.fetch.body.page = 1;
            this.fetch.body.searchTerm = searchTerm;

            // En modo scroll infinito, NO limpiar toda la caché
            if (!this.infiniteScroll) {
                this.cache.clear();
            }
        }

        if (this.pagination.getCurrentPage() != this.fetch.body.page) {
            this.pagination.goToPage(this.fetch.body.page)
        }

        if (this.itemsPerPage != this.fetch.body.itemsPerPage || !this.fetch.body.itemsPerPage) {
            this.fetch.body.itemsPerPage = this.itemsPerPage;
        }

        this.searchTerm = searchTerm;

        const cacheKey = this.getCacheKey(searchTerm, this.pagination.getCurrentPage());
        const cachedData = this.cache.get(cacheKey);
        if (this.cacheEnabled && cachedData && !isEvent) {
            this._data = cachedData;
            this.processPagination();
            return;
        }

        if (this.sortBy && (this.sortBy !== this.fetch.body.sortBy)) {
            this.fetch.body.sortBy = this.sortBy;
            this.fetch.body.sortOrder = this.sortOrder;
        }

        this.showLoading();

        try {
            const { data, ...rest } = await this.ajax(this.fetch);
            this._data = data;
            this._ajaxResponse.success = rest;

            if (this.cacheEnabled) {
                this.cache.set(cacheKey, data);
            }

            if (isEvent) {
                this.events.emit('search', {
                    searchTerm,
                    results: this._data,
                    totalResults: this._data.length,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            this.events.emit('error', error);
        }

        return this;
    },

    /**
     * Realiza una petición AJAX con XMLHttpRequest.
     * @param {Types.FetchConfig} config - Configuración de la petición
     * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor
     */
    async ajax(config) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(config.method, config.url, true);

            // Headers
            if (config.header) {
                Object.entries(config.header).forEach(([key, value]) => {
                    xhr.setRequestHeader(key, value);
                });
            }

            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (config.sucess) {
                            config.sucess(response, this);
                        }
                        resolve(response);
                    } catch (error) {
                        reject(new Error('Error al parsear JSON'));
                    }
                } else {
                    reject(new Error(`HTTP Error: ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                if (config.error) {
                    config.error(xhr);
                }
                reject(new Error('Error de red'));
            };

            // Body
            const body = new URLSearchParams(config.body).toString();
            xhr.send(body);
        });
    }
};
