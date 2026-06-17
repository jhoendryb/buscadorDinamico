import { ErrorHandler, ErrorCode, SearchError } from '../../js/error-handler/index';

describe('ErrorHandler', () => {
    let errorHandler: ErrorHandler;

    beforeEach(() => {
        errorHandler = ErrorHandler.getInstance(true);
    });

    describe('validateRequired', () => {
        it('debe lanzar error cuando el valor es undefined', () => {
            expect(() => {
                errorHandler.validateRequired(undefined, 'test', ErrorCode.ELEMENT_REQUIRED);
            }).toThrow(SearchError);
        });

        it('no debe lanzar error cuando el valor existe', () => {
            expect(() => {
                errorHandler.validateRequired('test', 'test', ErrorCode.ELEMENT_REQUIRED);
            }).not.toThrow();
        });
    });

    describe('validateType', () => {
        it('debe lanzar error cuando el tipo es incorrecto', () => {
            expect(() => {
                errorHandler.validateType(123, 'string', 'test', ErrorCode.ELEMENT_TYPE_INVALID);
            }).toThrow(SearchError);
        });

        it('no debe lanzar error cuando el tipo es correcto', () => {
            expect(() => {
                errorHandler.validateType('test', 'string', 'test', ErrorCode.ELEMENT_TYPE_INVALID);
            }).not.toThrow();
        });
    });

    describe('validateRange', () => {
        it('debe lanzar error cuando el valor está fuera del rango', () => {
            expect(() => {
                errorHandler.validateRange(0, 1, 'test', ErrorCode.ITEMSPERPAGE_VALUE_INVALID);
            }).toThrow(SearchError);
        });

        it('no debe lanzar error cuando el valor está en el rango', () => {
            expect(() => {
                errorHandler.validateRange(10, 1, 'test', ErrorCode.ITEMSPERPAGE_VALUE_INVALID);
            }).not.toThrow();
        });
    });

    describe('formatError', () => {
        it('debe formatear el error correctamente', () => {
            const error = new SearchError({
                code: ErrorCode.ELEMENT_REQUIRED,
                message: 'Test message',
                solution: 'Test solution'
            });

            const formatted = errorHandler.formatError(error);
            expect(formatted).toContain('[SEARCH_001]');
            expect(formatted).toContain('Test message');
            expect(formatted).toContain('Test solution');
        });
    });
});
