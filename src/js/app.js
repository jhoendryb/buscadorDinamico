class Search {
    constructor(params) {
        this.searchTerm = "";
        this.data = params?.data || [];
        this._data = params?.data || [];
        this.procesServer = params?.procesServer || false;
        this._extractData = false;
        this._pagination = {
            page: 1, // página actual
            itemsPerPage: params?.itemsPerPage || 10, // items por página
            countPage: 0 // cantidad de páginas
        };
        this._body = {
            content: document.querySelector(params?.element) || null, // ".input-search" - elemento donde se muestra el resultado de la búsqueda
            contentSearch: undefined, // "#filter-search" - input donde se escribe la búsqueda
            inputSearch: undefined, // "#filter-search" - input donde se escribe la búsqueda
            renderItems: undefined, // ".items-search" - elemento donde se muestran los items
            paginationItems: undefined // ".index-search" - elemento donde se muestra la paginación
        };

        const element = this._body.content;

        if (element) {
            this._body.contentSearch = element.querySelector('.input-search');
            this._body.inputSearch = element.querySelector('#filter-search');
            this._body.renderItems = element.querySelector('.items-search');
            this._body.paginationItems = element.querySelector('.index-search');
        }

        this.init();
    }
    init() {
        if (this.procesServer) {
            // si es true
            return;
        }

        // si es false
        // ! IMPORTANT: si no hay datos al extraerlos volvera a pasar por aqui
        // ! TODO: si el extactData no obtiene nada entraremos en bucle, revisar
        if (!this._extractData && this.data?.length <= 0 && this._body.renderItems) {
            this._extractData = true;
            this.extractData();
        }
    }
    extractData() {
        // extraemos los datos del dom
        console.error('Extrayendo datos del DOM...');
        // TODO: Implementar la extracción de datos del DOM
        // Por ahora retornamos un array vacío como placeholder
        const items = this._body.renderItems?.querySelectorAll(".items");
        const newData = items ? Object.keys(items).map((key) => {
            return { ...items[key].dataset };
        }) : [];
        this.data = newData;
        this._data = newData;
        this._extractData = false;
        this.init();
    }
}