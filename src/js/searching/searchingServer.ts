import * as Types from '../types';
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
    async searching(searchTerm: string, isEvent: boolean = false): Promise<any> {

        if (searchTerm != (this as any).searchTerm) {
            (this as any).pagination.goToPage(1);
            (this as any).fetch.body.page = 1;
            (this as any).fetch.body.searchTerm = searchTerm;

            if ((this as any).cacheEnabled) {
                (this as any).cache.clearCacheByPrefix((this as any).searchTerm);
            }
        }

        if ((this as any).pagination.getCurrentPage() != (this as any).fetch.body.page) {
            (this as any).pagination.goToPage((this as any).fetch.body.page)
        }

        if ((this as any).itemsPerPage != (this as any).fetch.body.itemsPerPage || !(this as any).fetch.body.itemsPerPage) {
            (this as any).fetch.body.itemsPerPage = (this as any).itemsPerPage;
        }

        (this as any).searchTerm = searchTerm;

        const cacheKey = (this as any).getCacheKey(searchTerm, (this as any).pagination.getCurrentPage());
        const cachedData = (this as any).cache.get(cacheKey);
        if ((this as any).cacheEnabled && cachedData && !isEvent) {
            (this as any)._data = cachedData;
            (this as any).processInfiniteScroll();
            return;
        }


        if ((this as any).sortBy && ((this as any).sortBy !== (this as any).fetch.body.sortBy)) {
            (this as any).fetch.body.sortBy = (this as any).sortBy;
            (this as any).fetch.body.sortOrder = (this as any).sortOrder;
        }

        // (this as any).showLoading();

        try {
            const { data, ...rest } = await (this as any).ajax((this as any).fetch);
            (this as any)._data = data;
            (this as any)._ajaxResponse.success = rest;

            if ((this as any).cacheEnabled) {
                (this as any).cache.set(cacheKey, data);
            }

            if (isEvent) {
                (this as any).events.emit('search', {
                    searchTerm,
                    results: (this as any)._data,
                    totalResults: (this as any)._data.length,
                    timestamp: new Date().toISOString()
                } as Types.SearchEventData);
            }
        } catch (error) {
            (this as any).events.emit('error', error as Error);
        }

        (this as any).processInfiniteScroll();

        return this;
    },

    /**
     * Realiza una petición AJAX con XMLHttpRequest.
     * @param {Types.FetchConfig} config - Configuración de la petición
     * @returns {Promise<Object>} Promesa que resuelve con la respuesta del servidor
     */
    async ajax(config: Types.FetchConfig): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(config.method, config.url, true);

            // Headers
            if (config.headers) {
                Object.entries(config.headers).forEach(([key, value]) => {
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
    },
};
