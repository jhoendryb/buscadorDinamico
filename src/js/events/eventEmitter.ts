import { SearchError, ErrorCode, ErrorHandler } from '../error-handler/index';

/**
 * Implementación de EventEmitter para manejo de eventos personalizados.
 * Permite registrar, remover y emitir eventos con múltiples listeners.
 * @class
 */
export class EventEmitter {
    private events: { [key: string]: Function[] } = {};
    private errorHandler: ErrorHandler;

    /**
     * Crea una instancia de EventEmitter.
     * @param {ErrorHandler} [errorHandler] - Instancia de ErrorHandler para logging de errores.
     *   Si no se proporciona, usa ErrorHandler.getInstance(true).
     */
    constructor(errorHandler?: ErrorHandler) {
        this.errorHandler = errorHandler || ErrorHandler.getInstance(true);
    }

    /**
     * Registra un listener para un evento.
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {EventEmitter} - {@link EventEmitter} para concatenar
     */
    on(eventName: string, callback: Function): EventEmitter {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);

        return this;
    }

    /**
     * Remueve un listener de un evento.
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a remover
     * @returns {EventEmitter} - {@link EventEmitter} para concatenar
     */
    off(eventName: string, callback: Function): EventEmitter {
        if (!this.events[eventName]) return this;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        return this;
    }
    /** 
     * Registra un listener para un evento que se activa solo una vez
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {EventEmitter} - {@link EventEmitter} para concatenar
    */
    once(eventName: string, callback: Function): EventEmitter {
        const wrappedCallback = (data?: any) => {
            callback(data);
            this.off(eventName, wrappedCallback);
        };
        return this.on(eventName, wrappedCallback);
    }

    /**
     * Emite un evento con datos opcionales a todos los listeners registrados.
     * @param {string} eventName - Nombre del evento
     * @param {*} [data] - Datos a pasar a los listeners (opcional)
     * @returns {void}
     */
    emit(eventName: string, data?: Object): void {
        const listeners = this.events[eventName];
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    this.errorHandler.validateType(callback, 'function', 'callback', ErrorCode.INVALID_TYPE_FORMAT);
                    callback(data);
                } catch (error) {
                    if (error instanceof SearchError) {
                        this.errorHandler.logError(error, this);
                    }
                    throw error;
                }
            });
        }
    }

    /**
     * Remueve todos los listeners de un evento específico o de todos los eventos.
     * @param {string} [eventName] - Nombre del evento (si no se proporciona, limpia todos)
     * @returns {void}
     */
    removeAllListeners(eventName?: string): void {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
    }

    /**
     * Obtiene la cantidad de listeners registrados para un evento.
     * @param {string} eventName - Nombre del evento
     * @returns {number} Cantidad de listeners
     */
    listenerCount(eventName: string): number {
        return this.events[eventName] ? this.events[eventName].length : 0;
    }

    /**
     * Obtiene todos los nombres de eventos registrados.
     * @returns {string[]} Array con los nombres de eventos
     */
    eventNames(): string[] {
        return Object.keys(this.events);
    }
}
