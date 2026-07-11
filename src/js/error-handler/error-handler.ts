import { ErrorCode, ErrorDetails } from './error-codes';
import { EventEmitter } from '../events/eventEmitter';

/**
 * Clase de error personalizada para errores del componente Search.
 * Extiende Error con código, solución y contexto adicional.
 */
export class SearchError extends Error {
    code: ErrorCode;
    solution: string;
    documentation?: string;
    context?: Record<string, any>;

    /**
     * Crea una instancia de SearchError.
     * @param {ErrorDetails} details - Detalles del error (código, mensaje, solución)
     * @param {Record<string, any>} [context] - Contexto adicional del error
     */
    constructor(details: ErrorDetails, context?: Record<string, any>) {
        super(details.message);
        this.name = 'SearchError';
        this.code = details.code;
        this.solution = details.solution;
        this.documentation = details.documentation;
        this.context = context;
    }
}

/**
 * Clase singleton para gestión centralizada de errores.
 * Proporciona validación de parámetros, mensajes de error con soluciones
 * y logging en modo desarrollo.
 */
export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorMessages: Map<ErrorCode, ErrorDetails>;
    private developmentMode: boolean;

    /**
     * Crea una instancia privada de ErrorHandler (singleton).
     * @param {boolean} [developmentMode=true] - Si es true, muestra logs detallados en consola
     */
    private constructor(developmentMode: boolean = true) {
        this.developmentMode = developmentMode;
        this.errorMessages = new Map();
        this.initializeErrorMessages();
    }

    /**
     * Obtiene la instancia singleton de ErrorHandler.
     * @param {boolean} [developmentMode] - Modo desarrollo (solo se usa en la primera llamada)
     * @returns {ErrorHandler} Instancia singleton de ErrorHandler
     */
    static getInstance(developmentMode?: boolean): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler(developmentMode ?? true);
        }
        return ErrorHandler.instance;
    }

    /**
     * Inicializa el mapa de mensajes de error con todos los códigos soportados.
     * @private
     */
    private initializeErrorMessages(): void {
        // Errores de validación
        this.errorMessages.set(ErrorCode.ELEMENT_REQUIRED, {
            code: ErrorCode.ELEMENT_REQUIRED,
            message: "El parámetro 'element' es requerido",
            solution: "Proporciona el selector CSS del contenedor donde se renderizará el buscador.\nEjemplo: { element: '.mi-buscador' }",
            documentation: "#configuration-element"
        });

        this.errorMessages.set(ErrorCode.ELEMENT_TYPE_INVALID, {
            code: ErrorCode.ELEMENT_TYPE_INVALID,
            message: "El parámetro 'element' debe ser un string con el selector CSS",
            solution: "El parámetro element debe ser un string válido de selector CSS.\nEjemplo: '.mi-buscador', '#buscador-id', '[data-search]'",
            documentation: "#configuration-element"
        });

        this.errorMessages.set(ErrorCode.FETCH_URL_REQUIRED, {
            code: ErrorCode.FETCH_URL_REQUIRED,
            message: "El parámetro 'fetch.url' es requerido cuando procesServer es true",
            solution: "Configura la URL del endpoint de búsqueda.\nEjemplo: { fetch: { url: '/api/search' } }",
            documentation: "#configuration-fetch"
        });

        this.errorMessages.set(ErrorCode.ITEMSPERPAGE_TYPE_INVALID, {
            code: ErrorCode.ITEMSPERPAGE_TYPE_INVALID,
            message: "El parámetro 'itemsPerPage' debe ser un número",
            solution: "El parámetro itemsPerPage debe ser de tipo number.\nEjemplo: { itemsPerPage: 10 }",
            documentation: "#configuration-pagination"
        });

        this.errorMessages.set(ErrorCode.ITEMSPERPAGE_VALUE_INVALID, {
            code: ErrorCode.ITEMSPERPAGE_VALUE_INVALID,
            message: "El parámetro 'itemsPerPage' debe ser mayor a 0",
            solution: "El parámetro itemsPerPage debe ser un número positivo mayor a 0.\nEjemplo: { itemsPerPage: 10 }",
            documentation: "#configuration-pagination"
        });

        this.errorMessages.set(ErrorCode.INVALID_TYPE_FORMAT, {
            code: ErrorCode.INVALID_TYPE_FORMAT,
            message: "El parámetro tiene un formato de tipo inválido",
            solution: "Verifica que el parámetro tenga el formato correcto.",
            documentation: "#configuration-invalid-type"
        });

        // Errores de DOM
        this.errorMessages.set(ErrorCode.ELEMENT_NOT_FOUND, {
            code: ErrorCode.ELEMENT_NOT_FOUND,
            message: "No existe el contenedor especificado",
            solution: "Verifica que el selector CSS sea correcto y que el elemento exista en el DOM antes de inicializar el componente.",
            documentation: "#troubleshooting-dom"
        });

        this.errorMessages.set(ErrorCode.CONTAINER_NOT_FOUND, {
            code: ErrorCode.CONTAINER_NOT_FOUND,
            message: "No existe el contenedor principal",
            solution: "Asegúrate de que el elemento especificado exista en el DOM antes de inicializar el componente.",
            documentation: "#troubleshooting-dom"
        });

        // Errores de red
        this.errorMessages.set(ErrorCode.NETWORK_ERROR, {
            code: ErrorCode.NETWORK_ERROR,
            message: "Error de conexión al servidor",
            solution: "Verifica tu conexión a internet y que el servidor esté disponible.",
            documentation: "#troubleshooting-network"
        });

        this.errorMessages.set(ErrorCode.FETCH_FAILED, {
            code: ErrorCode.FETCH_FAILED,
            message: "Error al obtener datos del servidor",
            solution: "Verifica que la URL del endpoint sea correcta y que el servidor responda con el formato esperado.",
            documentation: "#troubleshooting-fetch"
        });

        // Errores de datos
        this.errorMessages.set(ErrorCode.INVALID_DATA_FORMAT, {
            code: ErrorCode.INVALID_DATA_FORMAT,
            message: "Formato de datos inválido",
            solution: "Verifica que los datos tengan el formato esperado por el componente.",
            documentation: "#data-format"
        });

        this.errorMessages.set(ErrorCode.EMPTY_RESPONSE, {
            code: ErrorCode.EMPTY_RESPONSE,
            message: "La respuesta del servidor está vacía",
            solution: "Verifica que el endpoint devuelva datos en el formato esperado.",
            documentation: "#data-format"
        });

        // Errores internos
        this.errorMessages.set(ErrorCode.INITIALIZATION_FAILED, {
            code: ErrorCode.INITIALIZATION_FAILED,
            message: "Error al inicializar el componente",
            solution: "Verifica la configuración y los parámetros proporcionados.",
            documentation: "#troubleshooting-initialization"
        });

        this.errorMessages.set(ErrorCode.RENDER_ERROR, {
            code: ErrorCode.RENDER_ERROR,
            message: "Error al renderizar el componente",
            solution: "Verifica que el DOM esté disponible y que no haya conflictos con otros componentes.",
            documentation: "#troubleshooting-render"
        });
    }

    /**
     * Valida que un valor no sea falsy (null, undefined, 0, "", etc.).
     * @param {any} value - Valor a validar
     * @param {string} paramName - Nombre del parámetro para el mensaje de error
     * @param {ErrorCode} errorCode - Código de error a lanzar si la validación falla
     * @returns {void}
     * @throws {SearchError} Si el valor es falsy
     */
    validateRequired(value: any, paramName: string, errorCode: ErrorCode): void {
        if (!value) {
            const details = this.errorMessages.get(errorCode)!;
            throw new SearchError(details, { paramName, providedValue: value });
        }
    }

    /**
     * Valida que un valor tenga el tipo esperado.
     * @param {any} value - Valor a validar
     * @param {string} expectedType - Tipo esperado (ej: "string", "number", "boolean")
     * @param {string} paramName - Nombre del parámetro para el mensaje de error
     * @param {ErrorCode} errorCode - Código de error a lanzar si la validación falla
     * @returns {void}
     * @throws {SearchError} Si el tipo no coincide
     */
    validateType(value: any, expectedType: string, paramName: string, errorCode: ErrorCode): void {
        if (typeof value !== expectedType) {
            const details = this.errorMessages.get(errorCode)!;
            throw new SearchError(details, { paramName, expectedType, providedType: typeof value });
        }
    }

    /**
     * Valida que un número esté dentro de un rango mínimo.
     * @param {number} value - Valor numérico a validar
     * @param {number} min - Valor mínimo permitido (inclusivo)
     * @param {string} paramName - Nombre del parámetro para el mensaje de error
     * @param {ErrorCode} errorCode - Código de error a lanzar si la validación falla
     * @returns {void}
     * @throws {SearchError} Si el valor es menor que min
     */
    validateRange(value: number, min: number, paramName: string, errorCode: ErrorCode): void {
        if (value < min) {
            const details = this.errorMessages.get(errorCode)!;
            throw new SearchError(details, { paramName, minValue: min, providedValue: value });
        }
    }

    /**
     * Valida que un elemento exista en el DOM usando un selector CSS.
     * @param {string} selector - Selector CSS del elemento a buscar
     * @param {ErrorCode} errorCode - Código de error a lanzar si el elemento no existe
     * @returns {void}
     * @throws {SearchError} Si el elemento no existe en el DOM
     */
    validateElementExists(selector: string, errorCode: ErrorCode): void {
        const element = document.querySelector(selector);
        if (!element) {
            const details = this.errorMessages.get(errorCode)!;
            throw new SearchError(details, { selector });
        }
    }

    /**
     * Lanza un error personalizado con el código especificado.
     * @param {ErrorCode} errorCode - Código de error a lanzar
     * @param {Record<string, any>} [context] - Contexto adicional del error
     * @returns {never} Nunca retorna (siempre lanza excepción)
     * @throws {SearchError} Siempre lanza la excepción
     */
    throwCustomError(errorCode: ErrorCode, context?: Record<string, any>): never {
        const details = this.errorMessages.get(errorCode)!;
        throw new SearchError(details, context);
    }

    /**
     * Registra un error en consola (modo desarrollo) y emite evento 'error'.
     * @param {SearchError} error - Error a registrar
     * @param {EventEmitter} [event] - Instancia de EventEmitter para emitir evento
     * @returns {void}
     */
    logError(error: SearchError, event?: EventEmitter): void {
        if (this.developmentMode) {
            console.error(`[${error.code}] ${error.message}`);
            console.error(`Solución: ${error.solution}`);
            if (error.context) {
                console.error('Contexto:', error.context);
            }
        }
        event?.emit('error', {
            code: error.code,
            message: error.message,
            solution: error.solution,
            context: error.context
        });
    }

    /**
     * Formatea un error como string legible para el usuario.
     * @param {SearchError} error - Error a formatear
     * @returns {string} Mensaje formateado con código, mensaje, solución y contexto
     */
    formatError(error: SearchError): string {
        let message = `[${error.code}] ${error.message}\n`;
        message += `Solución: ${error.solution}`;

        if (this.developmentMode && error.context) {
            message += `\nContexto: ${JSON.stringify(error.context, null, 2)}`;
        }

        if (error.documentation) {
            message += `\nDocumentación: https://tu-documentacion.com${error.documentation}`;
        }

        return message;
    }
}
