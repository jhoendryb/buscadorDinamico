import * as Types from '../types';
import { ErrorHandler } from '../error-handler';
/**
 * Clase que maneja la búsqueda de datos en servidor vía Fetch API.
 * Realiza peticiones HTTP con soporte para caché, timeout y manejo de errores.
 */
export declare class SearchingServer {
    #private;
    private errorHandler;
    private responseAdapter?;
    private defaultTimeout;
    constructor(errorHandler: ErrorHandler, responseAdapter?: Types.SearchParams['responseAdapter']);
    /**
     * Realiza búsqueda en servidor vía Fetch API.
     * Gestiona caché, paginación y emisión de eventos.
     * @param {string} searchTerm - Término de búsqueda a enviar al servidor
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario (emite evento 'search')
     * @returns {Promise<any>} Instancia de Search para encadenamiento
     */
    search(searchTerm: string, fetchConfig: Types.FetchConfig, page: number, itemsPerPage: number, userSignal?: AbortSignal): Promise<Types.SearchResult>;
    /**
     * Realiza petición HTTP con Fetch API.
     * Admite la configuración de timeouts, múltiples Content-Type y manejo de errores.
     * @param {Types.FetchConfig} config - Configuración de la petición (url, method, headers, body, timeout)
     * @returns {Promise<any>} - Datos JSON recibidos del servidor
     * @throws {SearchError} - Si se produce un error de red, timeout o si el formato de datos recibido es inválido
     */
    executeFetch(config: Types.FetchConfig, userSignal?: AbortSignal): Promise<any>;
}
//# sourceMappingURL=searchingServer.d.ts.map