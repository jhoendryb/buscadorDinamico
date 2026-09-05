//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = class e {
	static #e = _;
	constructor(t) {
		this.selectingItem = !1, this.currentDrawId = 0, this.isLoadingMore = !1, this._destroyed = !1, this.abortController = null;
		let { translation: n, ...r } = t;
		this.element = void 0, this.searchTerm = "", this.data = [], this.procesServer = !1, this.keyboardEnabled = !1, this.cacheEnabled = !1, this.template = null, this.sortBy = null, this.theme = g, this.zIndex = h, this.sortOrder = "asc", this.itemsPerPage = 10, this.debounceTime = 500, this.cacheMaxSize = 50, this.cacheTtlSeconds = 300, this.dom = y.SEARCH_CONTENT_ITEMS_PAGINATION, this.selectedIndex = -1, this.developmentMode = !1, this.highlightEnabled = !1, this.highlightClass = "", Object.assign(this, r), this.boundClickHandler = () => {}, this.boundKeydownHandler = () => {}, this.boundFocusInHandler = () => {}, this.boundFocusOutHandler = () => {}, this.boundInputHandler = () => {}, this.selectingItem = !1, this.errorHandler = s.getInstance(this.developmentMode), this.events = new c(this.errorHandler);
		try {
			this.#t(), this.scrollObserver = null, this._ajaxResponse = {}, this.t = {
				...e.#e,
				...n
			}, this._data = this.data, this.searchingLocal = new x(), this.searchingServer = new S(this.errorHandler, this.responseAdapter), this.renderer = new b({
				content: void 0,
				contentSearch: void 0,
				inputSearch: void 0,
				renderItems: void 0,
				paginationItems: void 0,
				counterItems: void 0
			}, this.#s.bind(this), 200), this.cache = new i(this.cacheMaxSize, this.cacheTtlSeconds), this.pagination = new l(this.itemsPerPage, 1), this.pagination.setCountFunction(() => (this.procesServer ? this._ajaxResponse.success?.countPage : this._data?.length) || 0), this.pagination.setDataItemsFunction(() => this._data || []), this.pagination.onPageChangeCallback((e, t) => {
				this.events.emit("pageChange", {
					page: e,
					totalPages: t,
					itemsOnPage: this.pagination.getPageItems(this.procesServer ? null : this._data).length,
					totalLoaded: this.pagination.getTotalLoaded()
				});
			});
		} catch (e) {
			throw e instanceof o && this.errorHandler.logError(e, this.events), e;
		}
	}
	init() {
		try {
			if (this.errorHandler.validateElementExists(this.element, a.ELEMENT_NOT_FOUND), this.renderer.body.content = document.querySelector(this.element), this.renderer.setTheme(this.theme), !this.procesServer && this.data.length == 0) {
				let e = this.searchingLocal.isExtractData(this.renderer.body.content);
				e && (this.data = e, this._data = this.data);
			}
			return this.renderer.renderByDom(this.dom, {
				zIndex: this.zIndex,
				search: {
					onInput: (e, t) => this.draw(e, t),
					debounceTime: this.debounceTime,
					placeholder: this.t.searchPlaceholder,
					ariaLabel: this.t.ariaLabel
				}
			}), this.setupEventDelegation(), this.draw(this.searchTerm), this.events.emit("init", {
				searchTerm: this.searchTerm,
				itemsPerPage: this.itemsPerPage,
				procesServer: this.procesServer
			}), this;
		} catch (e) {
			throw e instanceof o && this.errorHandler.logError(e), e;
		}
	}
	#t() {
		this.errorHandler.validateRequired(this.element, "element", a.ELEMENT_REQUIRED), this.errorHandler.validateType(this.element, "string", "element", a.ELEMENT_TYPE_INVALID);
		let e = {
			procesServer: this.procesServer,
			keyboardEnabled: this.keyboardEnabled,
			cacheEnabled: this.cacheEnabled,
			developmentMode: this.developmentMode,
			highlightEnabled: this.highlightEnabled
		};
		Object.keys(e).forEach((t) => {
			this.errorHandler.validateType(e[t], "boolean", t, a.INVALID_TYPE_FORMAT);
		}), this.procesServer && this.errorHandler.validateRequired(this.fetch?.url, "fetch.url", a.FETCH_URL_REQUIRED), this.itemsPerPage && (this.errorHandler.validateType(this.itemsPerPage, "number", "itemsPerPage", a.ITEMSPERPAGE_TYPE_INVALID), this.errorHandler.validateRange(this.itemsPerPage, 1, "itemsPerPage", a.ITEMSPERPAGE_VALUE_INVALID)), this.highlightClass && this.errorHandler.validateType(this.highlightClass, "string", "highlightClass", a.INVALID_TYPE_FORMAT);
	}
	#n(e) {
		if (!this.highlightEnabled || !this.searchTerm) return e;
		let t = this.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), n = RegExp(`(${t})`, "gi");
		return e.replace(n, `<span class="${["search-highlight", this.highlightClass].filter((e) => e).join(" ")}">$1</span>`);
	}
	async #r(e, t = !1) {
		return this.abortController?.abort(), this.abortController = new AbortController(), this.procesServer ? await this.#c(e, this.pagination.getCurrentPage(), t) : { data: this.searchingLocal.search(e, this.data, this.sortBy, this.sortOrder) };
	}
	async draw(e = this.searchTerm, t = !1) {
		if (this._destroyed) return this;
		let n = ++this.currentDrawId;
		e !== this.searchTerm && this.renderer.body.renderItems && (this.renderer.body.renderItems.scrollTop = 0, this.renderer.body.renderItems.innerHTML = "", this.events.emit("resultsCleared", { previousSearchTerm: this.searchTerm }), this.renderer.body.renderItems.removeAttribute("aria-activedescendant"), this.pagination.goToPage(1), this.selectedIndex = -1);
		let r = await this.#r(e, !0);
		return n === this.currentDrawId ? (this._data = r?.data || [], this.searchTerm = e, t && this.events.emit("search", {
			searchTerm: e,
			results: this._data,
			totalResults: this._data.length,
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		}), this.processInfiniteScroll(), this.events.emit("searchComplete", {
			searchTerm: e,
			results: this._data,
			totalResults: this._data?.length
		}), this) : this;
	}
	processInfiniteScroll() {
		this.pagination && this.#l(this.pagination.getCurrentPage() === 1);
	}
	#i() {
		let e = this.renderer.body.renderItems;
		if (!e) return this;
		if (typeof IntersectionObserver > "u") return console.warn(this.t.noIntersectionObserver), this;
		let t = e.querySelector(".scroll-sentinel");
		t && (this.scrollObserver?.unobserve(t), t.remove()), this.scrollObserver ||= new IntersectionObserver((e) => {
			e.forEach((e) => {
				e.isIntersecting && this.pagination.hasMorePages() && this.#a();
			});
		}, {
			root: e,
			rootMargin: "100px",
			threshold: .1
		});
		let n = r({
			element: "li",
			className: "scroll-sentinel",
			attributes: {
				style: "height: 1px; visibility: hidden; padding: 0; margin: 0;",
				role: "presentation",
				"aria-hidden": "true"
			}
		});
		return e.appendChild(n), this.scrollObserver.observe(n), this;
	}
	async #a() {
		if (this.isLoadingMore || !this.pagination.hasMorePages()) return this;
		this.isLoadingMore = !0;
		try {
			let e = this.pagination.loadNextPage();
			if (this.procesServer) {
				let t = null;
				t = await this.#c(this.searchTerm, e), this._data = t?.data || [];
			}
			return this.#l(this.pagination.getCurrentPage() === 1), this;
		} finally {
			this.isLoadingMore = !1;
		}
	}
	#o() {
		return this.scrollObserver && this.scrollObserver.disconnect(), this;
	}
	#s(e) {
		return `${e}-${this.element.replace(/^[.#]/, "")}`;
	}
	async #c(e, t, n = !1) {
		let r = this.getCacheKey(e, t), i = async () => {
			if (this.cacheEnabled) {
				let e = this.cache.get(r);
				if (e !== void 0) return e;
			}
			let n = await this.searchingServer.search(e, this.fetch, t, this.itemsPerPage, this.abortController?.signal);
			return this.cacheEnabled && this.cache.set(r, n), n;
		};
		n && this.renderer.showLoading(this.t.loading || "");
		let a = await i();
		return a && (this._ajaxResponse.success = { countPage: a.countPage }), a;
	}
	#l(e = !1) {
		let t = this.pagination.getPageItems(this.procesServer ? null : this._data);
		this.renderer.appendItems(t, this.template, this.t.noResults, this.events, e, this.#n.bind(this));
		let n = this.pagination.getRange();
		this.renderer.updateCounter({
			...n,
			textPagination: this.t.pagination
		}), this.#i();
	}
	on(e, t) {
		return this.events.on(e, t);
	}
	getCacheKey(e, t) {
		return `${e}_${t}`;
	}
	sort(e, t = "asc") {
		return this._destroyed ? this : (this.sortBy = e, this.sortOrder = t, this.procesServer ? this.draw(this.searchTerm, !0) : this._data?.sort((n, r) => {
			let i = n[e], a = r[e];
			return i < a ? t === "asc" ? -1 : 1 : i > a ? t === "asc" ? 1 : -1 : 0;
		}), this.events.emit("sortChange", {
			field: e,
			order: t
		}), this);
	}
	clearSort() {
		return this._destroyed ? this : (this.sortOrder = "asc", this.sort(this.sortBy || "", this.sortOrder), this.sortBy = null, this.procesServer && this.fetch?.body && (this.fetch.body.sortBy = null, this.fetch.body.sortOrder = "asc"), this.cache.clear(), this);
	}
	setupEventDelegation() {
		if (this._destroyed) return this;
		let e = this.renderer.body.content, t = this.renderer.body.renderItems, n = this.renderer.body.inputSearch;
		return !e || !t || !n ? this : (this.boundFocusOutHandler = (t) => {
			let n = t.target;
			n && e.contains(n) || (setTimeout(() => {
				this.selectingItem || this._destroyed || this.renderer.visibility.close({
					reason: "blur",
					immediate: !0
				});
			}, 0), document.removeEventListener("click", this.boundFocusOutHandler));
		}, this.boundFocusInHandler = (e) => {
			e.target === n && ((t?.querySelectorAll(".items").length || 0) > 0 && this.renderer.visibility.open("focus"), document.addEventListener("click", this.boundFocusOutHandler));
		}, e.addEventListener("focusin", this.boundFocusInHandler), this.boundClickHandler = (e) => {
			if (this.events.listenerCount("itemSelected") === 0 || !t) return;
			let r = e.target.closest(".items"), i = t.querySelectorAll(".items");
			r && (this.selectingItem = !0, this.selectedIndex = Array.from(i).indexOf(r), this.#u(i), this.#d(r), n && (n.value = "", n.blur(), this.renderer.visibility.close({
				reason: "blur",
				immediate: !0
			})), queueMicrotask(() => {
				this.selectingItem = !1;
			}));
		}, e.addEventListener("click", this.boundClickHandler), this.keyboardEnabled && (this.boundKeydownHandler = (e) => {
			if (!t) return;
			let r = t.querySelectorAll(".items");
			e.key === "ArrowDown" ? (e.preventDefault(), this.selectedIndex = Math.min(this.selectedIndex + 1, r.length - 1), this.#u(r)) : e.key === "ArrowUp" ? (e.preventDefault(), this.selectedIndex = Math.max(this.selectedIndex - 1, 0), this.#u(r)) : ["enter"].includes(e.key.toLowerCase()) && this.selectedIndex >= 0 && (e.preventDefault(), this.#d(r[this.selectedIndex]), n && (n.value = "", n.blur(), this.renderer.visibility.close({
				reason: "blur",
				immediate: !0
			})));
		}, e.addEventListener("keydown", this.boundKeydownHandler)), this);
	}
	#u(e) {
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
	#d(e) {
		this.events.emit("itemSelected", {
			item: e,
			index: this.selectedIndex,
			close: () => this.renderer.visibility.close({
				reason: "select",
				immediate: !0
			})
		});
	}
	clear() {
		return this._destroyed ? this : (this.searchTerm = "", this.renderer.body.inputSearch && (this.renderer.body.inputSearch.value = this.searchTerm), this.renderer.body.renderItems && (this.renderer.body.renderItems.innerHTML = ""), this.sortBy !== null && this.clearSort(), this.cache.clear(), this.pagination.goToPage(1), this.draw(this.searchTerm, !0), this.selectedIndex = -1, this);
	}
	destroy() {
		if (this._destroyed = !0, this.events.emit("destroy", { timestamp: (/* @__PURE__ */ new Date()).toISOString() }), this.renderer.body.content?.removeEventListener("input", this.boundInputHandler), this.renderer.body.content?.removeEventListener("focusin", this.boundFocusInHandler), this.renderer.body.content?.removeEventListener("click", this.boundFocusOutHandler), this.renderer.body.content?.removeEventListener("click", this.boundClickHandler), this.renderer.body.content?.removeEventListener("keydown", this.boundKeydownHandler), this.scrollObserver &&= (this.#o(), null), this.renderer.body.inputSearch) {
			let e = this.renderer.body.inputSearch.cloneNode(!0);
			this.renderer.body.inputSearch.parentNode && this.renderer.body.inputSearch.parentNode.replaceChild(e, this.renderer.body.inputSearch);
		}
		this.events.removeAllListeners(), this._data = null, this.data = [], this.cache = new i(this.cacheMaxSize, this.cacheTtlSeconds), this.pagination.reset(), this.events = new c(), this.renderer.destroy();
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
		this.cache = /* @__PURE__ */ new Map(), this.maxSize = e, this.ttlSeconds = t, this.stats = {
			hits: 0,
			misses: 0,
			evictions: 0
		};
	}
	set(e, t) {
		if (this.cache.has(e)) {
			this.cache.set(e, {
				value: t,
				expiresAt: Date.now() + this.ttlSeconds * 1e3
			});
			return;
		}
		if (this.cache.size >= this.maxSize && this.cleanup(), this.cache.size >= this.maxSize) {
			let e = this.cache.keys().next().value;
			e && (this.delete(e), this.stats.evictions++);
		}
		this.cache.set(e, {
			value: t,
			expiresAt: Date.now() + this.ttlSeconds * 1e3
		});
	}
	get(e) {
		let t = this.cache.get(e);
		if (!t) {
			this.stats.misses++;
			return;
		}
		if (Date.now() > t.expiresAt) {
			this.delete(e), this.stats.misses++;
			return;
		}
		return this.stats.hits++, this.delete(e), this.cache.set(e, {
			value: t.value,
			expiresAt: Date.now() + this.ttlSeconds * 1e3
		}), t.value;
	}
	has(e) {
		let t = this.cache.get(e);
		return !(!t || Date.now() > t.expiresAt);
	}
	size() {
		return this.cache.size;
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
	static {
		this.DEFAULT_ERROR_MESSAGES = {
			[a.ELEMENT_REQUIRED]: {
				code: a.ELEMENT_REQUIRED,
				message: "El parámetro 'element' es requerido",
				solution: "Proporciona el selector CSS del contenedor donde se renderizará el buscador.\nEjemplo: { element: '.mi-buscador' }",
				documentation: "#configuration-element"
			},
			[a.ELEMENT_TYPE_INVALID]: {
				code: a.ELEMENT_TYPE_INVALID,
				message: "El parámetro 'element' debe ser un string con el selector CSS",
				solution: "El parámetro element debe ser un string válido de selector CSS.\nEjemplo: '.mi-buscador', '#buscador-id', '[data-search]'",
				documentation: "#configuration-element"
			},
			[a.FETCH_URL_REQUIRED]: {
				code: a.FETCH_URL_REQUIRED,
				message: "El parámetro 'fetch.url' es requerido cuando procesServer es true",
				solution: "Configura la URL del endpoint de búsqueda.\nEjemplo: { fetch: { url: '/api/search' } }",
				documentation: "#configuration-fetch"
			},
			[a.ITEMSPERPAGE_TYPE_INVALID]: {
				code: a.ITEMSPERPAGE_TYPE_INVALID,
				message: "El parámetro 'itemsPerPage' debe ser un número",
				solution: "El parámetro itemsPerPage debe ser de tipo number.\nEjemplo: { itemsPerPage: 10 }",
				documentation: "#configuration-pagination"
			},
			[a.ITEMSPERPAGE_VALUE_INVALID]: {
				code: a.ITEMSPERPAGE_VALUE_INVALID,
				message: "El parámetro 'itemsPerPage' debe ser mayor a 0",
				solution: "El parámetro itemsPerPage debe ser un número positivo mayor a 0.\nEjemplo: { itemsPerPage: 10 }",
				documentation: "#configuration-pagination"
			},
			[a.INVALID_TYPE_FORMAT]: {
				code: a.INVALID_TYPE_FORMAT,
				message: "El parámetro tiene un formato de tipo inválido",
				solution: "Verifica que el parámetro tenga el formato correcto.",
				documentation: "#configuration-invalid-type"
			},
			[a.ELEMENT_NOT_FOUND]: {
				code: a.ELEMENT_NOT_FOUND,
				message: "No existe el contenedor especificado",
				solution: "Verifica que el selector CSS sea correcto y que el elemento exista en el DOM antes de inicializar el componente.",
				documentation: "#troubleshooting-dom"
			},
			[a.CONTAINER_NOT_FOUND]: {
				code: a.CONTAINER_NOT_FOUND,
				message: "No existe el contenedor principal",
				solution: "Asegúrate de que el elemento especificado exista en el DOM antes de inicializar el componente.",
				documentation: "#troubleshooting-dom"
			},
			[a.NETWORK_ERROR]: {
				code: a.NETWORK_ERROR,
				message: "Error de conexión al servidor",
				solution: "Verifica tu conexión a internet y que el servidor esté disponible.",
				documentation: "#troubleshooting-network"
			},
			[a.FETCH_FAILED]: {
				code: a.FETCH_FAILED,
				message: "Error al obtener datos del servidor",
				solution: "Verifica que la URL del endpoint sea correcta y que el servidor responda con el formato esperado.",
				documentation: "#troubleshooting-fetch"
			},
			[a.INVALID_DATA_FORMAT]: {
				code: a.INVALID_DATA_FORMAT,
				message: "Formato de datos inválido",
				solution: "Verifica que los datos tengan el formato esperado por el componente.",
				documentation: "#data-format"
			},
			[a.EMPTY_RESPONSE]: {
				code: a.EMPTY_RESPONSE,
				message: "La respuesta del servidor está vacía",
				solution: "Verifica que el endpoint devuelva datos en el formato esperado.",
				documentation: "#data-format"
			},
			[a.INITIALIZATION_FAILED]: {
				code: a.INITIALIZATION_FAILED,
				message: "Error al inicializar el componente",
				solution: "Verifica la configuración y los parámetros proporcionados.",
				documentation: "#troubleshooting-initialization"
			},
			[a.RENDER_ERROR]: {
				code: a.RENDER_ERROR,
				message: "Error al renderizar el componente",
				solution: "Verifica que el DOM esté disponible y que no haya conflictos con otros componentes.",
				documentation: "#troubleshooting-render"
			}
		};
	}
	constructor(e = !0) {
		this.developmentMode = e, this.errorMessages = /* @__PURE__ */ new Map(), this.initializeErrorMessages(), this.documentationUrl = "https://www.xample.com";
	}
	static getInstance(t) {
		return e.instance ? t !== void 0 && (e.instance.developmentMode = t) : e.instance = new e(t ?? !0), e.instance;
	}
	isDevelopmentMode() {
		return this.developmentMode;
	}
	setDocumentationUrl(e) {
		this.documentationUrl = e;
	}
	initializeErrorMessages() {
		Object.values(e.DEFAULT_ERROR_MESSAGES).forEach((e) => {
			this.errorMessages.set(e.code, e);
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
		return t += `Solución: ${e.solution}`, this.developmentMode && e.context && (t += `\nContexto: ${JSON.stringify(e.context, null, 2)}`), e.documentation && (t += `\nDocumentación: ${this.documentationUrl}${e.documentation}`), t;
	}
}, c = class {
	constructor(e) {
		this.events = {}, this.errorHandler = e || s.getInstance(!0);
	}
	on(e, t) {
		this.events[e] || (this.events[e] = []);
		try {
			this.errorHandler.validateType(t, "function", "callback", a.INVALID_TYPE_FORMAT);
		} catch {
			throw new o({
				code: a.INVALID_TYPE_FORMAT,
				message: `El callback para "${String(e)}" debe ser una función`,
				solution: "Asegúrate de pasar una función como callback."
			});
		}
		return this.events[e].push(t), this;
	}
	off(e, t) {
		return this.events[e] && (this.events[e] = this.events[e].filter((e) => e !== t)), this;
	}
	emit(e, t) {
		let n = this.events[e];
		n && n.forEach((n) => {
			try {
				n(t);
			} catch (t) {
				t instanceof o ? this.errorHandler.logError(t, this) : console.error(`Error en callback de "${String(e)}":`, t);
			}
		});
	}
	async emitAsync(e, t) {
		let n = this.events[e];
		if (n) {
			let r = n.map((n) => {
				try {
					let e = n(t);
					return Promise.resolve(e);
				} catch (t) {
					return t instanceof o ? this.errorHandler.logError(t, this) : console.error(`Error en callback de "${String(e)}":`, t), Promise.resolve();
				}
			});
			await Promise.allSettled(r);
		}
	}
	once(e, t) {
		let n = (r) => {
			t(r), this.off(e, n);
		};
		return this.on(e, n);
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
	getEventList() {
		return Object.entries(this.events).map(([e, t]) => ({
			event: e,
			listeners: t?.length || 0
		}));
	}
}, l = class {
	get itemsPerPage() {
		return this._itemsPerPage;
	}
	constructor(e = 10, t = 1) {
		this.currentPage = t, this._itemsPerPage = e < 1 ? 1 : e;
	}
	loadNextPage() {
		let e = this.getTotalPages();
		return this.currentPage < e && (this.currentPage++, this.onPageChange?.(this.currentPage, e)), this.currentPage;
	}
	hasMorePages() {
		return this.currentPage < this.getTotalPages();
	}
	getTotalLoaded() {
		let e = this.getTotalItems();
		return Math.min(e, this.currentPage * this._itemsPerPage);
	}
	setCountFunction(e) {
		this.countFn = e;
	}
	setDataItemsFunction(e) {
		this.dataItemsFn = e;
	}
	onPageChangeCallback(e) {
		this.onPageChange = e;
	}
	getTotalItems() {
		return typeof this.countFn == "function" ? this.countFn() : typeof this.dataItemsFn == "function" ? this.dataItemsFn().length : 0;
	}
	getTotalPages() {
		let e = this.getTotalItems();
		return Math.ceil(e / this._itemsPerPage) || 1;
	}
	prevPage() {
		return this.currentPage > 1 && (this.currentPage--, this.onPageChange?.(this.currentPage, this.getTotalPages())), this.currentPage;
	}
	goToPage(e) {
		let t = this.getTotalPages();
		return e >= 1 && e <= t && (this.currentPage = e, this.onPageChange?.(this.currentPage, t)), this.currentPage;
	}
	firstPage() {
		return this.currentPage = 1, this.onPageChange?.(this.currentPage, this.getTotalPages()), this.currentPage;
	}
	lastPage() {
		return this.currentPage = this.getTotalPages(), this.onPageChange?.(this.currentPage, this.getTotalPages()), this.currentPage;
	}
	getPageItems(e) {
		if (!e) return this.dataItemsFn ? this.dataItemsFn() : [];
		let t = (this.currentPage - 1) * this._itemsPerPage, n = this.currentPage * this._itemsPerPage;
		return e.slice(t, n);
	}
	getRange() {
		let e = this.getTotalItems();
		return e === 0 ? {
			from: 0,
			to: 0,
			total: 0
		} : {
			from: (this.currentPage - 1) * this._itemsPerPage + 1,
			to: Math.min(this.currentPage * this._itemsPerPage, e),
			total: e
		};
	}
	getCurrentPage() {
		return this.currentPage;
	}
	setItemsPerPage(e) {
		e < 1 && (e = 1), this._itemsPerPage = e;
		let t = this.getTotalPages();
		this.currentPage > t && (this.currentPage = t);
	}
	reset(e = 1) {
		this.currentPage = e, this.countFn = void 0, this.dataItemsFn = void 0;
	}
}, u = class {
	#e;
	#t = "closed";
	#n = "programmatic";
	#r = 0;
	#i = null;
	#a = !1;
	#o = !1;
	#s = 0;
	#c = [];
	#l = !1;
	constructor(e) {
		this.#e = {
			panel: e.panel,
			control: e.control ?? (() => null),
			listbox: e.listbox ?? (() => null),
			hideDelayMs: e.hideDelayMs ?? 200,
			reducedMotionMs: e.reducedMotionMs ?? 0,
			hooks: e.hooks ?? {}
		};
	}
	get phase() {
		return this.#t;
	}
	get isOpen() {
		return this.#t === "open" || this.#t === "opening";
	}
	open(e = "programmatic") {
		this.#l || this.isOpen || (this.#r++, this.#g(), this.#b(), this.#u(e));
	}
	close(e = {}) {
		if (this.#l || this.#t === "closed" || !e.immediate && this.#t === "closing") return;
		let t = e.reason ?? "programmatic";
		this.#n = t, this.#r++, this.#g(), this.#s = 0;
		let n = this.#_();
		if (e.immediate || n <= 0) {
			this.#e.hooks.onClose?.(t), this.#f(t);
			return;
		}
		this.#t = "closing", this.#y(), this.#e.hooks.onClose?.(t), this.#h(() => this.#p(), n);
	}
	toggle() {
		this.isOpen ? this.close({ reason: "toggle" }) : this.open("toggle");
	}
	stickForInteraction() {
		this.#l || (this.#s = Date.now() + this.#e.hideDelayMs, this.cancelPendingClose());
	}
	cancelPendingClose() {
		this.#l || this.#t !== "closing" || (this.#r++, this.#g(), this.#u("focus"));
	}
	refresh() {
		this.#l || this.#y();
	}
	destroy() {
		this.#l = !0, this.#r++, this.#g(), this.#c.forEach(([e, t, n]) => e.removeEventListener(t, n)), this.#c = [], this.#a = !1, this.#o = !1, this.#s = 0, this.#t = "closed";
	}
	#u(e) {
		this.#t = "opening", this.#y(), this.#e.hooks.onOpen?.(e);
		let t = this.#_();
		t <= 0 ? this.#d(e) : this.#h(() => this.#d(e), t);
	}
	#d(e) {
		this.#l || !this.isOpen || (this.#t = "open", this.#y(), this.#e.hooks.onOpened?.(e));
	}
	#f(e) {
		this.#t = "closed", this.#y(), this.#e.hooks.onClosed?.(e);
	}
	#p() {
		if (this.#t === "closing") {
			if (this.#m()) {
				this.cancelPendingClose();
				return;
			}
			this.#f(this.#n);
		}
	}
	#m() {
		if (this.#a || this.#o || Date.now() < this.#s) return !0;
		let e = this.#e.panel(), t = typeof document < "u" ? document.activeElement : null;
		return !!e && !!t && t !== document.body && e.contains(t);
	}
	#h(e, t) {
		let n = ++this.#r;
		this.#g(), this.#i = setTimeout(() => {
			n === this.#r && e();
		}, t);
	}
	#g() {
		this.#i !== null && (clearTimeout(this.#i), this.#i = null);
	}
	#_() {
		return this.#v() ? this.#e.reducedMotionMs : this.#e.hideDelayMs;
	}
	#v() {
		try {
			return typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
		} catch {
			return !1;
		}
	}
	#y() {
		let e = this.#e.panel();
		if (!e) return;
		let t = this.#t === "open" || this.#t === "opening";
		e.classList.toggle("content-pagination-visible", t), e.classList.toggle("content-pagination-hidden", !t), t ? e.removeAttribute("hidden") : this.#t === "closed" && e.setAttribute("hidden", "true"), this.#e.control?.()?.setAttribute("aria-expanded", String(t)), this.#e.listbox?.()?.setAttribute("aria-hidden", String(!t));
	}
	#b() {
		let e = this.#e.panel();
		!e || this.#c.length > 0 || (this.#x(e, "pointerdown", () => {
			this.#a = !0, this.stickForInteraction();
		}), this.#x(e, "pointermove", () => {
			this.#a = !0, this.stickForInteraction();
		}), this.#x(e, "pointerenter", () => {
			this.#a = !0;
		}), this.#x(e, "pointerleave", () => {
			this.#a = !1;
		}), this.#x(e, "touchstart", () => {
			this.#a = !0, this.stickForInteraction();
		}, { passive: !0 }), this.#x(e, "focusin", () => {
			this.#o = !0;
		}), this.#x(e, "focusout", ((t) => {
			let n = t.relatedTarget;
			this.#o = !!n && e.contains(n);
		})));
	}
	#x(e, t, n, r) {
		e.addEventListener(t, n, r), this.#c.push([
			e,
			t,
			n
		]);
	}
}, d = class {
	render(e, t, n) {
		if (typeof t == "function") return t(e, n);
		if (typeof t == "string") return t.replace(/{{(\w+)}}/g, (t, r) => {
			let i = e[r];
			return n ? n(String(i)) : String(i);
		});
		let r = Object.values(e).join(" ");
		return n ? n(r) : r;
	}
}, f = /* @__PURE__ */ t({ DomComponent: () => p }), p = /* @__PURE__ */ function(e) {
	return e.SEARCH = "s", e.CONTENT = "c", e.ITEMS = "i", e.PAGINATION = "p", e;
}({}), m = /* @__PURE__ */ t({
	DEFAULT_CACHE_MAX_SIZE: () => 50,
	DEFAULT_CACHE_TTL: () => 300,
	DEFAULT_CSS_CLASSES: () => v,
	DEFAULT_DEBOUNCE_TIME: () => 500,
	DEFAULT_DEVELOPMENT_MODE: () => !1,
	DEFAULT_HIGHLIGHT_ENABLED: () => !1,
	DEFAULT_ITEMS_PER_PAGE: () => 10,
	DEFAULT_THEME: () => g,
	DEFAULT_TIME_HIDDEN_RESULTS: () => 200,
	DEFAULT_TRANSLATIONS: () => _,
	DEFAULT_Z_INDEX: () => h,
	DOM_ORDERS: () => y,
	FIRST_PAGE: () => 1,
	NO_SELECTION: () => -1,
	SORT_ASC: () => -1,
	SORT_DESC: () => 1,
	SORT_ORDER: () => "asc"
}), h = 1e3, g = "adaptative", _ = {
	ariaLabel: "Filtrar por Búsqueda",
	searchPlaceholder: "Ingrese palabra clave...",
	noResults: "No se encontraron resultados",
	loading: "Buscando...",
	pagination: "{{to}} de {{total}}",
	noIntersectionObserver: "IntersectionObserver no está disponible. Scroll infinito no funcionará en este entorno."
}, v = {
	searchContainer: "input-search",
	itemsContainer: "items-search",
	paginationContainer: "index-search",
	paginationList: "pagination",
	item: "items"
}, y = {
	SEARCH_ITEMS_PAGINATION: "sip",
	SEARCH_CONTENT_ITEMS_PAGINATION: "scip"
}, b = class {
	constructor(e, t, n) {
		this.body = e, this.uniqueClassNameFn = t, this.timeHiddenResults = n, this.visibility = new u({
			panel: () => this.body.contentPaginationItems,
			control: () => this.body.inputSearch,
			listbox: () => this.body.renderItems,
			hideDelayMs: this.timeHiddenResults
		});
	}
	setTheme(e) {
		let t = this.body.content;
		if (!t) return this;
		let n = Array.from(t.classList).find((e) => e.startsWith("theme-"));
		return n && t.classList.remove(n), e && e !== "default" && t.classList.add(`theme-${e}`), this;
	}
	getUniqueClassName(e) {
		return this.uniqueClassNameFn(e);
	}
	#e(e, t = "") {
		let n = e.trim().split(/\s+/), r = t.trim().split(/\s+/), i = new Set([...n, ...r]);
		return Array.from(i).join(" ");
	}
	contentSearch() {
		if (this.body.contentSearch) return this.body.contentSearch;
		let e = this.body.content, t = e?.querySelector(".input-search"), n = r({
			element: t,
			className: this.#e(`input-search ${this.getUniqueClassName("input-search")}`, t?.className),
			...t ? {} : { element: "div" }
		});
		return t || e?.appendChild(n), this.body.contentSearch = n, n;
	}
	renderSearch({ onInput: e, debounceTime: t, placeholder: n, ariaLabel: i }) {
		if (this.body.inputSearch) return this.body.inputSearch;
		let a = this.body.contentSearch, o = a?.querySelector(".filter-search"), s, c = {
			element: o,
			type: "search",
			id: this.getUniqueClassName("input-search"),
			placeholder: n || "Ingrese palabra clave...",
			className: this.#e(`${this.getUniqueClassName("filter-search")}`, o?.className),
			attributes: {
				"aria-label": i || "Filtrar por Búsqueda",
				role: "combobox",
				"aria-expanded": "false",
				"aria-haspopup": "listbox",
				"aria-autocomplete": "list",
				"aria-controls": this.getUniqueClassName("items-search")
			},
			event: { input: (n) => {
				let r = n.target.value.trim().toLowerCase();
				clearTimeout(s), s = setTimeout(() => {
					e && e(r, n instanceof Event);
				}, t);
			} },
			...o ? {} : {
				element: "input",
				name: this.getUniqueClassName("filterSearch")
			}
		};
		return o = r(c), c.element === "input" && a && a.appendChild(o), this.body.inputSearch = o, o;
	}
	renderItems({ zIndex: e = 999, ready: t }) {
		if (this.body.renderItems) return this.body.renderItems;
		this.body.contentPaginationItems || this.renderContentPaginationItems({ ready: t });
		let n = this.body.contentPaginationItems, i = n?.querySelector(".items-search"), a = r({
			element: i,
			className: this.#e(`items-search scroll-personalize ${this.getUniqueClassName("items-search")}`, i?.className),
			attributes: {
				"aria-label": "Resultados de búsqueda",
				role: "listbox",
				"aria-hidden": "true"
			},
			style: { zIndex: e },
			...i ? {} : {
				element: "ul",
				id: this.getUniqueClassName("items-search")
			}
		});
		return !i && n && n.appendChild(a), this.body.renderItems = a, a;
	}
	renderPagination({ ready: e }) {
		this.body.contentPaginationItems || this.renderContentPaginationItems({ ready: e });
		let t = this.body.contentPaginationItems, n = t?.querySelector(".pagination-items"), i = r({
			element: n,
			className: this.#e("pagination-items", n?.className),
			attributes: {
				role: "status",
				"aria-live": "polite"
			},
			child: this.renderCounter(),
			...n ? {} : { element: "div" }
		});
		return !n && t && t.appendChild(i), this.body.paginationItems = i, i;
	}
	renderCounter() {
		if (this.body.counterItems) return this.body.counterItems;
		let e = this.body.contentPaginationItems?.querySelector(".items-counter"), t = r({
			element: e,
			className: this.#e("items-counter", e?.className),
			...e ? {} : { element: "div" }
		});
		return this.body.counterItems = t, t;
	}
	appendItems(e, t, n = _.noResults, i, a = !1, o) {
		let s = this.body.renderItems;
		if (!s) return !1;
		a && (s.innerHTML = "");
		let c = {
			element: "li",
			className: "items",
			tabindex: "0",
			attributes: { role: "option" }
		};
		if (s.children.length === 0 && (!e || e.length === 0)) return c.textContent = n, s.appendChild(r(c)), !1;
		let l = this.body.renderItems?.children.length, u = l ? l - 1 : 0, f = document.createDocumentFragment(), p = new d();
		return e.forEach((e) => {
			c.id = this.getUniqueClassName(`items-${u++}`);
			let n = r(c);
			n.innerHTML = p.render(e, t, o), f.appendChild(n);
		}), s.appendChild(f), i.emit("appendItems", {
			items: e,
			content: s
		}), !0;
	}
	updateCounter(e) {
		if (!this.body.counterItems) return;
		let t = this.body.counterItems;
		e.textPagination ||= _.pagination;
		let { textPagination: n, ...r } = e;
		if (t && n) {
			let e = n;
			Object.entries(r).forEach(([t, n]) => {
				e = e.replace(`{{${t}}}`, String(n));
			}), t.textContent = e;
		}
	}
	renderByDom(e, t) {
		let n = {
			[p.SEARCH]: () => {
				this.contentSearch(), this.renderSearch({ ...t.search });
			},
			[p.CONTENT]: () => this.renderContentPaginationItems({ ...t.renderPaginationItems }),
			[p.ITEMS]: () => this.renderItems({ ...t.renderPaginationItems }),
			[p.PAGINATION]: () => this.renderPagination({ ...t.renderPaginationItems })
		}, r = e.split(""), i = r.filter((e) => "sc".includes(e)).join(""), a = r.filter((e) => "ip".includes(e)).join("");
		for (let e of `${i}${a}`) n[e] && n[e]();
	}
	showLoading(e) {
		if (!this.body.renderItems) return;
		let t = r({
			element: "div",
			className: "search-loading",
			children: [{
				element: "div",
				className: "spinner"
			}, {
				element: "p",
				textContent: e
			}]
		});
		this.body.renderItems.innerHTML = t.outerHTML;
	}
	renderContentPaginationItems({ ready: e }) {
		if (this.body.contentPaginationItems) return this.body.contentPaginationItems;
		let t = this.body.content, n = t?.querySelector(".content-pagination-items"), i = r({
			element: n,
			className: this.#e(`content-pagination-items ${this.getUniqueClassName("content-pagination-items")} content-pagination-hidden`, n?.className),
			hidden: !0,
			...n ? {} : { element: "div" }
		});
		return n || t?.appendChild(i), e && e(), this.body.contentPaginationItems = i, i;
	}
	destroy() {
		this.visibility.destroy(), this.body.contentSearch = void 0, this.body.inputSearch = void 0, this.body.renderItems = void 0, this.body.paginationItems = void 0, this.body.contentPaginationItems = void 0;
	}
}, x = class {
	isExtractData(e) {
		let t = e.querySelectorAll(".items");
		return t.length === 0 ? null : Array.from(t).map((e) => {
			let t = {};
			return Array.from(e.attributes).forEach((e) => {
				e.name.startsWith("data-") && (t[e.name.replace("data-", "")] = e.value.trim());
			}), t.children = e.innerHTML.trim(), t;
		});
	}
	search(e, t, n, r) {
		if (e === "" || !e) return t;
		let i = t.filter((t) => this.#e(t).some((t) => this.#t(String(t)).includes(this.#t(e))));
		return n && i.sort((e, t) => {
			let i = e[n], a = t[n];
			return i < a ? r === "asc" ? -1 : 1 : i > a ? r === "asc" ? 1 : -1 : 0;
		}), i;
	}
	#e(e) {
		return typeof e != "object" || !e ? [String(e)] : Object.values(e).flatMap((e) => this.#e(e));
	}
	#t(e) {
		return e.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
	}
}, S = class {
	constructor(e, t) {
		this.defaultTimeout = 3e4, this.errorHandler = e, this.responseAdapter = t;
	}
	async search(e, t, n, r, i) {
		t.body = {
			itemsPerPage: r,
			...t.body,
			page: n,
			searchTerm: e
		};
		let o = await this.executeFetch(t, i), s = this.responseAdapter, c = s ? s(o) : o;
		return (!c || typeof c != "object" || !Array.isArray(c.data)) && this.errorHandler.throwCustomError(a.EMPTY_RESPONSE, {
			context: "empty_response",
			url: t.url
		}), {
			data: c.data,
			countPage: c.countPage
		};
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
	async executeFetch(e, t) {
		try {
			this.#e(e);
			let n = new AbortController(), r = setTimeout(() => n.abort(), e.timeout || this.defaultTimeout), i = t ? AbortSignal.any([t, n.signal]) : n.signal, o = this.#t(e), s = this.#n(e, o), c = await fetch(e.url, {
				method: e.method,
				headers: o,
				body: s,
				signal: i
			});
			clearTimeout(r), c.ok || this.errorHandler.throwCustomError(a.FETCH_FAILED, {
				context: "http_error",
				status: c.status,
				statusText: c.statusText,
				url: e.url
			});
			let l;
			try {
				l = await c.json();
			} catch (t) {
				this.errorHandler.throwCustomError(a.INVALID_DATA_FORMAT, {
					context: "json_parse_error",
					url: e.url,
					originalError: t
				});
			}
			return l || this.errorHandler.throwCustomError(a.EMPTY_RESPONSE, {
				context: "empty_response",
				url: e.url
			}), e.success && e.success(l, null), l;
		} catch (t) {
			this.#r(t, e.url, e.timeout || this.defaultTimeout);
		}
	}
};
//#endregion
export { m as Constants, a as ErrorCode, s as ErrorHandler, c as EventEmitter, i as LRUCache, l as Pagination, n as Search, o as SearchError, b as SearchRenderer, x as SearchingLocal, S as SearchingServer, f as Types, r as createElement };
