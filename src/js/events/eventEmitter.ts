/**
 * Implementación de EventEmitter para manejo de eventos personalizados.
 * @class
 */
export class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    /**
     * Registra un listener para un evento.
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {Function} Función para remover el listener
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
     * @returns {{on: Function}} Objeto con método on para volver a registrar
     */
    off(eventName: string, callback: Function): EventEmitter {
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
    emit(eventName: string, data?: Object): void {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => callback(data));
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
}
