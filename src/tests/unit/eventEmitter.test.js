import { EventEmitter } from '../../js/events/index.js';

describe('EventEmitter', () => {
    test('debe registrar y ejecutar listener', () => {
        const emitter = new EventEmitter();
        const mockCallback = jest.fn();
        
        emitter.on('test', mockCallback);
        emitter.emit('test', { data: 'hola' });
        
        expect(mockCallback).toHaveBeenCalledWith({ data: 'hola' });
    });

    test('debe retornar objeto con método off', () => {
        const emitter = new EventEmitter();
        const mockCallback = jest.fn();
        
        const subscription = emitter.on('test', mockCallback);
        
        expect(subscription).toHaveProperty('off');
        expect(typeof subscription.off).toBe('function');
    });

    test('debe remover listener con off', () => {
        const emitter = new EventEmitter();
        const mockCallback = jest.fn();
        
        emitter.on('test', mockCallback);
        emitter.off('test', mockCallback);
        emitter.emit('test', { data: 'hola' });
        
        expect(mockCallback).not.toHaveBeenCalled();
    });

    test('debe retornar objeto con método on después de off', () => {
        const emitter = new EventEmitter();
        const mockCallback = jest.fn();
        
        const subscription = emitter.off('test', mockCallback);
        
        expect(subscription).toHaveProperty('on');
        expect(typeof subscription.on).toBe('function');
    });

    test('debe ejecutar múltiples listeners', () => {
        const emitter = new EventEmitter();
        const mockCallback1 = jest.fn();
        const mockCallback2 = jest.fn();
        
        emitter.on('test', mockCallback1);
        emitter.on('test', mockCallback2);
        emitter.emit('test', { data: 'hola' });
        
        expect(mockCallback1).toHaveBeenCalledWith({ data: 'hola' });
        expect(mockCallback2).toHaveBeenCalledWith({ data: 'hola' });
    });

    test('debe contar listeners correctamente', () => {
        const emitter = new EventEmitter();
        
        expect(emitter.listenerCount('test')).toBe(0);
        
        emitter.on('test', () => {});
        expect(emitter.listenerCount('test')).toBe(1);
        
        emitter.on('test', () => {});
        emitter.on('test', () => {});
        expect(emitter.listenerCount('test')).toBe(3);
    });

    test('debe remover todos los listeners de un evento', () => {
        const emitter = new EventEmitter();
        const mockCallback = jest.fn();
        
        emitter.on('test', mockCallback);
        emitter.on('test', mockCallback);
        emitter.removeAllListeners('test');
        
        expect(emitter.listenerCount('test')).toBe(0);
    });

    test('debe remover todos los listeners de todos los eventos', () => {
        const emitter = new EventEmitter();
        
        emitter.on('test1', () => {});
        emitter.on('test2', () => {});
        emitter.removeAllListeners();
        
        expect(emitter.listenerCount('test1')).toBe(0);
        expect(emitter.listenerCount('test2')).toBe(0);
    });
});