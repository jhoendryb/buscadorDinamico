import { SearchError, ErrorCode, ErrorHandler } from '../error-handler/index';
/**
 * Implementación de EventEmitter para manejo de eventos personalizados.
 * Permite registrar, remover y emitir eventos con múltiples listeners.
 * @class
 */
export class EventEmitter<T extends Record<string, any> = Record<string, any>> {
    private events: { [K in keyof T]?: Function[] } = {} as any;
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
    on<K extends keyof T>(eventName: K, callback: (data: T[K]) => void): EventEmitter<T> {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        try {
            this.errorHandler.validateType(callback, 'function', 'callback', ErrorCode.INVALID_TYPE_FORMAT);
        } catch {
            throw new SearchError(
                { code: ErrorCode.INVALID_TYPE_FORMAT, message: `El callback para "${String(eventName)}" debe ser una función`, solution: "Asegúrate de pasar una función como callback." }
            );
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
    off<K extends keyof T>(eventName: K, callback: Function): EventEmitter<T> {
        if (!this.events[eventName]) return this;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        return this;
    }

    /**
     * Emite un evento con datos opcionales a todos los listeners registrados.
     * @param {string} eventName - Nombre del evento
     * @param {*} [data] - Datos a pasar a los listeners (opcional)
     * @returns {void}
     */
    emit<K extends keyof T>(eventName: K, data: T[K]): void {
        const listeners = this.events[eventName];
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    if (error instanceof SearchError) {
                        this.errorHandler.logError(error, this);
                    } else {
                        console.error(`Error en callback de "${String(eventName)}":`, error);
                    }
                }
            });
        }
    }

    async emitAsync<K extends keyof T>(eventName: K, data: T[K]): Promise<void> {
        const listeners = this.events[eventName];
        if (listeners) {
            const promises = listeners.map(callback => {
                try {
                    const result = callback(data);
                    return Promise.resolve(result);
                } catch (error) {
                    if (error instanceof SearchError) {
                        this.errorHandler.logError(error, this);
                    } else {
                        console.error(`Error en callback de "${String(eventName)}":`, error);
                    }
                    return Promise.resolve();
                }
            });
            await Promise.allSettled(promises);
        }
    }

    /** 
     * Registra un listener para un evento que se activa solo una vez
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {EventEmitter} - {@link EventEmitter} para concatenar
     * Nota: no se puede remover con off(). Usa on() si necesitas removerlo.
    */
    once<K extends keyof T>(eventName: K, callback: (data: T[K]) => void): EventEmitter<T> {
        const wrappedCallback = (data?: any) => {
            callback(data);
            this.off(eventName, wrappedCallback);
        };
        return this.on(eventName, wrappedCallback);
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
    /**
     * Obtiene información de todos los eventos registrados.
     * @returns {Array<{ event: string; listeners: number }>} Array con los nombres de eventos y cantidad de listeners
     */
    getEventList(): { event: string; listeners: number }[] {
        return Object.entries(this.events).map(([event, fns]) => ({
            event,
            listeners: fns?.length || 0
        }));
    }
}
