export class TemplateEngine {
    /**
     * Renderiza un item usando una plantilla o función de renderizado.
     * @param {Record<string, any>} item - El objeto a renderizar.
     * @param {string | Function | null} template - La plantilla o función de renderizado.
     * @param {(text: string) => string} [highlightText] - Función opcional para resaltar texto.
     * @returns {string} El HTML renderizado.
     */
    render(
        item: Record<string, any>,
        template: string | Function | null,
        highlightText?: (text: string) => string
    ): string {
        if (typeof template === 'function') {
            return template(item, highlightText);
        }
        if (typeof template === 'string') {
            return template.replace(/{{(\w+)}}/g, (_, key) => {
                const value = item[key];
                return highlightText ? highlightText(String(value)) : String(value);
            });
        }
        // Sin template: concatenar valores
        const value = Object.values(item).join(' ');
        return highlightText ? highlightText(value) : value;
    }
}