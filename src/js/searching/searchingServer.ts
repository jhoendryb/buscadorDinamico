import * as Types from '../types';
import { ErrorHandler, ErrorCode, SearchError } from '../error-handler';

export class SearchingServer {
    private searchInstance: any;
    private errorHandler: ErrorHandler;
    private defaultTimeout: number = 30000; // 30 segundos

    constructor(searchInstance: any, errorHandler: ErrorHandler) {
        this.searchInstance = searchInstance;
        this.errorHandler = errorHandler;
    }

    /**
     * Realiza búsqueda en servidor vía Fetch API.
     */
    async searching(searchTerm: string, isEvent: boolean = false): Promise<any> {
        try {
            this.errorHandler.validateRequired(this.searchInstance.fetch?.url, 'fetch.url', ErrorCode.FETCH_URL_REQUIRED);

            if (searchTerm !== this.searchInstance.searchTerm) {
                this.searchInstance.pagination.goToPage(1);
                this.searchInstance.fetch.body.page = 1;
                this.searchInstance.fetch.body.searchTerm = searchTerm;

                if (this.searchInstance.cacheEnabled) {
                    this.searchInstance.cache.clearCacheByPrefix(this.searchInstance.searchTerm);
                }

                this.searchInstance.showLoading();
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

            if (this.searchInstance.cacheEnabled && cachedData && !isEvent) {
                this.searchInstance._data = cachedData;
                this.searchInstance.processInfiniteScroll();
                return this.searchInstance;
            }

            if (this.searchInstance.sortBy && (this.searchInstance.sortBy !== this.searchInstance.fetch.body.sortBy)) {
                this.searchInstance.fetch.body.sortBy = this.searchInstance.sortBy;
                this.searchInstance.fetch.body.sortOrder = this.searchInstance.sortOrder;
            }

            try {
                const { data, ...rest } = await this.fetch(this.searchInstance.fetch);
                this.searchInstance._data = data;
                this.searchInstance._ajaxResponse.success = rest;

                if (this.searchInstance.cacheEnabled) {
                    this.searchInstance.cache.set(cacheKey, data);
                }

                if (isEvent) {
                    this.searchInstance.events.emit('search', {
                        searchTerm,
                        results: this.searchInstance._data,
                        totalResults: this.searchInstance._data.length,
                        timestamp: new Date().toISOString()
                    } as Types.SearchEventData);
                }
            } catch (error) {
                if (error instanceof SearchError) {
                    this.errorHandler.logError(error, this.searchInstance.events);
                }
                this.searchInstance.events.emit('error', error);
                throw error;
            }

            this.searchInstance.processInfiniteScroll();
            return this.searchInstance;
        } catch (error) {
            if (error instanceof SearchError) {
                this.errorHandler.logError(error, this.searchInstance.events);
            }
            throw error;
        }
    }

    /**
     * Realiza petición HTTP con Fetch API.
     */
    async fetch(config: Types.FetchConfig): Promise<any> {
        try {
            // Validaciones con ErrorHandler
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

            // Configurar AbortController para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.defaultTimeout);

            // Configurar headers
            const headers = new Headers(config.headers || {});

            // Configurar body
            let body: BodyInit | undefined;
            if (config.method.toUpperCase() !== 'GET' && config.body) {
                // Validar que body sea un objeto
                this.errorHandler.validateType(config.body, 'object', 'body', ErrorCode.INVALID_DATA_FORMAT);

                if (config.body instanceof FormData) {
                    body = config.body;
                } else if (headers.get('Content-Type')?.includes('application/x-www-form-urlencoded')) {
                    body = new URLSearchParams(config.body as Record<string, string>);
                } else {
                    if (!headers.has('Content-Type')) {
                        headers.set('Content-Type', 'application/json');
                    }
                    body = JSON.stringify(config.body);
                }
            }

            // Realizar petición fetch
            const response = await fetch(config.url, {
                method: config.method,
                headers,
                body,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Manejar errores HTTP
            if (!response.ok) {
                this.errorHandler.throwCustomError(ErrorCode.FETCH_FAILED, {
                    context: 'http_error',
                    status: response.status,
                    statusText: response.statusText,
                    url: config.url
                });
            }

            // Parsear respuesta JSON
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

            // Validar que la respuesta tenga datos
            if (!data || (Array.isArray(data) && data.length === 0)) {
                this.errorHandler.throwCustomError(ErrorCode.EMPTY_RESPONSE, {
                    context: 'empty_response',
                    url: config.url
                });
            }

            // Ejecutar callback de éxito si existe
            if (config.success) {
                config.success(data, this.searchInstance);
            }

            return data;

        } catch (error) {
            // Manejar error de timeout
            if (error instanceof Error && error.name === 'AbortError') {
                this.errorHandler.throwCustomError(ErrorCode.NETWORK_ERROR, {
                    context: 'request_timeout',
                    url: config.url,
                    timeout: config.timeout || this.defaultTimeout
                });
            }

            // Manejar error de red
            if (error instanceof TypeError && error.message.includes('fetch')) {
                this.errorHandler.throwCustomError(ErrorCode.NETWORK_ERROR, {
                    context: 'network_error',
                    url: config.url,
                    originalError: error
                });
            }

            // Si ya es SearchError, relanzarlo
            if (error instanceof SearchError) {
                throw error;
            }

            // Error genérico
            this.errorHandler.throwCustomError(ErrorCode.FETCH_FAILED, {
                context: 'unknown_error',
                url: config.url,
                originalError: error
            });
        }
    }
}
