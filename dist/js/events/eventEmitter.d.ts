import { ErrorHandler } from '../error-handler/index';
/**
 * Implementación de EventEmitter para manejo de eventos personalizados.
 * Permite registrar, remover y emitir eventos con múltiples listeners.
 * @class
 */
export declare class EventEmitter<T extends Record<string, any> = Record<string, any>> {
    private events;
    private errorHandler;
    /**
     * Crea una instancia de EventEmitter.
     * @param {ErrorHandler} [errorHandler] - Instancia de ErrorHandler para logging de errores.
     *   Si no se proporciona, usa ErrorHandler.getInstance(true).
     */
    constructor(errorHandler?: ErrorHandler);
    /**
     * Registra un listener para un evento.
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {EventEmitter} - {@link EventEmitter} para concatenar
     */
    on<K extends keyof T>(eventName: K, callback: (data: T[K]) => void): EventEmitter<T>;
    /**
     * Remueve un listener de un evento.
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a remover
     * @returns {EventEmitter} - {@link EventEmitter} para concatenar
     */
    off<K extends keyof T>(eventName: K, callback: Function): EventEmitter<T>;
    /**
     * Emite un evento con datos opcionales a todos los listeners registrados.
     * @param {string} eventName - Nombre del evento
     * @param {*} [data] - Datos a pasar a los listeners (opcional)
     * @returns {void}
     */
    emit<K extends keyof T>(eventName: K, data: T[K]): void;
    emitAsync<K extends keyof T>(eventName: K, data: T[K]): Promise<void>;
    /**
     * Registra un listener para un evento que se activa solo una vez
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {EventEmitter} - {@link EventEmitter} para concatenar
     * Nota: no se puede remover con off(). Usa on() si necesitas removerlo.
    */
    once<K extends keyof T>(eventName: K, callback: (data: T[K]) => void): EventEmitter<T>;
    /**
     * Remueve todos los listeners de un evento específico o de todos los eventos.
     * @param {string} [eventName] - Nombre del evento (si no se proporciona, limpia todos)
     * @returns {void}
     */
    removeAllListeners(eventName?: string): void;
    /**
     * Obtiene la cantidad de listeners registrados para un evento.
     * @param {string} eventName - Nombre del evento
     * @returns {number} Cantidad de listeners
     */
    listenerCount(eventName: string): number;
    /**
     * Obtiene todos los nombres de eventos registrados.
     * @returns {string[]} Array con los nombres de eventos
     */
    eventNames(): string[];
    /**
     * Obtiene información de todos los eventos registrados.
     * @returns {Array<{ event: string; listeners: number }>} Array con los nombres de eventos y cantidad de listeners
     */
    getEventList(): {
        event: string;
        listeners: number;
    }[];
}
//# sourceMappingURL=eventEmitter.d.ts.map