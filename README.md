# Search Component [![npm version](https://img.shields.io/npm/v/%40jhoendryb%2Fbuscador-dinamico.svg)](https://www.npmjs.com/package/@jhoendryb/buscador-dinamico) [![npm downloads](https://img.shields.io/npm/dm/%40jhoendryb%2Fbuscador-dinamico.svg)](https://www.npmjs.com/package/@jhoendryb/buscador-dinamico)

![Search Component Themes](https://raw.githubusercontent.com/jhoendryb/buscadorDinamico/main/src/img/Banner_Theme_Search.png)

Una clase TypeScript flexible y moderna para crear buscadores dinámicos con soporte para paginación, scroll infinito, búsqueda en tiempo real, navegación por teclado, temas CSS predefinidos y gestión de errores centralizada. Compatible con datos locales y peticiones AJAX al servidor usando Fetch API.

📖 **Documentación completa:** https://jhoendryb.github.io/buscadorDinamico/

## Características

- **Búsqueda en tiempo real** con debounce configurable
- **Modo local** (datos en memoria) y **modo servidor** (AJAX con Fetch API)
- **Scroll infinito** automático con Intersection Observer
- **Navegación por teclado** y sistema de eventos extensible
- **Caché LRU** con TTL para optimizar rendimiento
- **Internacionalización** (i18n) con traducciones configurables
- **Temas CSS predefinidos** (clean-white, onyx-black, forest-green, entre otros)
- **TypeScript** con type safety completo

## Instalación

```bash
npm install @jhoendryb/buscador-dinamico
# o
pnpm install @jhoendryb/buscador-dinamico
```

O usando CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@jhoendryb/buscador-dinamico/dist/css/buscador-dinamico.css">
<script src="https://unpkg.com/@jhoendryb/buscador-dinamico/dist/buscador-dinamico.umd.js"></script>
```

## Ejemplo Básico

### Con npm / ES Modules

```html
<div class="app-search"></div>
```

```javascript
import { Search } from '@jhoendryb/buscador-dinamico';
import '@jhoendryb/buscador-dinamico/dist/css/buscador-dinamico.css';

const search = new Search({
    element: '.app-search',
    data: [
        {
            country: 'VE',
            name: 'Venezuela',
            descripcion: 'El pais mas rico en petroleo.'
        },
        {
            country: 'CO',
            name: 'Colombia',
            descripcion: 'El pais mas rico en cafe.'
        },
        {
            country: 'MX',
            name: 'Mexico',
            descripcion: 'El pais mas rico en tacos.'
        }
    ]
});

search.init();
```

### Con CDN (script)

Al cargar `buscador-dinamico.umd.js` por CDN, **no existe `import`**: la librería se expone en el global **`BuscadorDinamico`**, por lo que la clase se usa como `BuscadorDinamico.Search(...)`:

```html
<link rel="stylesheet" href="https://unpkg.com/@jhoendryb/buscador-dinamico/dist/css/buscador-dinamico.css">
<script src="https://unpkg.com/@jhoendryb/buscador-dinamico/dist/buscador-dinamico.umd.js"></script>

<div class="app-search"></div>

<script>
    const search = new BuscadorDinamico.Search({
        element: '.app-search',
        theme: 'onyx-black',
        data: [
            {
                country: 'VE',
                name: 'Venezuela',
                descripcion: 'El pais mas rico en petroleo.'
            },
            {
                country: 'CO',
                name: 'Colombia',
                descripcion: 'El pais mas rico en cafe.'
            },
            {
                country: 'MX',
                name: 'Mexico',
                descripcion: 'El pais mas rico en tacos.'
            }
        ]
    });

    search.init();
</script>
```

## Contribuir

¿Te gustaría mejorar el proyecto? Puedes aportar código, reportar bugs o ayudar con el mantenimiento de forma voluntaria. ¡Las contribuciones son bienvenidas!

Repositorio: https://github.com/jhoendryb/buscadorDinamico

## 💰 Donaciones

Si este proyecto te ha sido útil, considera hacer una donación para apoyar el desarrollo continuo.

**Binance Pay:**

- [Donar con Binance Pay](https://app.binance.com/uni-qr/AJ5U9KbQ)

¡Gracias por tu apoyo! 🙏

## Licencia

MIT License - Puedes usar este componente en proyectos personales y comerciales.
