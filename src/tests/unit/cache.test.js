import { LRUCache } from '../../js/cache/index.js';

describe('LRUCache', () => {
    test('debe crear caché con tamaño por defecto', () => {
        const cache = new LRUCache();
        expect(cache.maxSize).toBe(50);
        expect(cache.size()).toBe(0);
    });

    test('debe crear caché con tamaño personalizado', () => {
        const cache = new LRUCache(10);
        expect(cache.maxSize).toBe(10);
    });

    test('debe almacenar y recuperar valores', () => {
        const cache = new LRUCache();
        cache.set('key1', 'value1');
        expect(cache.get('key1')).toBe('value1');
    });

    test('debe retornar undefined para clave inexistente', () => {
        const cache = new LRUCache();
        expect(cache.get('inexistente')).toBeUndefined();
    });

    test('debe verificar si existe una clave', () => {
        const cache = new LRUCache();
        cache.set('key1', 'value1');
        expect(cache.has('key1')).toBe(true);
        expect(cache.has('inexistente')).toBe(false);
    });

    test('debe eliminar el elemento menos usado cuando excede tamaño', () => {
        const cache = new LRUCache(3);
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');
        cache.set('key4', 'value4'); // Debe eliminar key1 (LRU)
        
        expect(cache.size()).toBe(3);
        expect(cache.has('key1')).toBe(false);
        expect(cache.has('key4')).toBe(true);
    });

    test('debe actualizar elemento como recientemente usado al acceder', () => {
        const cache = new LRUCache(3);
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');
        
        cache.get('key1'); // key1 ahora es recientemente usado
        cache.set('key4', 'value4'); // Debe eliminar key2 (LRU)
        
        expect(cache.has('key1')).toBe(true);
        expect(cache.has('key2')).toBe(false);
        expect(cache.has('key4')).toBe(true);
    });

    test('debe retornar el tamaño correcto', () => {
        const cache = new LRUCache();
        expect(cache.size()).toBe(0);
        
        cache.set('key1', 'value1');
        expect(cache.size()).toBe(1);
        
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');
        expect(cache.size()).toBe(3);
    });

    test('debe limpiar el caché', () => {
        const cache = new LRUCache();
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        
        expect(cache.size()).toBe(2);
        
        cache.clear();
        expect(cache.size()).toBe(0);
        expect(cache.has('key1')).toBe(false);
    });

    test('debe almacenar diferentes tipos de valores', () => {
        const cache = new LRUCache();
        
        cache.set('string', 'valor');
        cache.set('number', 123);
        cache.set('object', { name: 'Juan' });
        cache.set('array', [1, 2, 3]);
        
        expect(cache.get('string')).toBe('valor');
        expect(cache.get('number')).toBe(123);
        expect(cache.get('object')).toEqual({ name: 'Juan' });
        expect(cache.get('array')).toEqual([1, 2, 3]);
    });
});