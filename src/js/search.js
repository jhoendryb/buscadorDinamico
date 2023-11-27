class Search {
    constructor(searchSelector, options = {}) {
        let { personalError, customAjax, ...newOptions } = options;
        this.customAjax = customAjax;
        this.searchInput = document.querySelector(searchSelector);
        this.options = { ...newOptions };
        this.personalError = personalError;
        this.init();
    }

    init() {
        const { searchInput, options } = this;
        // EN CASO DE QUE NO SE ENCUENTRE EL INPUT SEARCH
        if (!searchInput) {
            this.onError(1);
            return;
        }

        // EN CASO DE QUE NO EXISTA EL CONTENEDOR DE ITEMS
        if (!searchInput.parentNode.classList.contains("content-search")) {
            searchInput.parentNode.classList.add("content-search");
        }

        const parent_container = searchInput.parentNode.parentNode;

        // EN CASO DE QUE NO EXISTA EL CONTENEDOR DEL SEARCH LO GUARDAMOS
        if (!this.headerElement) {
            this.headerElement = searchInput.parentNode;
        }

        // GUARDAMOS EL CONTENDOR DE ITEMS
        this.mainElement = parent_container.querySelector(".content-items");
        if (!this.mainElement) { // SI NO EXISTE LO CREAREMOS
            this.mainElement = document.createElement("main");
            this.mainElement.classList.add("content-items");
            parent_container.appendChild(this.mainElement);
        }

        // Verificar y establecer la paginación
        const { pagination } = options;
        if (pagination) {
            if (!this.paginationElements) {
                let page = parent_container.querySelector(".content-index");

                if (!page) {
                    page = document.createElement("footer");
                    page.classList.add("content-index");
                    parent_container.appendChild(page);
                }

                let ul = page.querySelector("ul");
                if (!ul) {
                    ul = document.createElement("ul");
                    page.appendChild(ul);
                }

                this.paginationElements = {
                    footer: page,
                    ul: ul
                };
            }
        }

        // EN CASO DE QUE NO EXISTA EL CONTENEDOR PRINCIPAL LO GUARDAMOS
        if (!this.parent_container) {
            this.parent_container = parent_container;
        }

        const { personaliceElements } = options;
        if (typeof personaliceElements === "function") {
            const propertyPermisis = {
                headerElement: this.headerElement,
                mainElement: this.mainElement,
                paginationElements: this.paginationElements,
                parent_container: parent_container
            };
            personaliceElements(propertyPermisis);
        }

        this.onSearch();
    }
    onSearch() {
        let { customAjax, searchInput } = this;

        searchInput.addEventListener("keyup", (event) => this.Search(event));

        // OBTENEMOS LOS ITEMS A RENDERIZAR
        if (customAjax) {
            this.ajax();
            return;
        } else {
            this.createSearchableData();
        }

        // ACTIVAREMOS EL BUSCADOR CON LOS ITEMS INDEXADOS
        let { options, searchData } = this;
        let { data, pagination } = options;

        if (pagination) { // SI ES TRUE APLICAMOS LA PAGINACION
            this.Search({ target: { value: '' } });
        } else if (data) { // SI TIENE DATOS RENDERIZAMOS LOS ITEMS
            this.renderData(searchData);
        }
    }
    async ajax() {
        let { searchInput, customAjax, options, paginationCache } = this;
        let { url, page, countPage, ...newCustomAjax } = customAjax;
        let { pagination } = options;

        const params = new URLSearchParams();
        params.append('search', searchInput.value || '');
        params.append('page', page || 1);
        params.append('countPage', countPage || 0);
        newCustomAjax.body = params;

        if (pagination) {
            // PETICION AJAX CON JQUERY
            // let response = await $.ajax({
            //     url: url,
            //     type: newCustomAjax.method,
            //     data: {
            //         search: searchInput.value || '',
            //         page: page || 1,
            //         countPage: countPage || 0
            //     },
            //     dataType: "json",
            //     success: function (response) {

            //     }
            // });

            // console.log(response);
            // let { data, ...newCounts } = response;

            // this.options.data = data;

            // this.customAjax = {
            //     ...customAjax,
            //     ...newCounts
            // }

            // this.createSearchableData();
            // let { searchData: newSearchData } = this;

            // if (!paginationCache) {
            //     this.renderPaginacion(newSearchData);
            // } else {
            //     this.renderPaginacion(newSearchData);
            //     this.renderData(newSearchData);
            // }

            // OBTENEMOS TODOS LOS ELEMENTOS CON UN AJAX
            fetch(url, newCustomAjax).then(res => res.json()).then(data => {
                let { data: newData, ...newCounts } = data;

                this.options.data = newData;

                this.customAjax = {
                    ...customAjax,
                    ...newCounts
                }

                this.createSearchableData();

                let { searchData: newSearchData } = this;

                if (paginationCache) this.renderData(newSearchData);

                this.renderPaginacion(newSearchData);

            }).catch(err => {
                // console.log(err);
            })
        } else {
            this.onError(2);
        }

    }
    Search(event) {
        // Obtener los datos de búsqueda y las opciones
        let { searchData, options, customAjax } = this;
        let { pagination } = options;

        if (customAjax) {
            this.customAjax.page = 1;
            this.ajax();
            return;
        }

        if (!searchData) return; // EN CASO DE QUE CORRA SIN DATOS


        let searchText = event.target.value.toLowerCase();

        // Recorrer los datos de búsqueda
        let newSearchData = searchData.filter(element => {
            const filter = Object.values(element.dataSet).map(item => item.toLowerCase());
            return filter.some(item => item.includes(searchText));
        });

        // Si no se encontraron coincidencias y no hay datos para indexar, mantener los datos originales
        newSearchData = (newSearchData.length == 0 && searchData.length == 0 ? searchData : newSearchData);

        // Si se activa la paginación, restablecer la caché de paginación y renderizarla
        if (pagination) {
            this.paginationCache = null;
            this.renderPaginacion(newSearchData);
            return true;
        }

        // Renderizar los datos en caso contrario
        this.renderData(newSearchData);
    }
    renderPaginacion(newSearchData) {
        let { footer, ul } = this.paginationElements;
        let { paginationCache, customAjax } = this;

        if (customAjax && paginationCache) paginationCache.page = customAjax.page;

        ul.innerHTML = "";


        // Calcular la cantidad de páginas necesarias
        let countPage = Math.ceil(newSearchData.length / 10);
        if (customAjax) {
            let { countPage: countPageAjax } = customAjax;
            countPage = Math.ceil(countPageAjax / 10);
        }

        const renderBtn = (event) => {
            let { page } = event.target.dataset;
            let { paginationCache } = this;

            if (page != paginationCache.page) {
                // Remover la clase "active" de todos los elementos de paginación
                ul.querySelectorAll("li").forEach(element => element.classList.remove("active"));

                // Agregar la clase "active" al botón seleccionado
                event.target.classList.add("active");

                // Obtener los datos correspondientes a la página seleccionada
                let renderNewData = newSearchData.slice((page - 1) * 10, page * 10);

                // Renderizar los nuevos datos en la página
                this.renderData(renderNewData);

                // Actualizar la cache de paginación
                this.paginationCache = {
                    page: page
                }

                // Volver a renderizar la paginación
                this.renderPaginacion(newSearchData);
            }
        }
        const renderBtnAjax = (event) => {
            let { page } = event.target.dataset;
            let { paginationCache, customAjax } = this;

            if (customAjax && paginationCache) paginationCache.page = customAjax.page;

            if (page != paginationCache.page) {
                // Remover la clase "active" de todos los elementos de paginación
                ul.querySelectorAll("li").forEach(element => element.classList.remove("active"));

                // Agregar la clase "active" al botón seleccionado
                event.target.classList.add("active");

                // Renderizar los nuevos datos en la página
                this.customAjax.page = page;

                // Actualizar la cache de paginación
                this.paginationCache = {
                    page: page
                }

                this.ajax();
            }
        }

        // Renderizar los botones de página inicial y "..."
        if (paginationCache?.page >= 3 && countPage > 3) {
            let li = document.createElement("li");
            li.innerHTML = 1;
            li.dataset.page = 1;

            li.addEventListener("click", (customAjax ? renderBtnAjax : renderBtn));

            ul.appendChild(li);

            li = document.createElement("li");
            li.innerHTML = `<span>...</span>`;
            ul.appendChild(li);
        }

        // Calcular el rango de páginas a mostrar
        let start = (paginationCache?.page >= 3 ? (parseInt(paginationCache.page) - (paginationCache?.page == countPage ? 2 : 1)) : 1);
        let end = (paginationCache?.page >= 3 ? (parseInt(paginationCache.page) + 1) : 3);

        // Renderizar los botones de las páginas
        for (let index = start; index <= end; index++) {
            if (index <= countPage) {
                let li = document.createElement("li");
                li.innerHTML = index;
                li.dataset.page = index;

                // Agregar la clase "active" al botón de la página actual o la primera página
                if (paginationCache?.page == index || index == 1) {
                    ul.querySelectorAll("li").forEach(element => element.classList.remove("active"));
                    li.classList.add("active");
                }

                li.addEventListener("click", (customAjax ? renderBtnAjax : renderBtn));

                ul.appendChild(li);
            }
        }

        // Renderizar el botón "..." y la última página
        if (end < countPage) {
            let li = document.createElement("li");
            li.innerHTML = `<span>...</span>`;
            ul.appendChild(li);

            li = document.createElement("li");
            li.innerHTML = countPage;
            li.dataset.page = countPage;

            li.addEventListener("click", (customAjax ? renderBtnAjax : renderBtn));

            ul.appendChild(li);
        }

        // Renderizar la primera página si no hay página seleccionada
        if (!paginationCache?.page) {

            this.paginationCache = {
                page: paginationCache?.page || 1
            }

            this.renderData(newSearchData.slice(0, 10));
        }
    }
    renderData(searchData) {
        let { mainElement } = this;

        // Verificar si no hay datos para indexar
        if (searchData.length == 0) {
            mainElement.innerHTML = `
            <div class="card-sinData">
                <div class="info">
                    <span>SIN DATOS PARA INDEXAR <span class="icon-loading"></span></span>
                </div>
            </div>`;
            return false; // Salir del método si no hay datos
        }

        mainElement.innerHTML = ""; // Limpiar el contenido actual

        // Renderizar cada elemento en el DOM
        searchData.forEach(element => {
            mainElement.appendChild(element.element);
        });
    }
    createSearchableData() {
        // OBTENEMOS EL CONTENEDOR DE LOS ITEMS
        let { mainElement, options, searchInput } = this;
        let { data, personalItems } = options;

        // OBTENEMOS TODOS LOS ITEMS
        let searchAll = mainElement.querySelectorAll(".search");
        // CREAMOS LA ESTRUCTURA DE LOS DATOS INDEXADOS
        let searchData = [
            // {
            //     element: searchAll[0],
            //     dataSet: {
            //         name: "name",
            //         description: "description",
            //     },
            // },
        ]

        if (data) {
            Object.values(data).forEach(dataSet => {
                let element = document.createElement("div");
                element.classList.add("search");
                element.innerHTML = (typeof personalItems === "function" ?
                    personalItems(dataSet) :
                    `<span>${Object.values(dataSet).join(" ")}</span>`
                );

                searchData.push({
                    element: element,
                    dataSet: dataSet
                });
            });
        } else {
            // RECORREMOS TODOS LOS ELEMENTOS
            searchAll.forEach(element => {

                // OBTENEMOS TODOS SUS DATASET
                let dataSet = element.dataset;
                // EN CASO DE QUE NO POSEA CREAREMOS UNO CON TODO SU TEXTO
                if (Object.keys(dataSet).length == 0) {
                    // OBTENEMOS EL TEXTO PARSEADO A MINUSCULAS
                    const textContent = element.textContent.toLowerCase();
                    // SETEAMOS DATA SET CON EL NUEVO OBJETO
                    dataSet = {
                        search: textContent.split(/[ \n]+/).filter(word => {
                            let filterWord = word.replace(/[^a-zA-Z0-9]/g, '');
                            if (filterWord != '') return filterWord;
                        }).join(' ')
                    }
                }

                // ALMACENAMOS EL ELEMENTO JUNTO A SU DATASET
                searchData.push({
                    element: element,
                    dataSet: dataSet,
                });
            });
        }

        // GUARDAMOS LOS ELEMENTOS A RENDERIZAR
        this.searchData = searchData;
    }
    onError(err) {
        const errors = {
            1: "Input Search no encontrado",
            2: "Para que las peticiones por ajax funcionen, la paginacion debe estar activada.",
            3: "No se puede procesar el dato",
            ...this.personalError,
        };

        if (err) {
            alert(errors[err]);
        }

        return errors;
    }
}

