/**
 * Objeto que contiene la lógica de búsqueda en modo local (client-side).
 * Se asigna dinámicamente a la instancia Search cuando procesServer es false.
 * @namespace
 */
const searchingLocal = {
    /**
     * Extrae datos del DOM si no hay datos proporcionados.
     * Lee los elementos .items del DOM y crea objetos con sus dataset e innerHTML.
     * 
     * @public
     * @returns {boolean} Retorna true si se extrajeron datos del DOM, false si ya existían datos
     * 
     * @example
     * // Se llama automáticamente en init() cuando procesServer es false
     * this.isExtractData();
     */
    isExtractData() {
        if (this.data.length > 0) return false;

        const items = this._body.content?.querySelectorAll(".items");
        const newData = Object.keys(items || {}).map((key) => {
            return { ...items[key].dataset, children: items[key].innerHTML };
        });

        this.data = newData;
        this._data = newData;
        return true;
    },
    /**
     * Realiza búsqueda local filtrando los datos en memoria.
     * Filtra por todos los valores de cada objeto (case-insensitive).
     * Usa caché si está habilitado.
     * 
     * @public
     * @param {string} searchTerm - Término de búsqueda
     * @param {boolean} [isEvent=false] - Indica si la búsqueda fue iniciada por un evento del usuario
     * @returns {Search|void} Retorna la instancia si el término no cambió, void en caso contrario
     * @fires Search#search - Se emite cuando isEvent es true
     * 
     * @example
     * this.searching('juan', true);
     */
    searching(searchTerm, isEvent = false) {
        if (this.searchTerm === searchTerm && searchTerm != "") return this;

        this._pagination.page = 1;

        const cacheKey = this.getCacheKey(searchTerm, this._pagination.page);
        const cachedData = this.cache.get(cacheKey);
        if (this.cacheEnabled && cachedData) {
            this._data = cachedData;
            this.processPagination();
            return;
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
    }
}

/**
 * Objeto que contiene la lógica de búsqueda en modo servidor (server-side).
 * Se asigna dinámicamente a la instancia Search cuando procesServer es true.
 * @namespace
 */
const searchingServer = {
    /**
     * Realiza búsqueda en servidor vía AJAX.
     * Muestra loading, configura parámetros de la petición y maneja caché.
     * 
     * @public
     * @async
     * @param {string} searchTerm - Término de búsqueda
     * @param {boolean} [isEvent=false] - Indica si la búsqueda fue iniciada por un evento del usuario
     * @returns {Promise<void>} Una promesa que se resuelve cuando la búsqueda completa
     * @fires Search#search - Se emite cuando isEvent es true
     * @fires Search#ajaxSuccess - Se emite cuando la petición AJAX tiene éxito
     * @fires Search#ajaxError - Se emite cuando hay error en la petición AJAX
     * 
     * @example
     * await this.searching('juan', true);
     */
    async searching(searchTerm, isEvent = false) {
        this.showLoading();

        if (searchTerm != this.searchTerm) {
            this._pagination.page = 1;
            this.fetch.body.page = 1;
            this.fetch.body.searchTerm = searchTerm;
        }

        if (this._pagination.page != this.fetch.body.page) {
            this._pagination.page = this.fetch.body.page;
        }

        if (this.itemsPerPage != this.fetch.body.itemsPerPage || !this.fetch.body.itemsPerPage) {
            this.fetch.body.itemsPerPage = this.itemsPerPage;
        }

        this.searchTerm = searchTerm;

        const cacheKey = this.getCacheKey(searchTerm, this._pagination.page);
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
    },
    /**
     * Realiza una petición AJAX con XMLHttpRequest.
     * Soporta métodos GET, POST, PUT, PATCH y DELETE.
     * Maneja automáticamente headers, body y parsing de JSON.
     * 
     * @public
     * @async
     * @param {Object} resp - Configuración de la petición AJAX
     * @param {string} resp.url - URL del endpoint
     * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} resp.method - Método HTTP
     * @param {Object} [resp.body] - Cuerpo de la petición (para POST/PUT/PATCH)
     * @param {Object} [resp.header] - Headers adicionales
     * @param {Function} [resp.sucess] - Callback de éxito
     * @param {Function} [resp.error] - Callback de error
     * @returns {Promise<Object>} Una promesa que resuelve con la respuesta JSON
     * @fires Search#ajaxSuccess - Se emite cuando la petición tiene éxito
     * @fires Search#ajaxError - Se emite cuando hay error en la petición
     * 
     * @example
     * const response = await this.ajax({
     *     url: '/api/search',
     *     method: 'POST',
     *     body: { term: 'juan' }
     * });
     */
    async ajax(resp) {
        const {
            sucess = function (param) { },
            error = function (param) { }
        } = resp;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Si es POST/PUT/PATCH, necesitamos un body
            if (resp.method === 'POST' || resp.method === 'PUT' || resp.method === 'PATCH') {
                xhr.open(resp.method, resp.url, true);

                // Si no hay body, lo construimos en formato form-urlencoded
                const formData = new URLSearchParams();
                Object.entries(resp.body).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                let parseBody = formData.toString();

                // Establecemos el header para form-urlencoded
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                if (resp.header) {
                    Object.entries(resp.header).forEach(([key, value]) => {
                        formData.append(key, value);
                    });
                }

                // Enviamos el body
                xhr.send(parseBody);
            } else {
                // Para GET/DELETE, construimos la URL con parámetros
                const params = new URLSearchParams(resp.body);
                const fullUrl = `${resp.url}?${params.toString()}`;
                xhr.open(resp.method, fullUrl, true);
                xhr.send();
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        this.events.emit('ajaxSuccess', {
                            response,
                            status: xhr.status,
                            url: resp.url
                        });
                        sucess(response, this);
                        resolve(response);
                    } catch (error) {
                        this.events.emit('ajaxError', {
                            error: 'Error al parsear JSON',
                            originalError: error
                        });
                        error('Error al parsear la respuesta JSON');
                        reject(new Error('Error al parsear la respuesta JSON'));
                    }
                } else {
                    this.events.emit('ajaxError', {
                        error: `Error HTTP: ${xhr.status}`,
                        status: xhr.status,
                        url: resp.url
                    });
                    error(`Error HTTP: ${xhr.status}`);
                    reject(new Error(`Error HTTP: ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                this.events.emit('ajaxError', {
                    error: 'Error en la petición AJAX',
                    type: 'network'
                });
                error('Error en la petición AJAX');
                reject(new Error('Error en la petición AJAX'));
            };
        });
    }
}

export { searchingLocal, searchingServer };