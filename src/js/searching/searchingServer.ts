import * as Types from '../types';
import { Search } from '../app';
import { ErrorHandler, ErrorCode, SearchError } from '../error-handler';

/**
 * Clase que maneja la búsqueda de datos en servidor vía Fetch API.
 * Realiza peticiones HTTP con soporte para caché, timeout y manejo de errores.
 */
export class SearchingServer {
    private searchInstance: any;
    private errorHandler: ErrorHandler;
    private defaultTimeout: number = 30000; // 30 segundos

    /**
     * Crea una instancia de SearchingServer.
     * @param {Search} searchInstance - Instancia principal de Search
     * @param {ErrorHandler} errorHandler - Instancia de ErrorHandler para gestión de errores
     */
    constructor(searchInstance: Search, errorHandler: ErrorHandler) {
        this.searchInstance = searchInstance;
        this.errorHandler = errorHandler;
    }

    /**
     * Realiza búsqueda en servidor vía Fetch API.
     * Gestiona caché, paginación y emisión de eventos.
     * @param {string} searchTerm - Término de búsqueda a enviar al servidor
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario (emite evento 'search')
     * @returns {Promise<any>} Instancia de Search para encadenamiento
     */
    async searching(searchTerm: string, isEvent: boolean = false): Promise<any> {
        try {
            this.errorHandler.validateRequired(this.searchInstance.fetch?.url, 'fetch.url', ErrorCode.FETCH_URL_REQUIRED);

            if (searchTerm !== this.searchInstance.searchTerm) {
                this.searchInstance.pagination.goToPage(1);
                this.searchInstance.fetch.body.page = 1;
                this.searchInstance.fetch.body.searchTerm = searchTerm;

                this.searchInstance.renderer.showLoading(this.searchInstance.t.loading);
            }

            if (this.searchInstance.pagination.getCurrentPage() !== this.searchInstance.fetch.body.page) {
                this.searchInstance.pagination.goToPage(this.searchInstance.fetch.body.page);
            }

            if (this.searchInstance.itemsPerPage !== this.searchInstance.fetch.body.itemsPerPage || !this.searchInstance.fetch.body.itemsPerPage) {
                this.searchInstance.fetch.body.itemsPerPage = this.searchInstance.itemsPerPage;
            }

            this.searchInstance.searchTerm = searchTerm;

            const cacheKey = this.searchInstance.getCacheKey(searchTerm, this.searchInstance.pagination.getCurrentPage());
            const cachedData = this.searchInstance.cache.get(cacheKey);

            if (this.searchInstance.cacheEnabled && cachedData) {
                this.searchInstance._data = cachedData;
                console.log('Usando caché para búsqueda:', cacheKey);
                if (isEvent) {
                    this.searchInstance.events.emit('search', {
                        searchTerm,
                        results: this.searchInstance._data,
                        totalResults: this.searchInstance._data.length,
                        timestamp: new Date().toISOString()
                    } as Types.SearchEventData);
                }
                return this.searchInstance;
            }

            if (this.searchInstance.sortBy && (this.searchInstance.sortBy !== this.searchInstance.fetch.body.sortBy)) {
                this.searchInstance.fetch.body.sortBy = this.searchInstance.sortBy;
                this.searchInstance.fetch.body.sortOrder = this.searchInstance.sortOrder;
            }

            const response = await this.fetch(this.searchInstance.fetch);
            const adapter = this.searchInstance.responseAdapter;
            const result = adapter ? adapter(response) : response;
            this.searchInstance._data = result.data;
            this.searchInstance._ajaxResponse.success = { countPage: result.countPage };

            if (this.searchInstance.cacheEnabled) {
                this.searchInstance.cache.set(cacheKey, this.searchInstance._data);
            }

            if (isEvent) {
                this.searchInstance.events.emit('search', {
                    searchTerm,
                    results: this.searchInstance._data,
                    totalResults: this.searchInstance._data.length,
                    timestamp: new Date().toISOString()
                } as Types.SearchEventData);
            }

            return this.searchInstance;
        } catch (error) {
            if (error instanceof SearchError) {
                this.errorHandler.logError(error, this.searchInstance.events);
            }
            this.searchInstance.events.emit('error', error);
            throw error;
        }
    }
    #validateFetchConfig(config: Types.FetchConfig): void {
        this.errorHandler.validateRequired(config.url, 'url', ErrorCode.FETCH_URL_REQUIRED);
        this.errorHandler.validateRequired(config.method, 'method', ErrorCode.FETCH_URL_REQUIRED);
        this.errorHandler.validateType(config.method, 'string', 'method', ErrorCode.FETCH_URL_REQUIRED);

