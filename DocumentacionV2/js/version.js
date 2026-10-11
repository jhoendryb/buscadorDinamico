/**
 * Inyecta la versión del paquete npm en la documentación en runtime.
 *
 * Fuente: ./version.json — generado por `npm run docs:version`
 * (lee la versión desde package.json; también se ejecuta solo en `npm run build`).
 *
 * Actualiza:
 *  - Todos los elementos con atributo [data-doc-version] (badge del header, footer, versiones en secciones).
 *  - La versión dentro del meta description.
 *
 * Si el fetch falla (p. ej. abierto vía file://), se mantienen los valores
 * estáticos ya sincronizados en los HTML.
 */
async function applyDocVersion() {
    try {
        const res = await fetch('./version.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.version) return;

        document.querySelectorAll('[data-doc-version]').forEach((el) => {
            el.textContent = `v${data.version}`;
        });

        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            const content = meta.getAttribute('content') || '';
            meta.setAttribute('content', content.replace(/v\d+\.\d+\.\d+/, `v${data.version}`));
        }
    } catch {
        /* sin servidor HTTP: se usan los valores estáticos de los HTML */
    }
}

export default { init: applyDocVersion };
