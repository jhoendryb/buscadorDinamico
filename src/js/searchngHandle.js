import { createElement } from './renderElement.js'

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
    searching(searchTerm) {
        const input = this._body.inputSearch;
        if (this.searchTerm === searchTerm && searchTerm != "") return;

        this._data = this.data.filter((element) => {
            const values = Object.values(element);
            return values.some((value) =>
                value.toString().toLowerCase().includes(searchTerm)
            );
        });

        this._pagination.page = 1;
        this.searchTerm = searchTerm;
        this.processPagination();
    },
    processPagination() {
        const contentPagination = this._body.paginationItems;
        const pagination = contentPagination.querySelector(".pagination");

        pagination.innerHTML = "";
        const buttonsPaginations = {
            start: 1,
            prev: this._pagination.page - 1,
            current: this._pagination.page,
            next: this._pagination.page + 1,
            end: this._pagination.countPage(),
        };

        Object.keys(buttonsPaginations).forEach((key) => {
            if (key === "prev" && buttonsPaginations[key] <= 1) return;
            if (key === "start" && buttonsPaginations[key] === buttonsPaginations.current) return;
            if (key === "end" && buttonsPaginations[key] === buttonsPaginations.current) return;
            if (key === "next" && buttonsPaginations[key] >= this._pagination.countPage()) return;

            const jsonElement = {
                element: "li",
                textContent: buttonsPaginations[key],
                className: key === "current" ? `page-selected ${key}` : key
            };

            if (key !== "current") jsonElement.event = {
                click: () => {
                    this._pagination.page = buttonsPaginations[key];
                    this.processPagination();
                }
            }

            const li = createElement(jsonElement);
            pagination.appendChild(li);
        });
        const { start, end } = this._pagination.next();
        const dataNext = this._data.slice(start, end);
        this._renderItems(dataNext);
    }
}

const searchingServer = {
    async searching(searchTerm) {
        if (searchTerm != this.searchTerm) {
            this._pagination.page = 1;
            this.fetch.body.page = 1;
            this.fetch.body.searchTerm = searchTerm;
        }

        if (this._pagination.page != this.fetch.body.page)
            this._pagination.page = this.fetch.body.page;

        if (this.itemsPerPage != this.fetch.body.itemsPerPage || !this.fetch.body.itemsPerPage)
            this.fetch.body.itemsPerPage = this.itemsPerPage;

        const { data, ...rest } = await this.ajax(this.fetch);
        this._data = data;
        this._fetch.success = rest;

        this.searchTerm = searchTerm;
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
                const params = new URLSearchParams(config.body);
                const fullUrl = `${config.url}?${params.toString()}`;
                xhr.open(config.method, fullUrl, true);
                xhr.send();
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        sucess(response, this);
                        resolve(response);

                    } catch (error) {
                        error('Error al parsear la respuesta JSON');
                        reject(new Error('Error al parsear la respuesta JSON'));
                    }
                } else {
                    error(`Error HTTP: ${xhr.status}`);
                    reject(new Error(`Error HTTP: ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                error('Error en la petición AJAX');
                reject(new Error('Error en la petición AJAX'));
            };
        });
    },
    processPagination() {
        const contentPagination = this._body.paginationItems;
        const pagination = contentPagination.querySelector(".pagination");

        pagination.innerHTML = "";
        const buttonsPaginations = {
            start: 1,
            prev: this._pagination.page - 1,
            current: this._pagination.page,
            next: this._pagination.page + 1,
            end: this._pagination.countPage(),
        };

        Object.keys(buttonsPaginations).forEach((key) => {
            if (key === "prev" && buttonsPaginations[key] <= 1) return;
            if (key === "start" && buttonsPaginations[key] === buttonsPaginations.current) return;
            if (key === "end" && buttonsPaginations[key] === buttonsPaginations.current) return;
            if (key === "next" && buttonsPaginations[key] >= this._pagination.countPage()) return;

            const jsonElement = {
                element: "li",
                textContent: buttonsPaginations[key],
                className: key === "current" ? `page-selected ${key}` : key
            };

            if (key !== "current") jsonElement.event = {
                click: () => {
                    this._pagination.page = buttonsPaginations[key];
                    this.fetch.body.page = buttonsPaginations[key];
                    this.searching(this.searchTerm);
                }
            }

            const li = createElement(jsonElement);
            pagination.appendChild(li);
        });

        this._renderItems(this._data);
    }
}

export { searchingLocal, searchingServer };