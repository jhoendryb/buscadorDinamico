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
    onSearch: async function (params) {
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

            if (data || dataOrigin) {
                main.innerHTML = "";
            }

            if (data) {
                let keys = Object.keys(data);

                keys.forEach(function (key) {
                    let row = data[key];
                    let item = contentSearch.itemPrinter(row, params);
                    main.appendChild(item);
                });
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
                        let { pageInitial } = params;
                        let pageStart = 1;
                        if (typeof pageInitial != "undefined") {
                            pageStart = event.target.dataset.page;
                            console.log(pageStart);
                        }
                        ul.innerHTML = "";
                        let items = data || dataElement;
                        let countPage = Math.ceil((items.length || Object.keys(items).length) / 10);

                        let li = document.createElement("li");
                        li.innerHTML = `<i class="fa fa-chevron-left" aria-hidden="true"></i>`;
                        ul.appendChild(li);
                        let index = 1;
                        while (index <= countPage) {
                            if (index < 4) {
                                li = document.createElement("li");
                                li.innerHTML = index;
                                li.dataset.page = index;
                                ul.appendChild(li);
                                li.addEventListener("click", handleClick);
                            }
                            index++;
                        }
                        li = document.createElement("li");
                        li.innerHTML = `<span>...</span>`;
                        ul.appendChild(li);
                        li = document.createElement("li");
                        li.innerHTML = `<i class="fa fa-chevron-right" aria-hidden="true"></i>`;
                        ul.appendChild(li);
                        const indexStart = ((pageStart - 1) * 10);
                        const indexEnd = (pageStart * 10);
                        console.log(indexStart, indexEnd);
                        let dataIndexado = Object.values(items).slice(indexStart, indexEnd);

                        if (data || dataOrigin) {
                            main.innerHTML = "";
                        }

                        let keysIndexado = Object.keys(dataIndexado);
                        console.log(keysIndexado);
                        keysIndexado.forEach(function (key) {
                            let row = dataIndexado[key];
                            let item = contentSearch.itemPrinter(row, params);
                            main.appendChild(item);
                        });


                        console.log("Me dieron click ?");

                        params.pageInitial = pageStart;
                    }
                    console.log("Si?");
                    handleClick();
                }

            }
        });
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
            let isSearch = keys.findIndex(key => {
                if (dataSet[key].indexOf(search) != -1)
                    return true
            });

            if (isSearch === -1)
                element.style.display = "none";

            if (isSearch != -1)
                element.style.display = "flex";
        });
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
};

// SOLO ESTO
// contentSearch.onSearch({
//     search: "#input-search",
//     pagination: true
// })

let datos = {};
for (let s = 0; s < 50; s++) {
    datos[s] = {
        name: `nombre${(s+1)}`,
        descripcion: `descripcion${(s + 1)}`
    };
}

contentSearch.onSearch({
    search: "#input-search", // el elemento del input
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