        // Validar método HTTP
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        if (!validMethods.includes(config.method.toUpperCase())) {
            this.errorHandler.throwCustomError(ErrorCode.FETCH_FAILED, {
                context: 'invalid_http_method',
                providedMethod: config.method,
                validMethods
            });
        }
    }
    #configureHeaders(config: Types.FetchConfig): Headers {
        const headers = new Headers(config.headers || {});

        if (config.method.toUpperCase() !== 'GET' && config.body) {
            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }
        }

        return headers;
    }
    #configureBody(config: Types.FetchConfig, headers: Headers): BodyInit | undefined {
        if (config.method.toUpperCase() === 'GET' || !config.body) {
            return undefined;
        }

        this.errorHandler.validateType(config.body, 'object', 'body', ErrorCode.INVALID_DATA_FORMAT);

        if (config.body instanceof FormData) {
            return config.body;
        } else if (headers.get('Content-Type')?.includes('application/x-www-form-urlencoded')) {
            return new URLSearchParams(config.body as Record<string, string>);
        } else {
            return JSON.stringify(config.body);
        }
    }
    #handleFetchError(error: unknown, url: string, timeout: number): never {
        if (error instanceof Error && error.name === 'AbortError') {
            this.errorHandler.throwCustomError(ErrorCode.NETWORK_ERROR, {
                context: 'request_timeout',
                url: url,
                timeout: timeout
            });
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            this.errorHandler.throwCustomError(ErrorCode.NETWORK_ERROR, {
                context: 'network_error',
                url: url,
                originalError: error
            });
        }

        if (error instanceof SearchError) {
            throw error;
        }

        this.errorHandler.throwCustomError(ErrorCode.FETCH_FAILED, {
            context: 'unknown_error',
            url: url,
            originalError: error
        });
    }


    /**
     * Realiza petición HTTP con Fetch API.
     * Soporta timeout con AbortController, múltiples Content-Type y manejo de errores.
     * @param {Types.FetchConfig} config - Configuración de la petición (url, method, headers, body, timeout)
     * @returns {Promise<any>} Datos JSON recibidos del servidor
     * @throws {SearchError} Si hay errores de red, timeout o formato de datos inválido
     */
    async fetch(config: Types.FetchConfig): Promise<any> {
        try {
            this.#validateFetchConfig(config);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.defaultTimeout);

            const headers = this.#configureHeaders(config);
            const body = this.#configureBody(config, headers);

            const response = await fetch(config.url, {
                method: config.method,
                headers,
                body,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                this.errorHandler.throwCustomError(ErrorCode.FETCH_FAILED, {
                    context: 'http_error',
                    status: response.status,
                    statusText: response.statusText,
                    url: config.url
                });
            }

            let data;
            try {
                data = await response.json();
            } catch (error) {
                this.errorHandler.throwCustomError(ErrorCode.INVALID_DATA_FORMAT, {
                    context: 'json_parse_error',
                    url: config.url,
                    originalError: error
                });
            }

            if (!data || (Array.isArray(data) && data.length === 0)) {
                this.errorHandler.throwCustomError(ErrorCode.EMPTY_RESPONSE, {
                    context: 'empty_response',
                    url: config.url
                });
            }

            if (config.success) {
                config.success(data, this.searchInstance);
            }

            return data;

        } catch (error) {
            this.#handleFetchError(error, config.url, config.timeout || this.defaultTimeout);
        }
    }

}
