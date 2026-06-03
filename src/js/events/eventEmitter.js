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
     * @returns {{on: Function}} Objeto con método on para volver a registrar
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        console.log("Mira voy a borrar de:", eventName, callback);
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);

        return { on: () => this.on(eventName, callback) };
    }

    /**
     * Emite un evento con datos opcionales a todos los listeners registrados.
     * @param {string} eventName - Nombre del evento
     * @param {*} [data] - Datos a pasar a los listeners (opcional)
     * @returns {void}
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => callback(data));
    }

    /**
     * Remueve todos los listeners de un evento específico o de todos los eventos.
     * @param {string} [eventName] - Nombre del evento (si no se proporciona, limpia todos)
     * @returns {void}
     */
    removeAllListeners(eventName) {
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
    listenerCount(eventName) {
        return this.events[eventName] ? this.events[eventName].length : 0;
    }
}
