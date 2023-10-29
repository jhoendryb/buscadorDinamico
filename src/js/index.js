// const searchInput = document.getElementById("input-search");
// searchInput.addEventListener("keyup", function (event) {
//     const elementos = document.querySelectorAll(".content-items .search");
//     const searchTerm = event.target.value.toLowerCase();
//     elementos.forEach(function (listItem) {
//         if (listItem.dataset.search.toLowerCase().indexOf(searchTerm) !== -1) {
//             listItem.style.display = "";
//         } else {
//             listItem.style.display = "none";
//         }
//     });
// });

const contentSearch = {
    onSearch: function (params) {
        const { search, pagination, personalError, element } = params;
        let { data, dataElement, dataOrigin, pageInitial } = params;

        let inputs = document.querySelectorAll(`${search}`);

        inputs.forEach(el => {
            if (!el) return contentSearch.onError(1, personalError);

            // IS EXIST PARENT
            let parent = el.parentNode;

            if (!parent.classList.contains("content-search")) {
                parent.classList.add("content-search");
            }

            let parent_container = parent.parentNode;

            let main = parent_container.querySelector(".content-items");

            if (!main) {
                main = document.createElement("main");
                main.classList.add("content-items");
                parent_container.appendChild(main);
            }

            if (!dataElement) {
                let dataSearch = main.querySelectorAll('.search');
                dataSearch.forEach(elementIndexado => {
                    let keys = Object.keys(elementIndexado.dataset);
                    if (keys == 0) {
                        let text = elementIndexado.textContent.toLowerCase().split(/[ \n]+/).filter(word => {
                            let filterWord = word.replace(/[^a-zA-Z0-9]/g, '');
                            if (filterWord != '') {
                                return filterWord;
                            }
                        }).join(' ');
                        elementIndexado.setAttribute("data-search", text);
                    }
                });
                dataSearch = main.querySelectorAll('.search');

                params.dataElement = dataSearch;
                dataElement = dataSearch;
            }

            if (data || dataOrigin) {
                main.innerHTML = "";
            }

            if (pagination) {
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

                if (typeof pageInitial == "undefined") {
                    function handleClick() {
                        let evento = 1;

                        if (event) evento = parseInt(event.target.dataset.page);

                        let newData = contentSearch.paginationDinamica(params, evento);

                        if (data || dataOrigin) {
                            main.innerHTML = "";
                        }

                        let keysIndexado = Object.keys(newData);
                        keysIndexado.forEach(function (key) {
                            let row = newData[key];
                            let item = contentSearch.itemPrinter(row, params);
                            main.appendChild(item);
                        });

                        ul.innerHTML = "";
                        let items = data || dataElement;
                        let countPage = Math.ceil((items.length || Object.keys(items).length) / 10);

                        let index = (evento == 1 ? evento : (evento == countPage ? (evento - 2) : (evento - 1))) || 1;
                        let contadorPage = 1;
                        while (index <= countPage) {

                            if (contadorPage < 4) {
                                li = document.createElement("li");
                                li.innerHTML = index;
                                li.dataset.page = index;

                                if (index == evento) {
                                    li.classList.add("active");
                                }

                                ul.appendChild(li);

                                if (index != evento) {
                                    li.addEventListener("click", handleClick);
                                }
                            }
                            index++;
                            contadorPage++;
                        }

                        if (countPage > 3) {
                            li = document.createElement("li");
                            li.innerHTML = `<span>...</span>`;
                            ul.appendChild(li);
                        }

                    }

                    params.funcionPagination = () => handleClick();
                }

                let { funcionPagination } = params;
                funcionPagination();
            }

            if (typeof element == "undefined") {
                function handleKeyUp() {
                    if (data || dataOrigin) {
                        contentSearch.searchIndex(params);
                    } else {
                        contentSearch.searchDataSet(params);
                    }
                }

                el.addEventListener("keyup", handleKeyUp);

                params.element = el;
            }

            if (data && !pagination) {
                let keys = Object.keys(data);

                keys.forEach(function (key) {
                    let row = data[key];
                    let item = contentSearch.itemPrinter(row, params);
                    main.appendChild(item);
                });
            }
        });

        contentSearch.ejemplo();
    },
    paginationDinamica: function (params, pageActual) {
        let { data, dataElement } = params;

        let pageStart = pageActual || 1;
        const indexStart = ((pageStart - 1) * 10);
        const indexEnd = (pageStart * 10);

        let items = data || dataElement;
        let dataIndexado = Object.values(items).slice(indexStart, indexEnd);

        return dataIndexado;
    },
    ajax: function () { },
    itemPrinter: function (row, params) {
        let { personalError, personalItems } = params;

        let indice = (document.querySelectorAll(".search").length + 1);
        let div = document.createElement("div");
        div.classList.add("search");
        div.setAttribute("data-search", indice.toString());

        if (row) {
            let keys = Object.keys(row);
            keys.forEach(key => {
                div.dataset[key] = row[key];
            })

            if (typeof personalItems === "function") {
                div.innerHTML = personalItems(row);
            } else {
                div.innerHTML = `<span>${row.name}</span> - <span>${row.descripcion}</span>`;
            }

            return div
        }

        if (!row)
            return contentSearch.onError(3, {
                [3]: `Elemento ${indice} no posee datos para indexar`,
                ...personalError
            });
    },
    searchIndex: function (params) {
        let { data, dataOrigin } = params;
        let search = event.target.value.toLowerCase();

        if (typeof dataOrigin == "undefined") {
            params.dataOrigin = { ...data };
        } else {
            data = { ...dataOrigin };
            params.data = { ...data };
        }

        if (search.length == 0) {
            contentSearch.onSearch(params);
            return;
        }

        let newData = Object.values(data).filter(value => {
            let indexado = Object.values(value).join(" ").toLowerCase().indexOf(search);
            if (indexado != -1) {
                return value;
            }
        });

        params.data = { ...newData };

        contentSearch.onSearch(params);
    },
    searchDataSet: function (params) {
        let { dataElement } = params;
        let search = event.target.value.toLowerCase();

        dataElement.forEach(element => {
            let dataSet = element.dataset;
            let keys = Object.keys(dataSet);
            let isSearch = keys.findIndex(key => dataSet[key].toLowerCase().indexOf(search) != -1);

            console.log(isSearch);

            if (isSearch === -1)
                element.style.display = "none";

            if (isSearch != -1)
                element.style.display = "flex";
        });

        contentSearch.ejemplo();
    },
    onError: function (err, personalError) {
        let errors = {
            [1]: "Input Search no encontrado",
            [2]: "No es posible crear el contenedor de items",
            [3]: "No se puede procesar el dato",
            ...personalError
        };

        if (err) {
            alert(errors[err]);
        }

        return errors
    },
    ejemplo: function () {
        console.log("prueba");
    }
};

// SOLO ESTO
contentSearch.onSearch({
    search: "#input-search",
    pagination: false
});

contentSearch.ejemplo = function () {
    console.log("prueba2");
}

let datos = {};
for (let s = 0; s < 50; s++) {
    datos[s] = {
        name: `nombre${(s + 1)}`,
        descripcion: `descripcion${(s + 1)}`
    };
}
contentSearch.onSearch({
    search: "#input-search2",
    pagination: true,
    // personalError: {
    //     [1]: "Input Search no encontrado, mensaje modificado"
    // },
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



// contentSearch.onSearch({
//     search: "#input-search", // el elemento del input
//     pagination: true,
//     // personalError: {
//     //     [1]: "Input Search no encontrado, mensaje modificado"
//     // },
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
//     data: datos
// });

