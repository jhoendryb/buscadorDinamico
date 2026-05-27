const searchingLocal = {
    isExtractData() {
        if (this.data.length > 0) return false;

        const items = this._body.renderItems?.querySelectorAll(".items");
        const newData = Object.keys(items || {}).map((key) => {
            return { ...items[key].dataset, children: items[key].innerHTML };
        });

        this.data = newData;
        this._data = newData;
        return true;
    },
    searching(searchTerm, isEvent = false) {
        if (this.searchTerm === searchTerm && searchTerm != "") return;

        this._pagination.page = 1;

        const cacheKey = this.getCacheKey(searchTerm, this._pagination.page);
        const cachedData = this.getFromCache(cacheKey);
        if (this.cacheEnabled && cachedData) {
            this._data = cachedData;
            this.processPagination();
            return;
        }

        this._data = this.data.filter((element) => {
            const values = Object.values(element);
            return values.some((value) =>
                value.toString().toLowerCase().includes(searchTerm)
            );
        });

        if (this.sortBy) {
            this._data.sort((a, b) => {
                const valA = a[this.sortBy];
                const valB = b[this.sortBy];

                if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        this.searchTerm = searchTerm;

        if (this.cacheEnabled) {
            this.addToCache(cacheKey, this._data);
        }

        if (isEvent) {
            this.emit('search', {
                searchTerm,
                results: this._data,
                totalResults: this._data.length,
                timestamp: new Date().toISOString()
            });
        }

        this.processPagination();
    }
}

const searchingServer = {
    async searching(searchTerm, isEvent = false) {
        this.showLoading();

        if (searchTerm != this.searchTerm) {
            this._pagination.page = 1;
            this.fetch.body.page = 1;
            this.fetch.body.searchTerm = searchTerm;
        }

        if (this._pagination.page != this.fetch.body.page)
            this._pagination.page = this.fetch.body.page;

        if (this.itemsPerPage != this.fetch.body.itemsPerPage || !this.fetch.body.itemsPerPage)
            this.fetch.body.itemsPerPage = this.itemsPerPage;

        this.searchTerm = searchTerm;

        const cacheKey = this.getCacheKey(searchTerm, this._pagination.page);
        const cachedData = this.getFromCache(cacheKey);
        if (this.cacheEnabled && cachedData && !isEvent) {
            this._data = cachedData;
            this.processPagination();
            return;
        }

        if (this.sortBy && (this.sortBy.length !== this.fetch.body.sortBy?.length)) {
            this.fetch.body.sortBy = this.sortBy;
            this.fetch.body.sortOrder = this.sortOrder;
        }

        const { data, ...rest } = await this.ajax(this.fetch);
        this._data = data;
        this._ajaxResponse.success = rest;

        if (this.cacheEnabled) {
            this.addToCache(cacheKey, data);
        }

        if (isEvent) {
            this.emit('search', {
                searchTerm,
                results: this._data,
                totalResults: this._data.length,
                timestamp: new Date().toISOString()
            });
        }

        this.processPagination();
    },
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
                        this.emit('ajaxSuccess', {
                            response,
                            status: xhr.status,
                            url: resp.url
                        });
                        sucess(response, this);
                        resolve(response);
                    } catch (error) {
                        this.emit('ajaxError', {
                            error: 'Error al parsear JSON',
                            originalError: error
                        });
                        error('Error al parsear la respuesta JSON');
                        reject(new Error('Error al parsear la respuesta JSON'));
                    }
                } else {
                    this.emit('ajaxError', {
                        error: `Error HTTP: ${xhr.status}`,
                        status: xhr.status,
                        url: resp.url
                    });
                    error(`Error HTTP: ${xhr.status}`);
                    reject(new Error(`Error HTTP: ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                this.emit('ajaxError', {
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