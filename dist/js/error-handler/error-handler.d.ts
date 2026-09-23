import { ErrorCode, ErrorDetails } from './error-codes';
import { EventEmitter } from '../events/eventEmitter';
/**
 * Clase de error personalizada para errores del componente Search.
 * Extiende Error con código, solución y contexto adicional.
 */
export declare class SearchError extends Error {
    code: ErrorCode;
    solution: string;
    documentation?: string;
    context?: Record<string, any>;
    /**
     * Crea una instancia de SearchError.
     * @param {ErrorDetails} details - Detalles del error (código, mensaje, solución)
     * @param {Record<string, any>} [context] - Contexto adicional del error
     */
    constructor(details: ErrorDetails, context?: Record<string, any>);
}
/**
 * Clase singleton para gestión centralizada de errores.
 * Proporciona validación de parámetros, mensajes de error con soluciones
 * y logging en modo desarrollo.
 */
export declare class ErrorHandler {
    private static instance;
    private errorMessages;
    private developmentMode;
    private documentationUrl;
    private static readonly DEFAULT_ERROR_MESSAGES;
    /**
     * Crea una instancia privada de ErrorHandler (singleton).
     * @param {boolean} [developmentMode=true] - Si es true, muestra logs detallados en consola
     */
    private constructor();
    /**
     * Obtiene la instancia singleton de ErrorHandler.
     * @param {boolean} [developmentMode] - Modo desarrollo (solo se usa en la primera llamada)
     * @returns {ErrorHandler} Instancia singleton de ErrorHandler
     */
    static getInstance(developmentMode?: boolean): ErrorHandler;
    isDevelopmentMode(): boolean;
    setDocumentationUrl(url: string): void;
    /**
     * Inicializa el mapa de mensajes de error con todos los códigos soportados.
     * @private
     */
    private initializeErrorMessages;
    /**
     * Valida que un valor no sea falsy (null, undefined, 0, "", etc.).
     * @param {any} value - Valor a validar
     * @param {string} paramName - Nombre del parámetro para el mensaje de error
     * @param {ErrorCode} errorCode - Código de error a lanzar si la validación falla
     * @returns {void}
     * @throws {SearchError} Si el valor es falsy
     */
    validateRequired(value: any, paramName: string, errorCode: ErrorCode): void;
    /**
     * Valida que un valor tenga el tipo esperado.
     * @param {any} value - Valor a validar
     * @param {string} expectedType - Tipo esperado (ej: "string", "number", "boolean")
     * @param {string} paramName - Nombre del parámetro para el mensaje de error
     * @param {ErrorCode} errorCode - Código de error a lanzar si la validación falla
     * @returns {void}
     * @throws {SearchError} Si el tipo no coincide
     */
    validateType(value: any, expectedType: string, paramName: string, errorCode: ErrorCode): void;
    /**
     * Valida que un número esté dentro de un rango mínimo.
     * @param {number} value - Valor numérico a validar
     * @param {number} min - Valor mínimo permitido (inclusivo)
     * @param {string} paramName - Nombre del parámetro para el mensaje de error
     * @param {ErrorCode} errorCode - Código de error a lanzar si la validación falla
     * @returns {void}
     * @throws {SearchError} Si el valor es menor que min
     */
    validateRange(value: number, min: number, paramName: string, errorCode: ErrorCode): void;
    /**
     * Valida que un elemento exista en el DOM usando un selector CSS.
     * @param {string} selector - Selector CSS del elemento a buscar
     * @param {ErrorCode} errorCode - Código de error a lanzar si el elemento no existe
     * @returns {void}
     * @throws {SearchError} Si el elemento no existe en el DOM
     */
    validateElementExists(selector: string, errorCode: ErrorCode): void;
    /**
     * Lanza un error personalizado con el código especificado.
     * @param {ErrorCode} errorCode - Código de error a lanzar
     * @param {Record<string, any>} [context] - Contexto adicional del error
     * @returns {never} Nunca retorna (siempre lanza excepción)
     * @throws {SearchError} Siempre lanza la excepción
     */
    throwCustomError(errorCode: ErrorCode, context?: Record<string, any>): never;
    /**
     * Registra un error en consola (modo desarrollo) y emite evento 'error'.
     * @param {SearchError} error - Error a registrar
     * @param {EventEmitter} [event] - Instancia de EventEmitter para emitir evento
     * @returns {void}
     */
    logError(error: SearchError, event?: EventEmitter): void;
    /**
     * Formatea un error como string legible para el usuario.
     * @param {SearchError} error - Error a formatear
     * @returns {string} Mensaje formateado con código, mensaje, solución y contexto
     */
    formatError(error: SearchError): string;
}
//# sourceMappingURL=error-handler.d.ts.map