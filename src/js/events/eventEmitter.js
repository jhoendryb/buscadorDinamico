// src/js/events/eventEmitter.js
/**
 * Implementación de EventEmitter para manejo de eventos personalizados.
 * @class
 */
export class EventEmitter {
    /**
     * Crea una instancia de EventEmitter.
     */
    constructor() {
        this.events = {};
    }

    /**
     * Registra un listener para un evento.
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {Function} Función para remover el listener
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);

        return { off: () => this.off(eventName, callback) };
    }

    /**
     * Remueve un listener de un evento.
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a remover
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        console.log("Mira voy a borrar de:", eventName, callback);
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);

        return { on: () => this.on(eventName, callback) };
    }

    /**
     * Emite un evento con datos opcionales.
     * @param {string} eventName - Nombre del evento
     * @param {*} [data] - Datos a pasar a los listeners
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => callback(data));
    }

    /**
     * Remueve todos los listeners de un evento.
     * @param {string} eventName - Nombre del evento
     */
    removeAllListeners(eventName) {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
    }

    /**
     * Obtiene la cantidad de listeners de un evento.
     * @param {string} eventName - Nombre del evento
     * @returns {number} Cantidad de listeners
     */
    listenerCount(eventName) {
        return this.events[eventName] ? this.events[eventName].length : 0;
    }
}
