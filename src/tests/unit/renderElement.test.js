import { createElement } from '../../js/renderElement.js';

describe('createElement', () => {
    test('crea un elemento div correctamente', () => {
        const el = createElement({ element: 'div', className: 'test' });
        expect(el.tagName).toBe('DIV');
        expect(el.className).toBe('test');
    });
    test('debe crear elemento con children anidados', () => {
        const el = createElement({
            element: 'div',
            className: 'parent',
            children: [
                { element: 'span', textContent: 'Hola' },
                { element: 'span', textContent: 'Mundo' }
            ]
        });

        expect(el.children.length).toBe(2);
        expect(el.children[0].textContent).toBe('Hola');
        expect(el.children[1].textContent).toBe('Mundo');
    });

    test('debe crear elemento con attributes personalizados', () => {
        const el = createElement({
            element: 'input',
            attributes: {
                type: 'text',
                placeholder: 'Buscar...',
                'aria-label': 'Campo de búsqueda'
            }
        });

        expect(el.getAttribute('type')).toBe('text');
        expect(el.getAttribute('placeholder')).toBe('Buscar...');
        expect(el.getAttribute('aria-label')).toBe('Campo de búsqueda');
    });

    test('debe crear elemento con textContent', () => {
        const el = createElement({
            element: 'p',
            textContent: 'Texto de prueba'
        });

        expect(el.textContent).toBe('Texto de prueba');
    });

    test('debe crear elemento con evento', () => {
        const mockCallback = jest.fn();
        const el = createElement({
            element: 'button',
            textContent: 'Click',
            event: {
                click: mockCallback
            }
        });

        el.click();
        expect(mockCallback).toHaveBeenCalled();
    });

    test('debe crear elemento complejo con múltiples propiedades', () => {
        const el = createElement({
            element: 'div',
            className: 'complex',
            id: 'test-id',
            attributes: { 'data-test': 'value' },
            children: [
                { element: 'span', textContent: 'Anidado' }
            ]
        });

        expect(el.className).toBe('complex');
        expect(el.id).toBe('test-id');
        expect(el.getAttribute('data-test')).toBe('value');
        expect(el.children.length).toBe(1);
    });

});