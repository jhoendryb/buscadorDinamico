import * as Types from '../types';
import { ErrorHandler, ErrorCode, SearchError } from '../error-handler';

/**
 * Clase que maneja la búsqueda de datos en servidor vía Fetch API.
 * Realiza peticiones HTTP con soporte para caché, timeout y manejo de errores.
 */
export class SearchingServer {
    private errorHandler: ErrorHandler;
    private responseAdapter?: Types.SearchParams['responseAdapter'];
    private defaultTimeout: number = 30000;

    constructor(errorHandler: ErrorHandler, responseAdapter?: Types.SearchParams['responseAdapter']) {
        this.errorHandler = errorHandler;
        this.responseAdapter = responseAdapter;
    }

    /**
     * Realiza búsqueda en servidor vía Fetch API.
     * Gestiona caché, paginación y emisión de eventos.
     * @param {string} searchTerm - Término de búsqueda a enviar al servidor
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario (emite evento 'search')
     * @returns {Promise<any>} Instancia de Search para encadenamiento
     */
    async search(
        searchTerm: string,
        fetchConfig: Types.FetchConfig,
        page: number,
        itemsPerPage: number
    ): Promise<Types.SearchResult> {
        fetchConfig.body = {
            itemsPerPage,
            ...fetchConfig.body,
            page,
            searchTerm
        };
        const response = await this.executeFetch(fetchConfig);
        const adapter = this.responseAdapter;
        const result = adapter ? adapter(response) : response;
        return {
            data: result.data,
            countPage: result.countPage
        };
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
     * Admite la configuración de timeouts, múltiples Content-Type y manejo de errores.
     * @param {Types.FetchConfig} config - Configuración de la petición (url, method, headers, body, timeout)
     * @returns {Promise<any>} - Datos JSON recibidos del servidor
     * @throws {SearchError} - Si se produce un error de red, timeout o si el formato de datos recibido es inválido
     */
    async executeFetch(config: Types.FetchConfig): Promise<any> {
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
                config.success(data, null);
            }

            return data;

        } catch (error) {
            this.#handleFetchError(error, config.url, config.timeout || this.defaultTimeout);
        }
    }

}
