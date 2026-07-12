export class TemplateEngine {
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