const mySearch = new Search(".input-search", {
    pagination: true,
    personalError: {
        [1]: "Modificado error"
    }, /* objeto de errores personalizados */
});

let datos = {};
for (let s = 0; s < 3000; s++) {
    datos[s] = {
        name: `nombre${(s + 1)}`,
        descripcion: `descripcion${(s + 1)}`
    };
}
const mySearch2 = new Search("#input-search2", {
    pagination: true,
    personalError: {
        [1]: "Modificado error"
    },
    personalItems: function (row) { // la card personalizada
        let card;
        if (row) {
            card = `
                <div class="card">
                    <img src="https://unavatar.io/banner" alt="#perfil" class="img">
                    <div class="title">${row.name}</div>
                    <div class="content">${row.descripcion}</div>
                </div>
            `;
        }
        return card;
    },
    data: datos
});

// const mySearch3 = new Search("#input-search3", {
//     data: Object.values(datos).slice(0, 100),
//     personalItems: function (row) { // la card personalizada
//         let card;
//         if (row) {
//             card = `
//                 <div class="card">
//                     <img src="https://unavatar.io/banner" alt="#perfil" class="img">
//                     <div class="title">${row.name}</div>
//                     <div class="content">${row.descripcion}</div>
//                 </div>
//             `;
//         }
//         return card;
//     },
//     personaliceElements: (params) => {
//         let {
//             mainElement
//         } = params;

//         if (mainElement) {
//             mainElement.style.display = "grid";
//             mainElement.style.gridTemplateColumns = "repeat(3, 1fr)";
//             mainElement.style.alignContent = "start";
//         }
//     }
// });
const mySearch3 = new Search("#input-search3", {
    customAjax: {
        url: './src/php/responseAjax.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    },
    pagination: true,
    personalItems: function (row) { // la card personalizada
        let card;
        if (row) {
            card = `
                <div class="card">
                    <img src="https://flagsapi.com/${row.country_code}/flat/64.png" alt="#perfil" class="img">
                    <div class="title">${row.pais}</div>
                    <div class="content" style="padding:0; padding-left:5px">${row.name}</div>
                </div>
            `;
        }
        return card;
    },
    personaliceElements: (params) => {
        let {
            mainElement
        } = params;

        if (mainElement) {
            mainElement.style.display = "grid";
            mainElement.style.gridTemplateColumns = "repeat(2, 1fr)";
            mainElement.style.alignContent = "start";
        }
    }
});