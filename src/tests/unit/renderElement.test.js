import { createElement } from '../../js/renderElement.js';

describe('createElement', () => {
    test('crea un elemento div correctamente', () => {
        const el = createElement({ element: 'div', className: 'test' });
        expect(el.tagName).toBe('DIV');
        expect(el.className).toBe('test');
    });
});