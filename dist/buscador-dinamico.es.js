//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = class e {
	static #e = v;
	constructor(t) {
		this.searching = async () => {}, this.currentDrawId = 0, this.isLoadingMore = !1;
		let { translation: n, ...r } = t;
		this.element = void 0, this.searchTerm = "", this.data = [], this.procesServer = !1, this.keyboardEnabled = !1, this.cacheEnabled = !1, this.template = null, this.sortBy = null, this.theme = _, this.zIndex = g, this.sortOrder = "asc", this.itemsPerPage = 10, this.debounceTime = 500, this.cacheMaxSize = 50, this.cacheTtlSeconds = 300, this.dom = b.SEARCH_CONTENT_ITEMS_PAGINATION, this.selectedIndex = -1, this.developmentMode = !1, this.highlightEnabled = !1, this.highlightClass = "", Object.assign(this, r), this.boundKeydownHandler = () => {}, this.boundClickHandler = () => {}, this.errorHandler = s.getInstance(this.developmentMode), this.events = new c(this.errorHandler);
		try {
			this.#t(), this.scrollObserver = null, this._ajaxResponse = {}, this.searchingLocal = new p(this, this.errorHandler), this.searchingServer = new m(this, this.errorHandler), this.searching = this.procesServer ? this.searchingServer.searching.bind(this.searchingServer) : this.searchingLocal.searching.bind(this.searchingLocal), this.renderer = new f({
				content: document.querySelector(this.element),
				contentSearch: void 0,
				inputSearch: void 0,
				renderItems: void 0,
				paginationItems: void 0
			}, this.#o.bind(this), 200), this.cache = new i(this.cacheMaxSize, this.cacheTtlSeconds), this.pagination = new l(this.itemsPerPage, 1), this.pagination.setCountFunction(() => this.procesServer ? this._ajaxResponse.success?.countPage || 0 : this._data?.length || 0), this.pagination.setDataItemsFunction(() => this._data || []), this.t = {
				...e.#e,
				...n
			}, this._data = this.data;
		} catch (e) {
			throw e instanceof o && this.errorHandler.logError(e, this.events), e;
		}
	}
	init() {
		try {
			return this.errorHandler.validateElementExists(this.element, a.ELEMENT_NOT_FOUND), this.renderer.setTheme(this.theme), !this.procesServer && typeof this.searchingLocal.isExtractData == "function" && this.searchingLocal.isExtractData(), this.renderer.renderByDom(this.dom, {
				zIndex: this.zIndex,
				search: {
					onInput: (e, t) => this.draw(e, t),
					debounceTime: this.debounceTime,
					placeholder: this.t.searchPlaceholder,
					ariaLabel: this.t.searchLabel
				}
			}), this.setupKeyboardNavigation(), this.draw(this.searchTerm), this.events.emit("init", {
				searchTerm: this.searchTerm,
				itemsPerPage: this.itemsPerPage,
				procesServer: this.procesServer
			}), this;
		} catch (e) {
			throw e instanceof o && this.errorHandler.logError(e), e;
		}
	}
	#t() {
		this.errorHandler.validateRequired(this.element, "element", a.ELEMENT_REQUIRED), this.errorHandler.validateType(this.element, "string", "element", a.ELEMENT_TYPE_INVALID), this.procesServer && this.errorHandler.validateRequired(this.fetch?.url, "fetch.url", a.FETCH_URL_REQUIRED), this.itemsPerPage && (this.errorHandler.validateType(this.itemsPerPage, "number", "itemsPerPage", a.ITEMSPERPAGE_TYPE_INVALID), this.errorHandler.validateRange(this.itemsPerPage, 1, "itemsPerPage", a.ITEMSPERPAGE_VALUE_INVALID)), this.highlightClass && this.errorHandler.validateType(this.highlightClass, "string", "highlightClass", a.INVALID_TYPE_FORMAT);
	}
	#n(e) {
		if (!this.highlightEnabled || !this.searchTerm) return e;
		let t = this.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), n = RegExp(`(${t})`, "gi");
		return e.replace(n, `<span class="${["search-highlight", this.highlightClass].filter((e) => e).join(" ")}">$1</span>`);
	}
	async draw(e = this.searchTerm, t = !1) {
		let n = ++this.currentDrawId;
		return e !== this.searchTerm && this.renderer.body.renderItems && (this.renderer.body.renderItems.scrollTop = 0, this.renderer.body.renderItems.innerHTML = "", this.events.emit("resultsCleared", { previousSearchTerm: this.searchTerm }), this.renderer.body.renderItems.removeAttribute("aria-activedescendant"), this.pagination.goToPage(1), this.selectedIndex = -1), await this.searching(e, t), n === this.currentDrawId ? (this.processInfiniteScroll(), this.events.emit("searchComplete", {
			searchTerm: e,
			results: this._data,
			totalResults: this._data?.length
		}), this) : (console.log("Abortada", e, n, this.currentDrawId), this);
	}
	processInfiniteScroll() {
		if (!this.pagination) return;
		let e = this.pagination.getPageItems(this.procesServer ? null : this._data);
		this.renderer.appendItems(e, this.template, this.t.noResults, this.events, this.pagination.getCurrentPage() === 1, this.#n.bind(this));
		let t = this.pagination.getTotalLoaded(), n = this.pagination.getTotalItems();
		this.renderer.updateCounter(t, n, this.t.pagination), this.#r(), this.events.emit("pageChange", {
			page: this.pagination.getCurrentPage(),
			totalPages: this.pagination.getTotalPages(),
			itemsOnPage: e.length,
			totalLoaded: t
		});
	}
	#r() {
		let e = this.renderer.body.renderItems;
		if (!e) return this;
		if (typeof IntersectionObserver > "u") return console.warn("IntersectionObserver no está disponible. Scroll infinito no funcionará en este entorno."), this;
		let t = e.querySelector(".scroll-sentinel");
		t && (this.scrollObserver?.unobserve(t), t.remove()), this.scrollObserver ||= new IntersectionObserver((e) => {
			e.forEach((e) => {
				e.isIntersecting && this.pagination.hasMorePages() && this.#i();
			});
		}, {
			root: e,
			rootMargin: "100px",
			threshold: .1
		});
		let n = r({
			element: "div",
			className: "scroll-sentinel",
			attributes: { style: "height: 1px; visibility: hidden; padding: 0; margin: 0;" }
		});
		return e.appendChild(n), this.scrollObserver.observe(n), this;
	}
	async #i() {
		if (this.isLoadingMore || !this.pagination.hasMorePages()) return this;
		this.isLoadingMore = !0;
		try {
			let e = this.pagination.loadNextPage(), t = this.pagination.getPageItems(this.procesServer ? null : this._data);
			this.procesServer && (this.fetch?.body && (this.fetch.body.page = e), await this.searching(this.searchTerm, !1)), this.renderer.appendItems(t, this.template, this.t.noResults, this.events, this.pagination.getCurrentPage() === 1, this.#n.bind(this)), this.#r();
			let n = this.pagination.getTotalLoaded(), r = this.pagination.getTotalItems();
			return this.renderer.updateCounter(n, r, this.t.pagination), this;
		} finally {
			this.isLoadingMore = !1;
		}
	}
	#a() {
		return this.scrollObserver && this.scrollObserver.disconnect(), this;
	}
	#o(e) {
		return `${e}-${this.element.replace(/^[.#]/, "")}`;
	}
	on(e, t) {
		return this.events.on(e, t);
	}
	showLoading() {
		if (this.renderer.body.renderItems) {
			let e = r({
				element: "div",
				className: "search-loading",
				children: [{
					element: "div",
					className: "spinner"
				}, {
					element: "p",
					textContent: this.t.loading
				}]
			});
			this.renderer.body.renderItems.innerHTML = e.outerHTML;
		}
		return this;
	}
	getCacheKey(e, t) {
		return `${e}_${t}`;
	}
	sort(e, t = "asc") {
		return this.sortBy = e, this.sortOrder = t, this.procesServer ? this.draw(this.searchTerm, !0) : this._data?.sort((n, r) => {
			let i = n[e], a = r[e];
			return i < a ? t === "asc" ? -1 : 1 : i > a ? t === "asc" ? 1 : -1 : 0;
		}), this.events.emit("sortChange", {
			field: e,
			order: t
		}), this;
	}
	clearSort() {
		return this.sortBy = null, this.sortOrder = "asc", this.procesServer && this.fetch?.body && (this.fetch.body.sortBy = null, this.fetch.body.sortOrder = "asc"), this.cache.clear(), this;
	}
	setupKeyboardNavigation() {
		if (!this.keyboardEnabled) return this;
		let e = this.renderer.body.content, t = this.renderer.body.renderItems, n = this.renderer.body.inputSearch, r = (e) => {
			e && (e.value = "", e.dispatchEvent(new Event("input")), e.blur());
		};
		return this.boundKeydownHandler = (e) => {
			if (!t) return;
			let i = t.querySelectorAll(".items");
			e.key === "ArrowDown" ? (e.preventDefault(), this.selectedIndex = Math.min(this.selectedIndex + 1, i.length - 1), this.#s(i)) : e.key === "ArrowUp" ? (e.preventDefault(), this.selectedIndex = Math.max(this.selectedIndex - 1, 0), this.#s(i)) : ["enter"].includes(e.key.toLowerCase()) && this.selectedIndex >= 0 && (e.preventDefault(), this.#c(i[this.selectedIndex]), r(n));
		}, this.boundClickHandler = (e) => {
			if (e.preventDefault(), !t) return;
			let i = e.target.closest(".items"), a = t.querySelectorAll(".items");
			i && (this.selectedIndex = Array.from(a).indexOf(i), this.#s(a), this.#c(i), r(n));
		}, t?.addEventListener("click", this.boundClickHandler), e.addEventListener("keydown", this.boundKeydownHandler), this;
	}
	#s(e) {
		e.forEach((e, t) => {
			t === this.selectedIndex ? (e.classList.add("selected"), this.renderer.body.renderItems?.setAttribute("aria-activedescendant", e.id), e.scrollIntoView({
				behavior: "smooth",
				block: "nearest"
			}), this.events.emit("itemHighlighted", {
				item: e,
				index: t
			})) : e.classList.remove("selected");
		});
	}
	#c(e) {
		this.events.emit("itemSelected", {
			item: e,
			index: this.selectedIndex,
			close: () => this.renderer.hideResults()
		});
	}
	clear() {
		return this.searchTerm = "", this.renderer.body.inputSearch && (this.renderer.body.inputSearch.value = ""), this.renderer.body.renderItems && (this.renderer.body.renderItems.innerHTML = ""), this.pagination.goToPage(1), this.cache.clear(), this.selectedIndex = -1, this;
	}
	destroy() {
		if (this.events.emit("destroy", { timestamp: (/* @__PURE__ */ new Date()).toISOString() }), this.renderer.body.content.removeEventListener("keydown", this.boundKeydownHandler), this.renderer.body.renderItems?.removeEventListener("click", this.boundClickHandler), this.scrollObserver &&= (this.#a(), null), this.renderer.animationTimeouts && (this.renderer.animationTimeouts.forEach((e) => clearTimeout(e)), this.renderer.animationTimeouts = []), this.renderer.hideTimeout && (clearTimeout(this.renderer.hideTimeout), this.renderer.hideTimeout = null), this.renderer.body.inputSearch) {
			let e = this.renderer.body.inputSearch.cloneNode(!0);
			this.renderer.body.inputSearch.parentNode && this.renderer.body.inputSearch.parentNode.replaceChild(e, this.renderer.body.inputSearch);
		}
		this.events.removeAllListeners(), this._data = null, this.data = [], this.cache = new i(this.cacheMaxSize, this.cacheTtlSeconds), this.pagination = new l(), this.events = new c(), this.renderer = new f({
			content: document.querySelector(this.element),
			contentSearch: void 0,
			inputSearch: void 0,
			renderItems: void 0,
			paginationItems: void 0
		}, this.#o.bind(this), 200);
	}
};
//#endregion
//#region src/js/renderElement.ts
function r({ element: e, dataset: t, children: n, child: i, event: a, attributes: o, style: s, ...c }) {
	let l = {
		value: [
			"input",
			"textarea",
			"select"
		],
		selected: ["option"]
	}, u = typeof e == "object", d = u ? e : document.createElement(e);
	return Object.keys(l).forEach((t) => {
		let n = (u ? e.tagName : e).toLowerCase();
		c[t] && l[t].includes(n) && (d.setAttribute(t, c[t]), delete c[t]);
	}), o && Object.keys(o).forEach((e) => {
		d.setAttribute(e, o[e]);
	}), Object.assign(d, c), t && Object.assign(d.dataset, t), i && d.appendChild(i), s && Object.assign(d.style, s), a && Object.keys(a).forEach((e) => {
		d.addEventListener(`${e}`, a[e]);
	}), n && n.forEach((e) => {
		let t = r(e);
		d.appendChild(t);
	}), d;
}
//#endregion
//#region src/js/cache/cache.ts
var i = class {
	constructor(e = 50, t = 300) {
		this.cache = /* @__PURE__ */ new Map(), this.maxSize = e, this.ttlSeconds = t;
	}
	set(e, t) {
		if (this.cleanup(), this.cache.size >= this.maxSize) {
			let e = this.cache.keys().next().value;
			e && this.delete(e);
		}
		this.cache.set(e, {
			value: t,
			expiresAt: Date.now() + this.ttlSeconds * 1e3
		});
	}
	get(e) {
		let t = this.cache.get(e);
		if (t) {
			if (Date.now() > t.expiresAt) {
				this.delete(e);
				return;
			}
			return this.delete(e), this.cache.set(e, {
				value: t.value,
				expiresAt: Date.now() + this.ttlSeconds * 1e3
			}), t.value;
		}
	}
	has(e) {
		let t = this.cache.get(e);
		return !t || Date.now() > t.expiresAt ? !1 : (this.delete(e), this.cache.set(e, {
			value: t.value,
			expiresAt: Date.now() + this.ttlSeconds * 1e3
		}), !0);
	}
	size() {
		return this.cleanup(), this.cache.size;
	}
	clear() {
		this.cache.clear();
	}
	clearCacheByPrefix(e) {
		if (!e) return this;
		for (let t of this.cache.keys()) t.startsWith(e) && this.delete(t);
		return this;
	}
	delete(e) {
		return this.cache.delete(e);
	}
	cleanup() {
		let e = Date.now();
		for (let [t, n] of this.cache.entries()) e > n.expiresAt && this.delete(t);
	}
}, a = /* @__PURE__ */ function(e) {
	return e.ELEMENT_REQUIRED = "SEARCH_001", e.ELEMENT_TYPE_INVALID = "SEARCH_002", e.FETCH_URL_REQUIRED = "SEARCH_003", e.ITEMSPERPAGE_TYPE_INVALID = "SEARCH_004", e.ITEMSPERPAGE_VALUE_INVALID = "SEARCH_005", e.INVALID_TYPE_FORMAT = "SEARCH_006", e.ELEMENT_NOT_FOUND = "SEARCH_010", e.CONTAINER_NOT_FOUND = "SEARCH_011", e.NETWORK_ERROR = "SEARCH_020", e.FETCH_FAILED = "SEARCH_021", e.INVALID_DATA_FORMAT = "SEARCH_030", e.EMPTY_RESPONSE = "SEARCH_031", e.INITIALIZATION_FAILED = "SEARCH_040", e.RENDER_ERROR = "SEARCH_041", e;
}({}), o = class extends Error {
	constructor(e, t) {
		super(e.message), this.name = "SearchError", this.code = e.code, this.solution = e.solution, this.documentation = e.documentation, this.context = t;
	}
}, s = class e {
	constructor(e = !0) {
		this.developmentMode = e, this.errorMessages = /* @__PURE__ */ new Map(), this.initializeErrorMessages();
	}
	static getInstance(t) {
		return e.instance ||= new e(t ?? !0), e.instance;
	}
	initializeErrorMessages() {
		this.errorMessages.set(a.ELEMENT_REQUIRED, {
			code: a.ELEMENT_REQUIRED,
			message: "El parámetro 'element' es requerido",
			solution: "Proporciona el selector CSS del contenedor donde se renderizará el buscador.\nEjemplo: { element: '.mi-buscador' }",
			documentation: "#configuration-element"
		}), this.errorMessages.set(a.ELEMENT_TYPE_INVALID, {
			code: a.ELEMENT_TYPE_INVALID,
			message: "El parámetro 'element' debe ser un string con el selector CSS",
			solution: "El parámetro element debe ser un string válido de selector CSS.\nEjemplo: '.mi-buscador', '#buscador-id', '[data-search]'",
			documentation: "#configuration-element"
		}), this.errorMessages.set(a.FETCH_URL_REQUIRED, {
			code: a.FETCH_URL_REQUIRED,
			message: "El parámetro 'fetch.url' es requerido cuando procesServer es true",
			solution: "Configura la URL del endpoint de búsqueda.\nEjemplo: { fetch: { url: '/api/search' } }",
			documentation: "#configuration-fetch"
		}), this.errorMessages.set(a.ITEMSPERPAGE_TYPE_INVALID, {
			code: a.ITEMSPERPAGE_TYPE_INVALID,
			message: "El parámetro 'itemsPerPage' debe ser un número",
			solution: "El parámetro itemsPerPage debe ser de tipo number.\nEjemplo: { itemsPerPage: 10 }",
			documentation: "#configuration-pagination"
		}), this.errorMessages.set(a.ITEMSPERPAGE_VALUE_INVALID, {
			code: a.ITEMSPERPAGE_VALUE_INVALID,
			message: "El parámetro 'itemsPerPage' debe ser mayor a 0",
			solution: "El parámetro itemsPerPage debe ser un número positivo mayor a 0.\nEjemplo: { itemsPerPage: 10 }",
			documentation: "#configuration-pagination"
		}), this.errorMessages.set(a.INVALID_TYPE_FORMAT, {
			code: a.INVALID_TYPE_FORMAT,
			message: "El parámetro tiene un formato de tipo inválido",
			solution: "Verifica que el parámetro tenga el formato correcto.",
			documentation: "#configuration-invalid-type"
		}), this.errorMessages.set(a.ELEMENT_NOT_FOUND, {
			code: a.ELEMENT_NOT_FOUND,
			message: "No existe el contenedor especificado",
			solution: "Verifica que el selector CSS sea correcto y que el elemento exista en el DOM antes de inicializar el componente.",
			documentation: "#troubleshooting-dom"
		}), this.errorMessages.set(a.CONTAINER_NOT_FOUND, {
			code: a.CONTAINER_NOT_FOUND,
			message: "No existe el contenedor principal",
			solution: "Asegúrate de que el elemento especificado exista en el DOM antes de inicializar el componente.",
			documentation: "#troubleshooting-dom"
		}), this.errorMessages.set(a.NETWORK_ERROR, {
			code: a.NETWORK_ERROR,
			message: "Error de conexión al servidor",
			solution: "Verifica tu conexión a internet y que el servidor esté disponible.",
			documentation: "#troubleshooting-network"
		}), this.errorMessages.set(a.FETCH_FAILED, {
			code: a.FETCH_FAILED,
			message: "Error al obtener datos del servidor",
			solution: "Verifica que la URL del endpoint sea correcta y que el servidor responda con el formato esperado.",
			documentation: "#troubleshooting-fetch"
		}), this.errorMessages.set(a.INVALID_DATA_FORMAT, {
			code: a.INVALID_DATA_FORMAT,
			message: "Formato de datos inválido",
			solution: "Verifica que los datos tengan el formato esperado por el componente.",
			documentation: "#data-format"
		}), this.errorMessages.set(a.EMPTY_RESPONSE, {
			code: a.EMPTY_RESPONSE,
			message: "La respuesta del servidor está vacía",
			solution: "Verifica que el endpoint devuelva datos en el formato esperado.",
			documentation: "#data-format"
		}), this.errorMessages.set(a.INITIALIZATION_FAILED, {
			code: a.INITIALIZATION_FAILED,
			message: "Error al inicializar el componente",
			solution: "Verifica la configuración y los parámetros proporcionados.",
			documentation: "#troubleshooting-initialization"
		}), this.errorMessages.set(a.RENDER_ERROR, {
			code: a.RENDER_ERROR,
			message: "Error al renderizar el componente",
			solution: "Verifica que el DOM esté disponible y que no haya conflictos con otros componentes.",
			documentation: "#troubleshooting-render"
		});
	}
	validateRequired(e, t, n) {
		if (!e) throw new o(this.errorMessages.get(n), {
			paramName: t,
			providedValue: e
		});
	}
	validateType(e, t, n, r) {
		if (typeof e !== t) throw new o(this.errorMessages.get(r), {
			paramName: n,
			expectedType: t,
			providedType: typeof e
		});
	}
	validateRange(e, t, n, r) {
		if (e < t) throw new o(this.errorMessages.get(r), {
			paramName: n,
			minValue: t,
			providedValue: e
		});
	}
	validateElementExists(e, t) {
		if (!document.querySelector(e)) throw new o(this.errorMessages.get(t), { selector: e });
	}
	throwCustomError(e, t) {
		throw new o(this.errorMessages.get(e), t);
	}
	logError(e, t) {
		this.developmentMode && (console.error(`[${e.code}] ${e.message}`), console.error(`Solución: ${e.solution}`), e.context && console.error("Contexto:", e.context)), t?.emit("error", {
			code: e.code,
			message: e.message,
			solution: e.solution,
			context: e.context
		});
	}
	formatError(e) {
		let t = `[${e.code}] ${e.message}\n`;
		return t += `Solución: ${e.solution}`, this.developmentMode && e.context && (t += `\nContexto: ${JSON.stringify(e.context, null, 2)}`), e.documentation && (t += `\nDocumentación: https://tu-documentacion.com${e.documentation}`), t;
	}
}, c = class {
	constructor(e) {
		this.events = {}, this.errorHandler = e || s.getInstance(!0);
	}
	on(e, t) {
		return this.events[e] || (this.events[e] = []), this.events[e].push(t), this;
	}
	off(e, t) {
		return this.events[e] && (this.events[e] = this.events[e].filter((e) => e !== t)), this;
	}
	once(e, t) {
		let n = (r) => {
			t(r), this.off(e, n);
		};
		return this.on(e, n);
	}
	emit(e, t) {
		let n = this.events[e];
		n && n.forEach((e) => {
			try {
				this.errorHandler.validateType(e, "function", "callback", a.INVALID_TYPE_FORMAT), e(t);
			} catch (e) {
				throw e instanceof o && this.errorHandler.logError(e, this), e;
			}
		});
	}
	removeAllListeners(e) {
		e ? delete this.events[e] : this.events = {};
	}
	listenerCount(e) {
		return this.events[e] ? this.events[e].length : 0;
	}
	eventNames() {
		return Object.keys(this.events);
	}
}, l = class {
	constructor(e = 10, t = 1) {
		this.currentPage = t, this.itemsPerPage = e;
	}
	loadNextPage() {
		let e = this.getTotalPages();
		return this.currentPage < e && this.currentPage++, this.currentPage;
	}
	hasMorePages() {
		return this.currentPage < this.getTotalPages();
	}
	getTotalLoaded() {
		let e = this.getTotalItems();
		return Math.min(e, this.currentPage * this.itemsPerPage);
	}
	setCountFunction(e) {
		this.countFn = e;
	}
	setDataItemsFunction(e) {
		this.dataItemsFn = e;
	}
	getTotalItems() {
		return typeof this.countFn == "function" ? this.countFn() : typeof this.dataItemsFn == "function" ? this.dataItemsFn().length : 0;
	}
	getTotalPages() {
		let e = this.getTotalItems();
		return Math.ceil(e / this.itemsPerPage) || 1;
	}
	prevPage() {
		return this.currentPage > 1 && this.currentPage--, this.currentPage;
	}
	goToPage(e) {
		let t = this.getTotalPages();
		return e >= 1 && e <= t && (this.currentPage = e), this.currentPage;
	}
	firstPage() {
		return this.currentPage = 1, this.currentPage;
	}
	lastPage() {
		return this.currentPage = this.getTotalPages(), this.currentPage;
	}
	getPageItems(e) {
		if (!e) return this.dataItemsFn ? this.dataItemsFn() : [];
		let t = (this.currentPage - 1) * this.itemsPerPage, n = this.currentPage * this.itemsPerPage;
		return e.slice(t, n);
	}
	getCurrentPage() {
		return this.currentPage;
	}
	setItemsPerPage(e) {
		e < 1 && (e = 1), this.itemsPerPage = e;
		let t = this.getTotalPages();
		this.currentPage > t && (this.currentPage = t);
	}
}, u = /* @__PURE__ */ t({ DomComponent: () => d }), d = /* @__PURE__ */ function(e) {
	return e.SEARCH = "s", e.CONTENT = "c", e.ITEMS = "i", e.PAGINATION = "p", e;
}({}), f = class {
	constructor(e, t, n) {
		this.body = e, this.uniqueClassNameFn = t, this.isVisible = !1, this.hideTimeout = null, this.animationTimeouts = [], this.timeHiddenResults = n;
	}
	setTheme(e) {
		let t = Array.from(this.body.content.classList).find((e) => e.startsWith("theme-"));
		return t && this.body.content.classList.remove(t), e && e !== "default" && this.body.content.classList.add(`theme-${e}`), this;
	}
	getUniqueClassName(e) {
		return this.uniqueClassNameFn(e);
	}
	#e(e, t = "") {
		return `${e} ${t}`.trim().split(" ").filter((e, n, r) => !t.includes(e) || r.indexOf(e) === n).join(" ");
	}
	contentSearch() {
		if (this.body.contentSearch) return this.body.contentSearch;
		let e = this.body.content, t = e.querySelector(".input-search"), n = r({
			element: t,
			className: this.#e(`input-search ${this.getUniqueClassName("input-search")}`, t?.className),
			...t ? {} : { element: "search" }
		});
		return t || e.appendChild(n), this.body.contentSearch = n, n;
	}
	renderSearch({ onInput: e, debounceTime: t, placeholder: n, ariaLabel: i }) {
		if (this.body.inputSearch) return this.body.inputSearch;
		let a = this.body.contentSearch, o = a?.querySelector(".filter-search"), s, c = {
			element: o,
			id: this.getUniqueClassName("input-search"),
			placeholder: n || "Ingrese palabra clave...",
			className: this.#e(`${this.getUniqueClassName("filter-search")}`, o?.className),
			attributes: {
				"aria-label": i || "Filtrar por Búsqueda",
				role: "searchbox",
				"aria-controls": this.getUniqueClassName("items-search")
			},
			event: {
				input: (n) => {
					let r = n.target.value.trim().toLowerCase();
					clearTimeout(s), s = setTimeout(() => {
						e && e(r, n instanceof Event);
					}, t);
				},
				focus: () => {
					(this.body.renderItems?.querySelectorAll(".items").length || 0) > 0 && this.showResults();
				},
				blur: () => {
					this.hideResultsWithDelay();
				}
			},
			...o ? {} : {
				element: "input",
				name: this.getUniqueClassName("filterSearch")
			}
		};
		return o = r(c), c.element === "input" && a && a.appendChild(o), this.body.inputSearch = o, o;
	}
	renderItems(e = 999) {
		if (this.body.renderItems) return this.body.renderItems;
		this.body.contentPaginationItems || this.renderContentPaginationItems();
		let t = this.body.contentPaginationItems, n = t?.querySelector(".items-search"), i = r({
			element: n,
			className: this.#e(`items-search scroll-personalize ${this.getUniqueClassName("items-search")}`, n?.className),
			attributes: {
				"aria-label": "Resultados de búsqueda",
				role: "listbox",
				"aria-activedescendant": "",
				"aria-hidden": "true"
			},
			style: { zIndex: e },
			...n ? {} : {
				element: "ul",
				id: this.getUniqueClassName("items-search")
			}
		});
		return !n && t && t.appendChild(i), this.body.renderItems = i, i;
	}
	renderPagination() {
		this.body.contentPaginationItems || this.renderContentPaginationItems();
		let e = this.body.contentPaginationItems, t = e?.querySelector(".pagination-items"), n = r({
			element: t,
			className: this.#e("pagination-items", t?.className),
			attributes: {
				role: "status",
				"aria-live": "polite"
			},
			innerHTML: this.renderCounter().outerHTML,
			...t ? {} : { element: "div" }
		});
		return !t && e && e.appendChild(n), this.body.paginationItems = n, n;
	}
	renderCounter() {
		let e = this.body.contentPaginationItems?.querySelector(".items-counter");
		return r({
			element: e,
			className: this.#e("items-counter", e?.className),
			...e ? {} : { element: "div" }
		});
	}
	appendItems(e, t, n = "No hay resultados.", i, a = !1, o) {
		let s = this.body.renderItems;
		if (!s) return !1;
		a && (s.innerHTML = "");
		let c = {
			element: "li",
			className: "items",
			tabindex: "0",
			attributes: { role: "option" },
			event: { pointerdown: (e) => {
				e.preventDefault(), this.isVisible = !0;
			} }
		};
		if (s.children.length === 0 && (!e || e.length === 0)) return c.textContent = n, s.appendChild(r(c)), !1;
		let l = this.body.renderItems?.children.length, u = l ? l - 1 : 0;
		return e.forEach((e) => {
			c.id = this.getUniqueClassName(`items-${u++}`);
			let n = r(c);
			if (t) {
				if (typeof t == "function") n.innerHTML = t(e, o);
				else if (typeof t == "string") {
					let r = t;
					Object.keys(e).forEach((t) => {
						let n = o ? o(e[t]) : e[t];
						r = r.replace(`{{${t}}}`, n);
					}), n.innerHTML = r;
				}
			} else {
				let t = Object.values(e).join(" ");
				n.textContent = o ? o(t) : t;
			}
			s.appendChild(n);
		}), i.emit("appendItems", {
			items: e,
			content: s
		}), !0;
	}
	updateCounter(e, t, n) {
		let r = this.body.paginationItems?.querySelector(".items-counter");
		n ||= "{{count}} de {{total}}", r && n && (r.textContent = n.replace("{{count}}", e.toString()).replace("{{total}}", t.toString()));
	}
	renderByDom(e, t) {
		let n = {
			[d.SEARCH]: () => {
				this.contentSearch(), this.renderSearch({ ...t.search });
			},
			[d.CONTENT]: () => this.renderContentPaginationItems(),
			[d.ITEMS]: () => this.renderItems(),
			[d.PAGINATION]: () => this.renderPagination()
		}, r = e.split(""), i = r.filter((e) => "sc".includes(e)).join(""), a = r.filter((e) => "ip".includes(e)).join("");
		for (let e of `${i}${a}`) n[e] && n[e]();
	}
	showResults() {
		let e = this.body.contentPaginationItems;
		e && (e.classList.remove("content-pagination-hidden"), e.classList.add("content-pagination-visible"), e.removeAttribute("hidden"), this.isVisible = !0, this.hideTimeout &&= (clearTimeout(this.hideTimeout), null));
	}
	hideResultsWithDelay(e = this.timeHiddenResults) {
		this.hideTimeout = setTimeout(() => {
			this.hideResults();
		}, e);
	}
	hideResults() {
		let e = this.body.contentPaginationItems, t;
		e && (e.classList.remove("content-pagination-visible"), e.classList.add("content-pagination-hidden"), t = setTimeout(() => {
			e.classList.contains("content-pagination-hidden") && e.setAttribute("hidden", "true");
		}, 200), this.animationTimeouts.push(t));
	}
	toggleResults() {
		this.isVisible ? this.hideResults() : this.showResults();
	}
	renderContentPaginationItems() {
		if (this.body.contentPaginationItems) return this.body.contentPaginationItems;
		let e = this.body.content, t = e.querySelector(".content-pagination-items"), n = r({
			element: t,
			className: this.#e(`content-pagination-items ${this.getUniqueClassName("content-pagination-items")}`, t?.className),
			...t ? {} : { element: "div" }
		});
		return t || e.appendChild(n), this.body.contentPaginationItems = n, n;
	}
}, p = class {
	constructor(e, t) {
		this.searchInstance = e, this.errorHandler = t;
	}
	isExtractData() {
		try {
			let e = this.searchInstance.data;
			if (Array.isArray(e) || this.errorHandler.validateType(e, "array", "data", a.INVALID_DATA_FORMAT), e.length > 0) return !1;
			let t = this.searchInstance.renderer.body.content.querySelectorAll(".items");
			return t.length === 0 ? !1 : (this.searchInstance.data = Array.from(t).map((e) => {
				let t = {};
				return Array.from(e.attributes).forEach((e) => {
					e.name.startsWith("data-") && (t[e.name.replace("data-", "")] = e.value.trim());
				}), t.children = e.innerHTML.trim(), t;
			}), this.searchInstance._data = this.searchInstance.data, !0);
		} catch (e) {
			throw e instanceof o && this.errorHandler.logError(e), e;
		}
	}
	searching(e, t = !1) {
		try {
			if (this.searchInstance.searchTerm === e && e !== "") return this.searchInstance;
			Array.isArray(this.searchInstance.data) || this.errorHandler.throwCustomError(a.INVALID_DATA_FORMAT, {
				context: "searchingLocal",
				dataType: typeof this.searchInstance.data
			}), this.searchInstance.cacheEnabled && this.searchInstance.cache.clearCacheByPrefix(this.searchInstance.searchTerm), this.searchInstance.pagination.goToPage(1);
			let n = this.searchInstance.getCacheKey(e, this.searchInstance.pagination.getCurrentPage()), r = this.searchInstance.cache.get(n);
			if (this.searchInstance.cacheEnabled && r && !t) return this.searchInstance._data = r, this.searchInstance.processInfiniteScroll(), this.searchInstance;
			let i = (e) => typeof e != "object" || !e ? [String(e)] : Object.values(e).flatMap((e) => i(e)), o = (e) => e.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			return this.searchInstance._data = this.searchInstance.data.filter((t) => i(t).some((t) => o(String(t)).toLowerCase().includes(o(String(e)).toLowerCase()))), this.searchInstance.sortBy && this.searchInstance.sort(this.searchInstance.sortBy, this.searchInstance.sortOrder), this.searchInstance.searchTerm = e, this.searchInstance.cacheEnabled && this.searchInstance.cache.set(n, this.searchInstance._data), t && this.searchInstance.events.emit("search", {
				searchTerm: e,
				results: this.searchInstance._data,
				totalResults: this.searchInstance._data.length,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			}), this.searchInstance;
		} catch (e) {
			throw e instanceof o && this.errorHandler.logError(e), e;
		}
	}
}, m = class {
	constructor(e, t) {
		this.defaultTimeout = 3e4, this.searchInstance = e, this.errorHandler = t;
	}
	async searching(e, t = !1) {
		try {
			this.errorHandler.validateRequired(this.searchInstance.fetch?.url, "fetch.url", a.FETCH_URL_REQUIRED), e !== this.searchInstance.searchTerm && (this.searchInstance.pagination.goToPage(1), this.searchInstance.fetch.body.page = 1, this.searchInstance.fetch.body.searchTerm = e, this.searchInstance.cacheEnabled && this.searchInstance.cache.clearCacheByPrefix(this.searchInstance.searchTerm), this.searchInstance.showLoading()), this.searchInstance.pagination.getCurrentPage() !== this.searchInstance.fetch.body.page && this.searchInstance.pagination.goToPage(this.searchInstance.fetch.body.page), (this.searchInstance.itemsPerPage !== this.searchInstance.fetch.body.itemsPerPage || !this.searchInstance.fetch.body.itemsPerPage) && (this.searchInstance.fetch.body.itemsPerPage = this.searchInstance.itemsPerPage), this.searchInstance.searchTerm = e;
			let n = this.searchInstance.getCacheKey(e, this.searchInstance.pagination.getCurrentPage()), r = this.searchInstance.cache.get(n);
			if (this.searchInstance.cacheEnabled && r && !t) return this.searchInstance._data = r, console.log("Usando caché para búsqueda:", n), this.searchInstance;
			this.searchInstance.sortBy && this.searchInstance.sortBy !== this.searchInstance.fetch.body.sortBy && (this.searchInstance.fetch.body.sortBy = this.searchInstance.sortBy, this.searchInstance.fetch.body.sortOrder = this.searchInstance.sortOrder);
			let i = await this.fetch(this.searchInstance.fetch), o = this.searchInstance.responseAdapter, s = o ? o(i) : i;
			return this.searchInstance._data = s.data, this.searchInstance._ajaxResponse.success = { countPage: s.countPage }, this.searchInstance.cacheEnabled && this.searchInstance.cache.set(n, this.searchInstance._data), t && this.searchInstance.events.emit("search", {
				searchTerm: e,
				results: this.searchInstance._data,
				totalResults: this.searchInstance._data.length,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			}), this.searchInstance;
		} catch (e) {
			throw e instanceof o && this.errorHandler.logError(e, this.searchInstance.events), this.searchInstance.events.emit("error", e), e;
		}
	}
	#e(e) {
		this.errorHandler.validateRequired(e.url, "url", a.FETCH_URL_REQUIRED), this.errorHandler.validateRequired(e.method, "method", a.FETCH_URL_REQUIRED), this.errorHandler.validateType(e.method, "string", "method", a.FETCH_URL_REQUIRED);
		let t = [
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"PATCH"
		];
		t.includes(e.method.toUpperCase()) || this.errorHandler.throwCustomError(a.FETCH_FAILED, {
			context: "invalid_http_method",
			providedMethod: e.method,
			validMethods: t
		});
	}
	#t(e) {
		let t = new Headers(e.headers || {});
		return e.method.toUpperCase() !== "GET" && e.body && (t.has("Content-Type") || t.set("Content-Type", "application/json")), t;
	}
	#n(e, t) {
		if (!(e.method.toUpperCase() === "GET" || !e.body)) return this.errorHandler.validateType(e.body, "object", "body", a.INVALID_DATA_FORMAT), e.body instanceof FormData ? e.body : t.get("Content-Type")?.includes("application/x-www-form-urlencoded") ? new URLSearchParams(e.body) : JSON.stringify(e.body);
	}
	#r(e, t, n) {
		if (e instanceof Error && e.name === "AbortError" && this.errorHandler.throwCustomError(a.NETWORK_ERROR, {
			context: "request_timeout",
			url: t,
			timeout: n
		}), e instanceof TypeError && e.message.includes("fetch") && this.errorHandler.throwCustomError(a.NETWORK_ERROR, {
			context: "network_error",
			url: t,
			originalError: e
		}), e instanceof o) throw e;
		this.errorHandler.throwCustomError(a.FETCH_FAILED, {
			context: "unknown_error",
			url: t,
			originalError: e
		});
	}
	async fetch(e) {
		try {
			this.#e(e);
			let t = new AbortController(), n = setTimeout(() => t.abort(), e.timeout || this.defaultTimeout), r = this.#t(e), i = this.#n(e, r), o = await fetch(e.url, {
				method: e.method,
				headers: r,
				body: i,
				signal: t.signal
			});
			clearTimeout(n), o.ok || this.errorHandler.throwCustomError(a.FETCH_FAILED, {
				context: "http_error",
				status: o.status,
				statusText: o.statusText,
				url: e.url
			});
			let s;
			try {
				s = await o.json();
			} catch (t) {
				this.errorHandler.throwCustomError(a.INVALID_DATA_FORMAT, {
					context: "json_parse_error",
					url: e.url,
					originalError: t
				});
			}
			return (!s || Array.isArray(s) && s.length === 0) && this.errorHandler.throwCustomError(a.EMPTY_RESPONSE, {
				context: "empty_response",
				url: e.url
			}), e.success && e.success(s, this.searchInstance), s;
		} catch (t) {
			this.#r(t, e.url, e.timeout || this.defaultTimeout);
		}
	}
}, h = /* @__PURE__ */ t({
	DEFAULT_CACHE_MAX_SIZE: () => 50,
	DEFAULT_CACHE_TTL: () => 300,
	DEFAULT_CSS_CLASSES: () => y,
	DEFAULT_DEBOUNCE_TIME: () => 500,
	DEFAULT_DEVELOPMENT_MODE: () => !1,
	DEFAULT_HIGHLIGHT_ENABLED: () => !1,
	DEFAULT_ITEMS_PER_PAGE: () => 10,
	DEFAULT_THEME: () => _,
	DEFAULT_TIME_HIDDEN_RESULTS: () => 200,
	DEFAULT_TRANSLATIONS: () => v,
	DEFAULT_Z_INDEX: () => g,
	DOM_ORDERS: () => b,
	FIRST_PAGE: () => 1,
	NO_SELECTION: () => -1,
	SORT_ASC: () => -1,
	SORT_DESC: () => 1,
	SORT_ORDER: () => "asc"
}), g = 1e3, _ = "adaptative", v = {
	searchLabel: "Filtrar por Búsqueda",
	searchPlaceholder: "Ingrese palabra clave...",
	noResults: "No se encontraron resultados",
	loading: "Buscando...",
	pagination: "{{count}} de {{total}}"
}, y = {
	searchContainer: "input-search",
	itemsContainer: "items-search",
	paginationContainer: "index-search",
	paginationList: "pagination",
	item: "items"
}, b = {
	SEARCH_ITEMS_PAGINATION: "sip",
	SEARCH_CONTENT_ITEMS_PAGINATION: "scip"
};
//#endregion
export { h as Constants, a as ErrorCode, s as ErrorHandler, c as EventEmitter, i as LRUCache, l as Pagination, n as Search, o as SearchError, f as SearchRenderer, p as SearchingLocal, m as SearchingServer, u as Types, r as createElement };
