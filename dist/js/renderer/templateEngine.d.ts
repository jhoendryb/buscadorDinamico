export declare class TemplateEngine {
    /**
     * Renderiza un item usando una plantilla o función de renderizado.
     * @param {Record<string, any>} item - El objeto a renderizar.
     * @param {string | Function | null} template - La plantilla o función de renderizado.
     * @param {(text: string) => string} [highlightText] - Función opcional para resaltar texto.
     * @returns {string} El HTML renderizado.
     */
    render(item: Record<string, any>, template: string | Function | null, highlightText?: (text: string) => string): string;
}
//# sourceMappingURL=templateEngine.d.ts.map