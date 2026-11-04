const { test, expect } = require('@playwright/test');

test.use({ headless: false });

test('error en peticion no deja spinner atascado', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    page.on('pageerror', err => {
        consoleErrors.push(err.message);
    });

    // Interceptar el endpoint de búsqueda para que devuelva 500
    await page.route('**/responseAjax.php', route => {
        return route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto('http://localhost:3000');

    // Esperar a que el buscador esté montado
    await page.waitForSelector('.app-search1', { timeout: 10000 });

    // Escribir en el input del buscador
    const input = page.locator('.app-search1 input.filter-search');
    await input.click();
    await input.type('test error');

    // Esperar un poco para que se procese el debounce y la petición
    await page.waitForTimeout(3000);

    // Verificar que NO hay ".search-loading" en el DOM (el spinner se limpió)
    const loadingElements = await page.locator('.search-loading').count();
    console.log('Elementos de loading:', loadingElements);
    expect(loadingElements).toBe(0);

    // Verificar que se muestra el mensaje de "no hay resultados"
    const noResults = await page.locator('.search-no-results').count();
    console.log('Elementos de no-results:', noResults);
    expect(noResults).toBeGreaterThan(0);

    // Verificar que no hay errores en consola
    console.error('Console errors:', consoleErrors);
    expect(consoleErrors.length).toBe(0);

    // Tomar screenshot para evidencia
    await page.screenshot({ path: 'test-error-fix.png', fullPage: true });
});
