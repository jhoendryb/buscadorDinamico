import { createElement } from './renderElement.js'
import { searchingLocal, searchingServer } from './searchngHandle.js'

class Search {
    constructor(params) {
        this.data = [];
        this.procesServer = false;
        this.searchTerm = "";
        this.itemsPerPage = 10;
        this._fetch = {}

        Object.assign(this, params);

        this._data = this.data;
        this._body = {
            content: document.querySelector(this.element), // ".input-search" - contenedor que contiene la app Search
            contentSearch: undefined, // ".app-search" - contenedor del Search
            inputSearch: undefined, // "#filter-search" - input donde se escribe la búsqueda
            renderItems: undefined, // ".items-search" - elemento donde se muestran los items
            paginationItems: undefined // ".index-search" - elemento donde se muestra la paginación
        };

        const element = this._body.content;

        if (!element) {
            let msgError = `No existe el contenedor ${this.element}`
            alert(msgError)
            throw new Error(msgError)
        }

        if (!this._body.contentSearch) this.contentSearch();
        if (!this._body.inputSearch) this.renderSearch();
        if (!this._body.renderItems) this.renderItems();
        if (!this._body.paginationItems) this.renderPagination();

        if (this.procesServer) Object.assign(this, searchingServer);
        else Object.assign(this, searchingLocal);

        this._pagination = {
            page: 1, // página actual
            countPage: () => Math.ceil(this._pagination.countItems() / this.itemsPerPage) || 1, // cantidad de páginas
            countItems: () => (this.procesServer ? this._fetch.success.countPage : this._data.length) || 0,
            next: () => {
                return {
                    start: ((this._pagination.page - 1) * this.itemsPerPage),
                    end: (this._pagination.page * this.itemsPerPage)
                }
            }
        }

        if (this.procesServer)
            console.log(this, "vamos a ver");
    }
    init() {
        if (this.procesServer) {
            this.searching(this.searchTerm);
            return;
        } else this.isExtractData();

        this.processPagination();

        this.searching(this.searchTerm);

        console.log('Init Search', this._data);
    }
    #getUniqueClassName(baseClass) {
        // Obtener el selector del padre sin el punto inicial
        const parentSelector = this.element.replace(/^\.|^\#/, '');
        // Crear clase única combinando la base con el selector del padre
        return `${baseClass}-${parentSelector}`;
    }
    _renderItems(data, callback = undefined) {
        const container = this._body.renderItems;
        container.innerHTML = data.map((item) => {
            return (callback ? callback(item) : `<div class="items">${Object.values(item).join(' ')}</div>`);
        }).join('');
    }
    contentSearch() {
        if (this._body.contentSearch) return;

        const element = this._body.content;

        let contentSearch = element.querySelector('.input-search');

        if (!contentSearch) {
            contentSearch = createElement({
                element: "search",
                className: "input-search" + ` ${this.#getUniqueClassName('input-search')}`,
                children: [
                    {
                        element: "label",
                        htmlFor: "filter-search",
                        textContent: "Filtrar por Busqueda"
                    }
                ]
            });
            element.appendChild(contentSearch);
        }

        this._body.contentSearch = contentSearch
    }
    renderSearch() {
        if (this._body.inputSearch) return;

        const element = this._body.contentSearch;

        let inputSearch = element.querySelector('.filter-search');
        // EVITAMOS QUE SE USE POR CADA TECLA EL BUSCADOR
        // ASI LIBERAMOS UN POCO DE CARGA AL CODIGO
        let timeOut;
        //------------------

        let jsonInput = {
            element: inputSearch,
            event: {
                input: (e) => {
                    const searchTerm = e.target.value.trim().toLowerCase();
                    clearTimeout(timeOut);
                    timeOut = setTimeout(() => {
                        this.searching(searchTerm);
                    }, 500);
                }
            },
            ...(!inputSearch ? {
                element: "input",
                name: this.#getUniqueClassName("filterSearch"),
                className: `form-control input-lg ${this.#getUniqueClassName("filter-search")}`,
                placeholder: "Ingrese palabra clave...",
            } : {})
        };

        inputSearch = createElement(jsonInput);

        if (jsonInput.element === "input") element.appendChild(inputSearch);

        this._body.inputSearch = inputSearch
    }
    renderItems() {
        if (this._body.renderItems) return;

        const element = this._body.content;

        let renderItems = element.querySelector('.items-search');

        if (!renderItems) {
            renderItems = createElement({
                element: "main",
                className: `items-search scroll-personalize ${this.#getUniqueClassName("items-search")}`,
            });
            element.appendChild(renderItems);
        }

        this._body.renderItems = renderItems
    }
    renderPagination() {
        if (this._body.paginationItems) return;

        const element = this._body.content;

        let paginationItems = element.querySelector('.index-search');

        if (!paginationItems) {
            paginationItems = createElement({
                element: "footer",
                className: `index-search ${this.#getUniqueClassName("index-search")}`,
                children: [
                    {
                        element: "ul",
                        className: `pagination ${this.#getUniqueClassName("pagination")}`
                    }
                ]
            });
            element.appendChild(paginationItems);
        }

        this._body.paginationItems = paginationItems
    }
}

const search1 = new Search({
    element: '.app-search1',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: {
            page: 2,
            searchTerm: "c"
        },
        // sucess: function (resp, instance) {
        //     if (resp) {
        //         console.log(resp)
        //     }
        // },
        // error: function (error) {
        //     console.log(error);
        // }
    },
});

const search2 = new Search({
    element: '.app-search2',
});

const search3 = new Search({
    element: '.app-search3',
});

const search4 = new Search({
    element: '.app-search4',
    data: [
        {
            country: 'VE',
            name: 'Venezuela',
            descripcion: 'El pais mas rico en petroleo.'
        },
        {
            country: 'CO',
            name: 'Colombia',
            descripcion: 'El pais mas rico en cafe.'
        },
        {
            country: 'MX',
            name: 'Mexico',
            descripcion: 'El pais mas rico en tacos.'
        },
        {
            country: 'AR',
            name: 'Argentina',
            descripcion: 'El pais mas rico en empanadas.'
        },
        {
            country: 'CL',
            name: 'Chile',
            descripcion: 'El pais mas rico en vino.'
        },
        {
            country: 'PE',
            name: 'Peru',
            descripcion: 'El pais mas rico en machi.'
        },
        {
            country: 'EC',
            name: 'Ecuador',
            descripcion: 'El pais mas rico en cacao.'
        },
        {
            country: 'BO',
            name: 'Bolivia',
            descripcion: 'El pais mas rico en plata.'
        },
        {
            country: 'CO',
            name: 'Colombia',
            descripcion: 'El pais mas rico en cafe.'
        },
        {
            country: 'MX',
            name: 'Mexico',
            descripcion: 'El pais mas rico en tacos.'
        },
        {
            country: 'AR',
            name: 'Argentina',
            descripcion: 'El pais mas rico en empanadas.'
        },
        {
            country: 'CL',
            name: 'Chile',
            descripcion: 'El pais mas rico en vino.'
        },
        {
            country: 'PE',
            name: 'Peru',
            descripcion: 'El pais mas rico en machi.'
        },
        {
            country: 'EC',
            name: 'Ecuador',
            descripcion: 'El pais mas rico en cacao.'
        },
        {
            country: 'BO',
            name: 'Bolivia',
            descripcion: 'El pais mas rico en plata.'
        },
    ]
});


search1.init();
search2.init();
search3.init();
search4.init();
