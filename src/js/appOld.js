class search {
    #data;
    #pagination = {  // Un solo objeto para toda la paginación
        totalPages: 0,
        currentPage: 1,
        startIndex: 0,
        endIndex: 0
    };
    #cache = new Map();
    #cacheTimeout = 5 * 60 * 1000; // 5 minutos

    constructor(config) {

        this.itemsPerPage = config.itemsPerPage || 10;

        Object.assign(this, config);

        // OBTENEMOS LA CAJA PADRE
        this.cajaPadre = document.querySelector(this.element);

        // INICIAMOS EL BUSCADOR
        this.init();
    }

    #getCacheKey(searchTerm, page = 1, isServer = false) {
        return `${isServer ? 'server' : 'local'}-${searchTerm}-${page}`;
    }

    #setCacheData(searchTerm, data, page = 1) {
        const cacheKey = this.#getCacheKey(searchTerm, page, this.procesServer);
        this.#cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            filteredCount: data.length
        });
    }

    #getCacheData(searchTerm, page = 1) {
        const cacheKey = this.#getCacheKey(searchTerm, page, this.procesServer);
        const cachedData = this.#cache.get(cacheKey);

        if (cachedData && (Date.now() - cachedData.timestamp) < this.#cacheTimeout) {
            return cachedData;
        }

        return null;
    }

    init() {
        this.configurarElementos();

        if (this.procesServer) {

            this.ajax(this.data).then(response => {
                this.calcularPaginacion(response.countPage);
                this.actualizarDatos(response.data);
                this.initializeWithData();
            });

            return;
        }

        if (!this.#data || this.#data.length === 0) {
            this.actualizarDatos(this.data ?? this.extraerItemsData());
        }

        this.initializeWithData();
    }

    initializeWithData() {
        if (!this.#data || this.#data.length === 0) {
            throw new Error('El arreglo de datos no puede estar vacío');
        }

        // EVITAMOS QUE SE USE POR CADA TECLA EL BUSCADOR
        // ASI LIBERAMOS UN POCO DE CARGA AL CODIGO
        let timeOut;
        //------------------
        // console.log(this.inputSearch);

        this.inputSearch.addEventListener("input", (e) => {
            const searchTerm = e.target.value.trim().toLowerCase();

            clearTimeout(timeOut);

            timeOut = setTimeout(() => {
                this.#pagination.currentPage = 1;

                this.buscarEImprimir(searchTerm);
            }, 500);
        });

        this.buscarEImprimir("");

        console.log("hola me inicie");
    }

    #getUniqueClassName(baseClass) {
        // Obtener el selector del padre sin el punto inicial
        const parentSelector = this.element.replace(/^\.|^\#/, '');
        // Crear clase única combinando la base con el selector del padre
        return `${baseClass}-${parentSelector}`;
    }

    configurarElementos() {
        this.header = this.cajaPadre.querySelector(".input-search");

        if (!this.header) {
            // si no existe lo creamos
            this.header = document.createElement("search");
            this.header.classList.add("input-search");
            this.header.classList.add(this.#getUniqueClassName("input-search"));
            this.cajaPadre.appendChild(this.header);

            // label
            let label = document.createElement("label");
            label.setAttribute("for", this.#getUniqueClassName("filter-search"));
            label.innerText = "Filtrar por Busqueda";

            // input
            let input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("name", this.#getUniqueClassName("filterSearch"));
            input.setAttribute("id", this.#getUniqueClassName("filter-search"));
            input.setAttribute("class", "form-control input-lg");
            input.setAttribute("placeholder", "Ingrese palabra clave...");

            // insertamos
            this.header.appendChild(label);
            this.header.appendChild(input);
        }

        console.log(this.header);
        this.inputSearch = this.header.querySelector("input")
            // this.inputSearch = this.header.querySelector(`#${this.#getUniqueClassName("filter-search")}`);
            ;
        this.body = this.cajaPadre.querySelector(".items-search");

        if (!this.body) {
            // si no existe lo creamos
            this.body = document.createElement("main");
            this.body.classList.add("items-search");
            this.body.classList.add(this.#getUniqueClassName("items-search"));
            this.body.classList.add("scroll-personalize");
            this.cajaPadre.appendChild(this.body);
        }

        this.footer = this.cajaPadre.querySelector(".index-search");

        if (!this.footer) {
            // si no existe lo creamos
            this.footer = document.createElement("footer");
            this.footer.classList.add("index-search");
            this.footer.classList.add(this.#getUniqueClassName("index-search"));
            this.cajaPadre.appendChild(this.footer);

            // ul
            this.paginationContainer = document.createElement("ul");
            this.paginationContainer.classList.add("pagination");
            this.paginationContainer.classList.add(this.#getUniqueClassName("pagination"));

            // insertamos
            this.footer.appendChild(this.paginationContainer);
        }
    }

    buscarEImprimir(searchTerm) {
        this.body.innerHTML = "";

        // Intentar obtener datos del caché
        const cachedData = this.#getCacheData(searchTerm, this.#pagination.currentPage);

        if (cachedData) {
            if (this.procesServer) {
                this.actualizarDatos(cachedData.data);
                this.imprimirDatos(cachedData.data);
                this.renderPagination(this.#pagination.totalPages);
                return;
            } else {
                this.calcularPaginacion(cachedData.data);

                const paginatedData = cachedData.data.slice(
                    this.#pagination.startIndex,
                    this.#pagination.endIndex
                );

                this.imprimirDatos(paginatedData);
                this.renderPagination(Math.ceil(cachedData.filteredCount / this.itemsPerPage));
                return;
            }
        }

        if (this.procesServer) {
            // Datos del servidor
            this.data.body.searchTerm = searchTerm;
            this.data.body.page = this.#pagination.currentPage;

            this.ajax(this.data).then(response => {
                this.actualizarDatos(response.data);
                this.calcularPaginacion(response.countPage);
                this.#setCacheData(searchTerm, response.data, this.#pagination.currentPage);
                this.imprimirDatos(response.data);
                this.renderPagination(this.#pagination.totalPages);
            });
        } else {
            // Datos locales
            const filteredData = this.filtrarDatos(this.#data, searchTerm);
            this.calcularPaginacion(filteredData);
            this.#setCacheData(searchTerm, filteredData);

            const paginatedData = filteredData.slice(
                this.#pagination.startIndex,
                this.#pagination.endIndex
            );

            this.imprimirDatos(paginatedData);
            this.renderPagination(this.#pagination.totalPages);
        }
    }

    calcularPaginacion(totalItems) {
        const itemCount = typeof totalItems === 'object'
            ? totalItems.length
            : parseInt(totalItems);

        this.#pagination.totalPages = Math.ceil(itemCount / this.itemsPerPage);
        this.#pagination.currentPage = this.#pagination.currentPage ?? 1;
        this.#pagination.startIndex = (this.#pagination.currentPage - 1) * this.itemsPerPage;
        this.#pagination.endIndex = this.#pagination.startIndex + this.itemsPerPage;

        return this.#pagination;
    }

    filtrarDatos(data, searchTerm) {
        // Implementa la lógica de filtrado aquí
        // Por ejemplo, utilizando el método filter()
        console.log("Estoy filtrando busqueda");

        return data.filter((element) => {
            const values = Object.values(element);
            return values.some((value) =>
                value.toString().toLowerCase().includes(searchTerm)
            );
        });
    }

    imprimirDatos(data) {
        data.forEach((element) => {
            let item = document.createElement("section");
            item.classList.add("items");
            item.innerHTML = this.renderizarItem(element);
            this.body.appendChild(item);
        });
    }

    renderPagination(totalPages) {
        this.paginationContainer.innerHTML = "";

        let buttonsPaginations = {
            start: 1,
            prev: this.#pagination.currentPage - 1,
            current: this.#pagination.currentPage,
            next: this.#pagination.currentPage + 1,
            end: totalPages,
        };

        for (const key in buttonsPaginations) {
            if (Object.prototype.hasOwnProperty.call(buttonsPaginations, key)) {
                if (key === "prev" && buttonsPaginations[key] <= 1) continue;
                if (key === "start" && buttonsPaginations[key] === buttonsPaginations.current) continue;
                if (key === "end" && buttonsPaginations[key] === buttonsPaginations.current) continue;
                if (key === "next" && buttonsPaginations[key] >= totalPages) continue;

                const pageLink = document.createElement("li");

                if (key === "current") pageLink.classList.add("page-selected");

                pageLink.textContent = buttonsPaginations[key];

                if (key !== "current") {
                    pageLink.addEventListener("click", (e) => {
                        e.preventDefault();
                        this.#pagination.currentPage = buttonsPaginations[key];

                        // if (this.procesServer) this.#changeStatus.changed = true;

                        this.buscarEImprimir(this.inputSearch.value.trim().toLowerCase());
                    });
                }

                this.paginationContainer.appendChild(pageLink);
            }
        }
    }

    extraerItemsData() {
        const items = this.body.querySelectorAll(".items");
        return Object.keys(items).map((key) => {
            return { ...items[key].dataset };
        });
    }

    renderizarItem(element) {
        let itemNew = Object.values(element).join(" - ");
        // if (element) {} <- AQUI DEBE IR EL ITEM PERSONALIZADO 
        return itemNew;
    }

    ajax(resp) {
        const { sucess = function (param) { }, error = function (param) { } } = resp;

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
    }

    actualizarDatos(data) {
        this.#data = data;
    }
}

// let prueba = new search({
//     element: ".app-search",
//     procesServer: true,
//     data: {
//         url: "./src/php/responseAjax.php",
//         method: "POST",
//         body: {
//             page: 1,
//             searchTerm: ""
//         },
//         // sucess: function (resp, instance) {
//         //     if (resp) {
//         //         console.log(resp)
//         //     }
//         // },
//         // error: function (error) {
//         //     console.log(error);
//         // }
//     },
// });

let prueba2 = new search({
    element: ".app-search2",
    renderizarItem: function (element) {
        if (element) {
            return `
                <div class="img-head">
                    <img src="https://flagsapi.com/${element.country}/flat/64.png">
                </div>
                <div class="info-item">
                    <h5>${element.name}</h5>
                    <p>${element.descripcion}</p>
                </div>
            `;
        }
    }
});

let data = [
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola" },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Hola", },
    { descripcion: "Hola que hace, tu mekiere? miel de abejas", name: "Holasss", },
];

// let prueba3 = new search({
//     element: ".app-search3",
//     data: data
// });