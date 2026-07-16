import { Search } from '../dist/buscador-dinamico.es.js';

/**
 * Slugify — genera IDs de ancla consistentes a partir del texto de los encabezados.
 * Normaliza tildes, elimina caracteres especiales y convierte espacios en guiones.
 */
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Índice completo de búsqueda.
 * Cada entrada representa un segmento navegable dentro de una sección.
 * - route:    hash destino (ej. '#/templates')
 * - segment:  ID del encabezado h2/h3 dentro de la sección (auto-generado si está vacío)
 * - category: etiqueta de agrupación
 * - badge:    color del badge (info, success, warning)
 * - title:    texto visible del resultado
 * - description: contexto breve
 * - keywords: términos adicionales para mejorar la búsqueda
 */
const SEARCH_DATA = [
    // ── Introducción ───────────────────────────────────────────────
    { title: 'Introducción', route: '#/introduction', segment: '', category: 'Inicio', badge: 'info', description: 'Visión general del componente Buscador Dinámico', keywords: 'intro bienvenida inicio about overview' },
    { title: '¿Por qué Buscador Dinámico?', route: '#/introduction', segment: 'por-que-buscador-dinamico', category: 'Inicio', badge: 'info', description: 'Ventajas y comparación con otras soluciones', keywords: 'ventajas por que razones' },
    { title: 'Arquitectura', route: '#/introduction', segment: 'arquitectura', category: 'Inicio', badge: 'info', description: 'Módulos principales y patrón de composición OOP', keywords: 'arquitectura modulos oop clases composition' },
    { title: 'Modos de uso', route: '#/introduction', segment: 'modos-de-uso', category: 'Inicio', badge: 'info', description: 'Local, DOM, servidor, múltiples instancias', keywords: 'modos uso local servidor dom multiple' },
    { title: 'Requisitos mínimos', route: '#/introduction', segment: 'requisitos-minimos', category: 'Inicio', badge: 'info', description: 'Navegadores compatibles y APIs requeridas', keywords: 'requisitos navegadores compatibilidad browsers' },

    // ── Instalación ────────────────────────────────────────────────
    { title: 'Instalación', route: '#/installation', segment: '', category: 'Inicio', badge: 'info', description: 'Cómo instalar el componente via npm, pnpm o CDN', keywords: 'install npm pnpm setup download instalar' },
    { title: 'Vía npm / pnpm', route: '#/installation', segment: 'via-npm-pnpm', category: 'Inicio', badge: 'info', description: 'Instalación con gestores de paquetes', keywords: 'npm pnpm yarn install paquetes' },
    { title: 'Vía CDN', route: '#/installation', segment: 'via-cdn-umd', category: 'Inicio', badge: 'info', description: 'Uso directo sin bundler via unpkg', keywords: 'cdn unpkg script tag umd' },
    { title: 'Vía script tag ES Module', route: '#/installation', segment: 'via-script-tag-es-module', category: 'Inicio', badge: 'info', description: 'Módulo ES con import en navegador', keywords: 'script module es import' },
    { title: 'Descarga manual', route: '#/installation', segment: 'descarga-manual', category: 'Inicio', badge: 'info', description: 'Descargar archivos directamente desde GitHub', keywords: 'descarga manual github release' },
    { title: 'Estructura de archivos', route: '#/installation', segment: 'estructura-de-archivos', category: 'Inicio', badge: 'info', description: 'Estructura de directorios tras instalar', keywords: 'estructura archivos carpetas directorio install' },
    { title: 'Verificación', route: '#/installation', segment: 'verificacion', category: 'Inicio', badge: 'info', description: 'Confirmar que la instalación fue exitosa', keywords: 'verificar comprobar test instalar' },

    // ── Configuración ──────────────────────────────────────────────
    { title: 'Configuración', route: '#/configuration', segment: '', category: 'Inicio', badge: 'info', description: 'Parámetros de configuración del constructor', keywords: 'config setup opciones parametros settings' },
    { title: 'Parámetros básicos', route: '#/configuration', segment: 'parametros-basicos', category: 'Inicio', badge: 'info', description: 'Opciones fundamentales del constructor', keywords: 'parametros basicos element data theme' },
    { title: 'Referencia de parámetros', route: '#/configuration', segment: 'referencia-de-parametros', category: 'Inicio', badge: 'info', description: 'Tabla completa con todos los parámetros disponibles', keywords: 'referencia tabla parametros opciones' },
    { title: 'Configuración del servidor', route: '#/configuration', segment: 'configuracion-del-servidor-fetch', category: 'Inicio', badge: 'info', description: 'Setup de fetch para búsquedas remotas', keywords: 'fetch server servidor api remote ajax' },
    { title: 'Múltiples instancias', route: '#/configuration', segment: 'multiples-instancias', category: 'Inicio', badge: 'info', description: 'Varios buscadores independientes en la misma página', keywords: 'multiples instancias varios search' },

    // ── Plantillas ─────────────────────────────────────────────────
    { title: 'Plantillas', route: '#/templates', segment: '', category: 'Guías', badge: 'success', description: 'Personalización de plantillas de renderizado', keywords: 'templates plantillas render html custom' },
    { title: 'Plantilla de string', route: '#/templates', segment: 'plantilla-de-string', category: 'Guías', badge: 'success', description: 'HTML con interpolación simple de campos', keywords: 'string template interpolacion campos' },
    { title: 'Plantilla con función', route: '#/templates', segment: 'plantilla-con-funcion', category: 'Guías', badge: 'success', description: 'Función JavaScript que retorna HTML dinámico', keywords: 'function template funcion html dinamico' },
    { title: 'Ejemplo práctico', route: '#/templates', segment: 'ejemplo-practico', category: 'Guías', badge: 'success', description: 'Tarjeta de producto completa con template', keywords: 'ejemplo practico card producto tarjeta' },
    { title: 'Plantilla por defecto', route: '#/templates', segment: 'plantilla-por-defecto', category: 'Guías', badge: 'success', description: 'Estructura HTML que usa el componente sin template', keywords: 'default defecto por defecto' },
    { title: 'Acceso a datos del item', route: '#/templates', segment: 'acceso-a-datos-del-item', category: 'Guías', badge: 'success', description: 'Cómo acceder a todas las propiedades del objeto item', keywords: 'datos item propiedades objeto acceso' },

    // ── Internacionalización ────────────────────────────────────────
    { title: 'Internacionalización', route: '#/i18n', segment: '', category: 'Guías', badge: 'success', description: 'Soporte multiidioma y traducciones configurables', keywords: 'i18n internationalization idiomas traducciones languages' },
    { title: 'Idioma por defecto', route: '#/i18n', segment: 'idioma-por-defecto', category: 'Guías', badge: 'success', description: 'Traducciones predeterminadas en español', keywords: 'idioma defecto español spanish default' },
    { title: 'Personalizar traducciones', route: '#/i18n', segment: 'personalizar-traducciones', category: 'Guías', badge: 'success', description: 'Sobrescribir cadenas con el parámetro translation', keywords: 'personalizar traducciones custom translation' },
    { title: 'Soporte multiidioma completo', route: '#/i18n', segment: 'soporte-multiidioma-completo', category: 'Guías', badge: 'success', description: 'Ejemplo con múltiples idiomas y selección dinámica', keywords: 'multiidioma multiple languages soporte' },
    { title: 'Referencia de claves', route: '#/i18n', segment: 'referencia-de-claves', category: 'Guías', badge: 'success', description: '5 claves: searchPlaceholder, searchLabel, noResults, loading, pagination', keywords: 'claves keys referencia searchPlaceholder noResults pagination' },
    { title: 'Cambiar idioma dinámicamente', route: '#/i18n', segment: 'cambiar-idioma-dinamicamente', category: 'Guías', badge: 'success', description: 'Recrear instancia para cambiar idioma en runtime', keywords: 'cambiar idioma dinamico runtime ejecucion' },

    // ── Caché ──────────────────────────────────────────────────────
    { title: 'Caché', route: '#/cache', segment: '', category: 'Guías', badge: 'success', description: 'Sistema de caché LRU con TTL configurable', keywords: 'cache lru ttl performance memoria' },
    { title: 'Habilitar caché', route: '#/cache', segment: 'habilitar-cache', category: 'Guías', badge: 'success', description: 'Activar caché con cacheEnabled: true', keywords: 'habilitar activar cacheEnabled' },
    { title: 'Configuración de caché', route: '#/cache', segment: 'configuracion', category: 'Guías', badge: 'success', description: 'Parámetros maxSize y ttlSeconds', keywords: 'configuracion cache maxSize ttl' },
    { title: 'Cómo funciona', route: '#/cache', segment: 'como-funciona', category: 'Guías', badge: 'success', description: 'Algoritmo LRU y flujo de datos en caché', keywords: 'como funciona algoritmo lru flujo' },
    { title: 'Generación de claves', route: '#/cache', segment: 'generacion-de-claves', category: 'Guías', badge: 'success', description: 'Claves generadas automáticamente por término y página', keywords: 'claves key generate cacheKey' },
    { title: 'Limpiar caché', route: '#/cache', segment: 'limpiar-cache', category: 'Guías', badge: 'success', description: 'Métodos clear, delete y clearCacheByPrefix', keywords: 'limpiar borrar clear delete reset' },
    { title: 'Estadísticas de caché', route: '#/cache', segment: 'estadisticas-de-cache', category: 'Guías', badge: 'success', description: 'stats.hits, stats.misses, stats.evictions', keywords: 'estadisticas stats hits misses evictions' },
    { title: 'Patrón getOrFetch', route: '#/cache', segment: 'patron-getorfetch', category: 'Guías', badge: 'success', description: 'Obtener o cargar valores con cache.getOrFetch()', keywords: 'getOrFetch cache load fetch pattern' },
    { title: 'Uso con datos del servidor', route: '#/cache', segment: 'uso-con-datos-del-servidor', category: 'Guías', badge: 'success', description: 'Caché con búsquedas remotas para reducir peticiones HTTP', keywords: 'servidor http peticiones remote fetch' },

    // ── Temas CSS ──────────────────────────────────────────────────
    { title: 'Temas CSS', route: '#/css-themes', segment: '', category: 'Guías', badge: 'success', description: 'Temas predefinidos y variables CSS personalizables', keywords: 'css themes styling dark light variables custom' },
    { title: 'Temas disponibles', route: '#/css-themes', segment: 'temas-disponibles', category: 'Guías', badge: 'success', description: '5 temas: adaptative, clean-white, blue-black, onyx-black, forest-green', keywords: 'temas disponibles adaptative clean onyx forest' },
    { title: 'Aplicar un tema', route: '#/css-themes', segment: 'aplicar-un-tema', category: 'Guías', badge: 'success', description: 'Configurar tema en el constructor con theme', keywords: 'aplicar tema configurar theme' },
    { title: 'Cambiar tema dinámicamente', route: '#/css-themes', segment: 'cambiar-tema-dinamicamente', category: 'Guías', badge: 'success', description: 'Usar renderer.setTheme() después de inicializar', keywords: 'cambiar tema dinamico setTheme' },
    { title: 'Variables CSS personalizables', route: '#/css-themes', segment: 'variables-css-personalizables', category: 'Guías', badge: 'success', description: 'Dimensiones, colores y bordes editables vía CSS', keywords: 'variables css custom properties dimensiones colores' },
    { title: 'Dimensiones', route: '#/css-themes', segment: 'dimensiones', category: 'Guías', badge: 'success', description: 'Variables CSS de dimensiones del componente', keywords: 'dimensiones width height border-radius padding' },
    { title: 'Colores', route: '#/css-themes', segment: 'colores', category: 'Guías', badge: 'success', description: 'Variables CSS de colores del tema', keywords: 'colores colors background text shadow input hover' },
    { title: 'Bordes', route: '#/css-themes', segment: 'bordes', category: 'Guías', badge: 'success', description: 'Variables CSS de bordes', keywords: 'bordes borders width style radius' },
    { title: 'Resaltado', route: '#/css-themes', segment: 'resaltado', category: 'Guías', badge: 'success', description: 'Variables CSS para el resaltado de texto', keywords: 'resaltado highlight color background search' },
    { title: 'Crear un tema personalizado', route: '#/css-themes', segment: 'crear-un-tema-personalizado', category: 'Guías', badge: 'success', description: 'Definir .app-search.theme-mi-tema con variables', keywords: 'crear tema personalizado custom theme' },
    { title: 'Soporte dark/light mode', route: '#/css-themes', segment: 'soporte-dark-light-mode', category: 'Guías', badge: 'success', description: 'Tema adaptative con prefers-color-scheme', keywords: 'dark light mode prefer system' },

    // ── API ────────────────────────────────────────────────────────
    { title: 'API', route: '#/api', segment: '', category: 'Referencia', badge: 'warning', description: 'Referencia completa de la interfaz pública', keywords: 'api referencia publica interfaz' },
    { title: 'Constructor', route: '#/api', segment: 'constructor', category: 'Referencia', badge: 'warning', description: 'new Search(params: SearchParams): Search', keywords: 'constructor new crear instancia' },
    { title: 'Métodos públicos', route: '#/api', segment: 'metodos-publicos', category: 'Referencia', badge: 'warning', description: 'Todos los métodos disponibles en la API', keywords: 'metodos methods publicos api init draw sort clear destroy' },
    { title: 'init()', route: '#/api', segment: 'init', category: 'Referencia', badge: 'warning', description: 'Inicializa el componente y renderiza la estructura DOM', keywords: 'init inicializar render setup' },
    { title: 'draw()', route: '#/api', segment: 'draw-searchterm-isevent', category: 'Referencia', badge: 'warning', description: 'Ejecuta búsqueda y renderiza resultados', keywords: 'draw buscar search render resultados' },
    { title: 'sort()', route: '#/api', segment: 'sort-field-order', category: 'Referencia', badge: 'warning', description: 'Ordena datos por campo específico', keywords: 'sort ordenar ascending descending' },
    { title: 'clearSort()', route: '#/api', segment: 'clearsort', category: 'Referencia', badge: 'warning', description: 'Elimina ordenamiento y reinicia a orden natural', keywords: 'clearsort limpiar orden reset' },
    { title: 'clear()', route: '#/api', segment: 'clear', category: 'Referencia', badge: 'warning', description: 'Resetea el estado del componente sin destruirlo', keywords: 'clear resetear estado limpiar input busqueda' },
    { title: 'showLoading()', route: '#/api', segment: 'showloading', category: 'Referencia', badge: 'warning', description: 'Muestra indicador de carga en resultados', keywords: 'showloading carga spinner indicator' },
    { title: 'on()', route: '#/api', segment: 'oneventname-callback', category: 'Referencia', badge: 'warning', description: 'Registra listener para eventos del componente', keywords: 'on event listener registrar callback' },
    { title: 'getCacheKey()', route: '#/api', segment: 'getcachekey-searchterm-page', category: 'Referencia', badge: 'warning', description: 'Genera clave de caché para búsqueda y página', keywords: 'getcachekey cache key clave' },
    { title: 'setupKeyboardNavigation()', route: '#/api', segment: 'setupkeyboardnavigation', category: 'Referencia', badge: 'warning', description: 'Habilita navegación con flechas y Enter', keywords: 'keyboard teclado flechas navigation' },
    { title: 'destroy()', route: '#/api', segment: 'destroy', category: 'Referencia', badge: 'warning', description: 'Destruye instancia y limpia todos los recursos', keywords: 'destroy destruir limpiar cleanup dispose' },
    { title: 'Métodos del Renderer', route: '#/api', segment: 'metodos-del-renderer', category: 'Referencia', badge: 'warning', description: 'updateCounter, showResults, hideResults, toggleResults, destroy', keywords: 'renderer updateCounter showResults hideResults toggle' },
    { title: 'renderer.updateCounter()', route: '#/api', segment: 'renderer-updatecounter', category: 'Referencia', badge: 'warning', description: 'Actualiza contador con { from, to, total, textPagination? }', keywords: 'updateCounter contador from to total textPagination' },
    { title: 'renderer.showResults/hideResults/toggleResults', route: '#/api', segment: 'renderer-showresults-hideresults-toggleresults', category: 'Referencia', badge: 'warning', description: 'Control de visibilidad del panel de resultados', keywords: 'showResults hideResults toggleResults visibilidad' },
    { title: 'renderer.destroy()', route: '#/api', segment: 'renderer-destroy', category: 'Referencia', badge: 'warning', description: 'Limpia timeouts y referencias del DOM', keywords: 'renderer destroy cleanup timeouts DOM' },
    { title: 'Métodos de Paginación', route: '#/api', segment: 'metodos-de-paginacion', category: 'Referencia', badge: 'warning', description: 'getRange, getTotalPages, getTotalLoaded, loadNextPage, hasMorePages', keywords: 'paginacion getRange getTotalPages loadNextPage hasMorePages' },
    { title: 'pagination.getRange()', route: '#/api', segment: 'pagination-getrange', category: 'Referencia', badge: 'warning', description: 'Rango actual: { from, to, total }', keywords: 'getRange from to total rango' },
    { title: 'pagination.getTotalPages()', route: '#/api', segment: 'pagination-gettotalpages', category: 'Referencia', badge: 'warning', description: 'Total de páginas disponibles', keywords: 'getTotalPages total paginas count' },
    { title: 'pagination.getTotalLoaded()', route: '#/api', segment: 'pagination-gettotalloaded', category: 'Referencia', badge: 'warning', description: 'Items cargados con scroll infinito', keywords: 'getTotalLoaded items cargados loaded' },
    { title: 'pagination.loadNextPage()', route: '#/api', segment: 'pagination-loadnextpage', category: 'Referencia', badge: 'warning', description: 'Avanza a la siguiente página', keywords: 'loadNextPage next page avanzar siguiente' },
    { title: 'pagination.hasMorePages()', route: '#/api', segment: 'pagination-hasmorepages', category: 'Referencia', badge: 'warning', description: 'Verifica si hay más páginas', keywords: 'hasMorePages has more pages verificar' },
    { title: 'Propiedades públicas', route: '#/api', segment: 'propiedades-publicas', category: 'Referencia', badge: 'warning', description: 'element, searchTerm, data, theme, pagination, events, cache, renderer', keywords: 'propiedades publicas properties attributes' },
    { title: 'Encadenamiento', route: '#/api', segment: 'encadenamiento', category: 'Referencia', badge: 'warning', description: 'Métodos que retornan this para chaining', keywords: 'encadenamiento chaining methods fluent' },

    // ── Eventos ────────────────────────────────────────────────────
    { title: 'Eventos', route: '#/events', segment: '', category: 'Referencia', badge: 'warning', description: 'Sistema de eventos personalizado con EventEmitter', keywords: 'events emit on event emitter callback' },
    { title: 'Uso básico de eventos', route: '#/events', segment: 'uso-basico', category: 'Referencia', badge: 'warning', description: 'Cómo registrar y escuchar eventos', keywords: 'uso basico como registrar escuchar' },
    { title: 'Lista de eventos', route: '#/events', segment: 'lista-de-eventos', category: 'Referencia', badge: 'warning', description: 'Todos los eventos disponibles del componente', keywords: 'lista eventos disponibles all events list' },
    { title: 'Evento init', route: '#/events', segment: 'init', category: 'Referencia', badge: 'warning', description: 'Emite al inicializar el componente', keywords: 'init evento initialize setup' },
    { title: 'Evento search', route: '#/events', segment: 'search', category: 'Referencia', badge: 'warning', description: 'Emite después de cada búsqueda ejecutada', keywords: 'search evento buscar ejecutado' },
    { title: 'Evento pageChange', route: '#/events', segment: 'pagechange', category: 'Referencia', badge: 'warning', description: 'Emite al cambiar de página (scroll infinito)', keywords: 'pageChange pagina scroll infinito' },
    { title: 'Evento resultsCleared', route: '#/events', segment: 'resultscleared', category: 'Referencia', badge: 'warning', description: 'Emite al limpiar resultados por cambio de término', keywords: 'resultsCleared limpiar resultados cambio termino' },
    { title: 'Evento searchComplete', route: '#/events', segment: 'searchcomplete', category: 'Referencia', badge: 'warning', description: 'Emite al completar búsqueda y renderizado', keywords: 'searchComplete buscar completo render resultados' },
    { title: 'Evento sortChange', route: '#/events', segment: 'sortchange', category: 'Referencia', badge: 'warning', description: 'Emite al cambiar el ordenamiento', keywords: 'sortChange orden sort' },
    { title: 'Evento itemSelected', route: '#/events', segment: 'itemselected', category: 'Referencia', badge: 'warning', description: 'Emite al seleccionar un item (clic o Enter)', keywords: 'itemSelected seleccionar click enter' },
    { title: 'Evento itemHighlighted', route: '#/events', segment: 'itemhighlighted', category: 'Referencia', badge: 'warning', description: 'Emite al destacar un item visualmente', keywords: 'itemHighlighted destacar hover focus' },
    { title: 'Evento appendItems', route: '#/events', segment: 'appenditems', category: 'Referencia', badge: 'warning', description: 'Emite al añadir nuevos items al DOM', keywords: 'appendItems agregar items render' },
    { title: 'Evento destroy', route: '#/events', segment: 'destroy', category: 'Referencia', badge: 'warning', description: 'Emite antes de destruir la instancia', keywords: 'destroy destruir cleanup' },
    { title: 'Evento error', route: '#/events', segment: 'error', category: 'Referencia', badge: 'warning', description: 'Emite cuando ocurre un error', keywords: 'error evento excepcion fallo' },
    { title: 'Remover listeners', route: '#/events', segment: 'remover-listeners', category: 'Referencia', badge: 'warning', description: 'Métodos off() y removeAllListeners()', keywords: 'remover off remove listener unsubscribe' },
    { title: 'Una sola vez', route: '#/events', segment: 'una-sola-vez', category: 'Referencia', badge: 'warning', description: 'Registrarse una sola vez con events.once()', keywords: 'once una sola vez primer vez' },
    { title: 'Eventos asíncronos', route: '#/events', segment: 'eventos-asincronos', category: 'Referencia', badge: 'warning', description: 'Emitir eventos con emitAsync() y Promise.allSettled', keywords: 'eventos asincronos async emitAsync' },
    { title: 'Información de listeners', route: '#/events', segment: 'informacion-de-listeners', category: 'Referencia', badge: 'warning', description: 'listenerCount, eventNames, getEventList', keywords: 'listenerCount eventNames getEventList info listeners' },
    { title: 'SearchEventMap (TypeScript)', route: '#/events', segment: 'searcheventmap-typescript', category: 'Referencia', badge: 'warning', description: 'Mapa tipado de eventos para type-safety', keywords: 'SearchEventMap typed events type safety' },

    // ── Errores ────────────────────────────────────────────────────
    { title: 'Errores', route: '#/errors', segment: '', category: 'Referencia', badge: 'warning', description: 'Sistema centralizado de gestión de errores', keywords: 'errors error handling gestion excepciones' },
    { title: 'Tipos de error', route: '#/errors', segment: 'tipos-de-error', category: 'Referencia', badge: 'warning', description: 'Clase SearchError con código, solución y contexto', keywords: 'tipos error searcherror clase' },
    { title: 'Códigos de error', route: '#/errors', segment: 'codigos-de-error', category: 'Referencia', badge: 'warning', description: '14 códigos desde SEARCH_001 hasta SEARCH_041', keywords: 'codigos error codes SEARCH_001 SEARCH_002' },
    { title: 'Manejo de errores', route: '#/errors', segment: 'manejo-de-errores', category: 'Referencia', badge: 'warning', description: 'Try/catch, eventos y modo desarrollo', keywords: 'manejo errores try catch handling' },
    { title: 'Try/Catch', route: '#/errors', segment: 'try-catch', category: 'Referencia', badge: 'warning', description: 'Capturar errores del constructor e init()', keywords: 'try catch capturar exception' },
    { title: 'Evento de error', route: '#/errors', segment: 'evento-de-error', category: 'Referencia', badge: 'warning', description: 'Escuchar errores vía events.on("error", ...)', keywords: 'evento error on emit' },
    { title: 'Modo desarrollo', route: '#/errors', segment: 'modo-desarrollo', category: 'Referencia', badge: 'warning', description: 'Logs detallados con developmentMode: true', keywords: 'desarrollo development mode logs debug' },
    { title: 'Errores de red', route: '#/errors', segment: 'errores-de-red-modo-servidor', category: 'Referencia', badge: 'warning', description: 'Timeouts, HTTP errors, AbortController', keywords: 'red network timeout http error servidor' },

    // ── TypeScript ─────────────────────────────────────────────────
    { title: 'TypeScript', route: '#/typescript', segment: '', category: 'Referencia', badge: 'warning', description: 'Tipados e interfaces completas de TypeScript', keywords: 'typescript types interfaces typings ts' },
    { title: 'Tipos exportados', route: '#/typescript', segment: 'tipos-exportados', category: 'Referencia', badge: 'warning', description: 'Search, SearchParams, FetchConfig, eventos, etc.', keywords: 'tipos exportados exports types' },
    { title: 'SearchParams', route: '#/typescript', segment: 'interfaz-searchparams', category: 'Referencia', badge: 'warning', description: 'Interfaz completa de parámetros del constructor', keywords: 'SearchParams interfaz parametros constructor' },
    { title: 'FetchConfig', route: '#/typescript', segment: 'interfaz-fetchconfig', category: 'Referencia', badge: 'warning', description: 'Configuración de peticiones HTTP', keywords: 'FetchConfig interfaz fetch http' },
    { title: 'TranslationCache', route: '#/typescript', segment: 'interfaz-translationcache', category: 'Referencia', badge: 'warning', description: 'Estructura de traducciones', keywords: 'TranslationCache traducciones idiomas' },
    { title: 'Eventos tipados', route: '#/typescript', segment: 'eventos-tipados', category: 'Referencia', badge: 'warning', description: 'SearchEventInit, PageChangeEventData, etc.', keywords: 'eventos tipados typed events data' },
    { title: 'SearchEventMap', route: '#/typescript', segment: 'searcheventmap-mapa-tipado-de-eventos', category: 'Referencia', badge: 'warning', description: 'Mapa tipado que asocia cada evento con su tipo de datos', keywords: 'SearchEventMap typed event map types' },
    { title: 'Tipos de datos de eventos', route: '#/typescript', segment: 'tipos-de-datos-de-eventos', category: 'Referencia', badge: 'warning', description: 'SearchEventData, ErrorData, AppendItemsEventData y más', keywords: 'tipos datos eventos interfaces ErrorData SearchEventData' },
    { title: 'DomComponent enum', route: '#/typescript', segment: 'domcomponent-enum-de-orden-de-renderizado', category: 'Referencia', badge: 'warning', description: 'Enum para orden de renderizado: SEARCH, CONTENT, ITEMS, PAGINATION', keywords: 'DomComponent enum renderizado orden dom' },
    { title: 'EventEmitter Genérico', route: '#/typescript', segment: 'eventemitter-generico', category: 'Referencia', badge: 'warning', description: 'EventEmitter<T> con emitAsync, getEventList y type-safety', keywords: 'EventEmitter generic emitAsync getEventList' },
    { title: 'PaginationRange', route: '#/typescript', segment: 'paginationrange', category: 'Referencia', badge: 'warning', description: 'Interface { from, to, total } para el rango de paginación', keywords: 'PaginationRange rango paginacion from to total' },
    { title: 'Uso con tipos', route: '#/typescript', segment: 'uso-con-tipos', category: 'Referencia', badge: 'warning', description: 'Ejemplo completo con SearchEventMap y type inference', keywords: 'uso tipos example tipo interfaces type inference' },
    { title: 'Generación de tipos', route: '#/typescript', segment: 'generacion-de-tipos', category: 'Referencia', badge: 'warning', description: 'Archivos .d.ts generados por el build', keywords: 'generacion tipos declarations d.ts build' },
    { title: 'Type narrowing', route: '#/typescript', segment: 'type-narrowing', category: 'Referencia', badge: 'warning', description: 'Type inference automática desde SearchEventMap', keywords: 'type narrowing inference auto' },

    // ── Ejemplos ───────────────────────────────────────────────────
    { title: 'Ejemplos', route: '#/examples', segment: '', category: 'Recursos', badge: 'info', description: 'Ejemplos prácticos de uso en diferentes escenarios', keywords: 'examples ejemplos demo usage casos uso' },
    { title: 'Búsqueda básica local', route: '#/examples', segment: 'busqueda-basica-local', category: 'Recursos', badge: 'info', description: 'Ejemplo mínimo con array de objetos', keywords: 'basica local simple array objetos' },
    { title: 'Con plantilla personalizada', route: '#/examples', segment: 'con-plantilla-personalizada', category: 'Recursos', badge: 'info', description: 'Renderizado custom con función template', keywords: 'plantilla personalizada template custom' },
    { title: 'Búsqueda desde DOM', route: '#/examples', segment: 'busqueda-desde-dom', category: 'Recursos', badge: 'info', description: 'Extraer datos de elementos HTML data-*', keywords: 'dom data attributes extraer html' },
    { title: 'Búsqueda remota', route: '#/examples', segment: 'busqueda-remota-servidor', category: 'Recursos', badge: 'info', description: 'Peticiones HTTP con Fetch API', keywords: 'remota server fetch api http ajax' },
    { title: 'Múltiples instancias', route: '#/examples', segment: 'multiples-instancias', category: 'Recursos', badge: 'info', description: 'Varios buscadores en la misma página', keywords: 'multiples instancias varios search' },
    { title: 'Con resaltado de texto', route: '#/examples', segment: 'con-resaltado-de-texto', category: 'Recursos', badge: 'info', description: 'Habilitar y personalizar el resaltado de búsquedas', keywords: 'resaltado highlight texto buscar custom class' },
    { title: 'Con eventos', route: '#/examples', segment: 'con-eventos', category: 'Recursos', badge: 'info', description: 'Escuchar init, search, itemSelected, pageChange', keywords: 'eventos on escuchar init search' },
    { title: 'Con caché y sort', route: '#/examples', segment: 'con-cache-y-sort', category: 'Recursos', badge: 'info', description: 'Ordenamiento y caché LRU para performance', keywords: 'cache sort ordenamiento performance' },
    { title: 'Con adapter de respuesta', route: '#/examples', segment: 'con-adapter-de-respuesta', category: 'Recursos', badge: 'info', description: 'Transformar respuestas del servidor con responseAdapter', keywords: 'adapter respuesta transformar response server' },
    { title: 'Con búsqueda en objetos anidados', route: '#/examples', segment: 'con-busqueda-en-objetos-anidados', category: 'Recursos', badge: 'info', description: 'Buscar recursivamente en objetos anidados', keywords: 'busqueda anidados nested objects recursive flatten' },
    { title: 'Integración con frameworks', route: '#/examples', segment: 'integracion-con-frameworks', category: 'Recursos', badge: 'info', description: 'Uso con React, Vue y otros frameworks', keywords: 'integracion frameworks react vue angular' },
    { title: 'React', route: '#/examples', segment: 'react', category: 'Recursos', badge: 'info', description: 'Integración con useRef y useEffect', keywords: 'react hook useRef useEffect jsx' },
    { title: 'Vue', route: '#/examples', segment: 'vue', category: 'Recursos', badge: 'info', description: 'Integración con onMounted y onUnmounted', keywords: 'vue composition api setup onMounted' },

    // ── Changelog ──────────────────────────────────────────────────
    { title: 'Changelog', route: '#/changelog', segment: '', category: 'Recursos', badge: 'info', description: 'Historial de versiones y cambios', keywords: 'changelog versiones releases history cambios' },
    { title: 'v2.4.0', route: '#/changelog', segment: 'v2-4-0-latest', category: 'Recursos', badge: 'info', description: 'SearchEventMap, DomComponent, EventEmitter genérico, nuevas APIs', keywords: 'v2.4.0 latest version release SearchEventMap DomComponent' },
    { title: 'v2.3.0', route: '#/changelog', segment: 'v2-3-0', category: 'Recursos', badge: 'info', description: 'responseAdapter, clear(), resultados anidados, Unicode', keywords: 'v2.3.0 version release responseAdapter clear nested' },
    { title: 'v2.2.0', route: '#/changelog', segment: 'v2-2-0', category: 'Recursos', badge: 'info', description: 'Resaltado de texto, refactorizaciones', keywords: 'v2.2.0 version release highlight' },
    { title: 'Características iniciales', route: '#/changelog', segment: 'caracteristicas-iniciales', category: 'Recursos', badge: 'info', description: 'Funcionalidades principales del componente', keywords: 'caracteristicas iniciales features' },
    { title: 'Temas CSS (Changelog)', route: '#/changelog', segment: 'temas-css', category: 'Recursos', badge: 'info', description: 'Historial de temas CSS', keywords: 'temas css themes changelog' },
    { title: 'Eventos (Changelog)', route: '#/changelog', segment: 'eventos', category: 'Recursos', badge: 'info', description: 'Historial de eventos', keywords: 'eventos events changelog' },
    { title: 'Códigos de error (Changelog)', route: '#/changelog', segment: 'codigos-de-error', category: 'Recursos', badge: 'info', description: 'Historial de códigos de error', keywords: 'codigos error changelog search' }
];

/**
 * DocSearch — módulo de búsqueda para la documentación.
 *
 * Inicializa el componente BuscadorDinamico como buscador principal del sitio,
 * indexa todas las secciones y segmentos de la documentación, y gestiona la
 * navegación al seleccionar un resultado.
 */
const DocSearch = {
    /** Instancia del componente Search */
    instance: null,
    /** Referencia al contenedor DOM del componente */
    container: null,
    /** ID del segmento pendiente de scroll tras cambio de sección */
    pendingScrollTo: null,
    /** Observer para detectar carga de nuevo contenido */
    contentObserver: null,

    /**
     * Punto de entrada. Crea el contenedor, inicializa el componente
     * y configura los event listeners.
     */
    init() {
        this.container = document.getElementById('doc-search-container');
        if (!this.container) return;

        this.createSearchContainer();
        this.initializeSearch();
        this.setupContentObserver();
        this.setupHashScrollListener();
        this.setupKeyboardShortcut();
    },

    /**
     * Crea el contenedor interno con la clase .app-search que el componente
     * necesita para aplicar sus estilos CSS correctamente.
     */
    createSearchContainer() {
        this.container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'app-search';
        wrapper.id = 'doc-search';
        this.container.appendChild(wrapper);
    },

    /**
     * Inicializa la instancia del componente BuscadorDinamico.Search
     * con la configuración optimizada para la barra de búsqueda del header.
     */
    initializeSearch() {
        this.instance = new Search({
            element: '#doc-search',
            data: SEARCH_DATA,
            theme: this.getCurrentTheme(),
            itemsPerPage: 8,
            debounceTime: 200,
            keyboardEnabled: true,
            cacheEnabled: true,
            cacheMaxSize: 30,
            cacheTtlSeconds: 300,
            dom: 'scip',
            zIndex: 200,
            template: (item) => this.renderResult(item),
            translation: {
                searchPlaceholder: 'Buscar en la documentación...',
                searchLabel: 'Buscar en la documentación',
                noResults: 'No se encontraron resultados',
                loading: 'Buscando...'
            }
        }).init();

        this.instance.on('itemSelected', ({ item, close }) => {
            this.handleResultSelection(item);
            close();
        });
    },

    /**
     * Renderiza el HTML interno de cada resultado de búsqueda.
     * Almacena route y segment como data-* attributes para la navegación.
     *
     * @param {Object} item - Objeto del índice de búsqueda
     * @returns {string} HTML del resultado
     */
    renderResult(item) {
        const categoryClass = `doc-search-result__badge--${item.badge}`;
        return `
            <div class="doc-search-result" data-route="${item.route}" data-segment="${item.segment}">
                <div class="doc-search-result__header">
                    <span class="doc-search-result__badge ${categoryClass}">${item.category}</span>
                    <span class="doc-search-result__title">${item.title}</span>
                </div>
                <div class="doc-search-result__desc">${item.description}</div>
            </div>
        `;
    },

    /**
     * Maneja la selección de un resultado de búsqueda.
     * Lee route y segment del DOM y navega al hash correspondiente.
     *
     * @param {HTMLElement} itemEl - Elemento <li> seleccionado
     */
    handleResultSelection(itemEl) {
        const result = itemEl.querySelector('.doc-search-result');
        if (!result) return;

        const route = result.dataset.route;
        const segment = result.dataset.segment || '';

        if (!route) return;

        const targetSection = route.replace('#\/', '');

        if (this.isCurrentSection(targetSection) && !segment) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (this.isCurrentSection(targetSection)) {
            this.scrollToSegment(segment);
        } else {
            this.pendingScrollTo = segment;
            window.location.hash = route;
        }

        const input = this.container.querySelector('.filter-search-doc-search');
        if (input) {
            input.blur();
        }
    },

    /**
     * Verifica si la sección proporcionada es la actual.
     *
     * @param {string} sectionName - Nombre de la sección (ej. 'templates')
     * @returns {boolean}
     */
    isCurrentSection(sectionName) {
        return window.location.hash === `#/${sectionName}`;
    },

    /**
     * Desplazamiento suave hacia un segmento dentro de la sección actual.
     * Auto-genera IDs en los encabezados si no existen.
     *
     * @param {string} segmentId - ID del encabezado destino
     * @param {number} [retries=15] - Intentos máximos de búsqueda del elemento
     */
    scrollToSegment(segmentId, retries = 15) {
        if (!segmentId) {
            const contentArea = document.querySelector('.doc-content');
            if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        this.ensureHeadingIds();

        const target = document.getElementById(segmentId);
        if (target) {
            const contentArea = document.querySelector('.doc-content');
            const headerOffset = 70;
            const targetPosition = target.getBoundingClientRect().top + (contentArea?.scrollTop || window.scrollY) - headerOffset;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            return;
        }

        if (retries > 0) {
            requestAnimationFrame(() => {
                setTimeout(() => this.scrollToSegment(segmentId, retries - 1), 100);
            });
        }
    },

    /**
     * Recorre todos los encabezados h1-h4 dentro de #doc-view y les asigna
     * un id basado en su texto (slugify) si no lo tienen.
     * Esto permite la navegación por segmento desde el buscador.
     */
    ensureHeadingIds() {
        const content = document.getElementById('doc-view');
        if (!content) return;

        const headings = content.querySelectorAll('h1, h2, h3, h4');
        headings.forEach(heading => {
            if (!heading.id) {
                heading.id = slugify(heading.textContent);
            }
        });
    },

    /**
     * Configura un MutationObserver en #doc-view para detectar cuando el Router
     * inyecta nuevo contenido HTML. Al detectar cambios:
     * 1. Auto-genera IDs en los encabezados
     * 2. Resuelve scrolls pendientes de navegación por segmento
     */
    setupContentObserver() {
        const contentEl = document.getElementById('doc-view');
        if (!contentEl) return;

        this.contentObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    this.ensureHeadingIds();

                    if (this.pendingScrollTo) {
                        const segment = this.pendingScrollTo;
                        this.pendingScrollTo = null;
                        setTimeout(() => this.scrollToSegment(segment), 50);
                    }
                }
            }
        });

        this.contentObserver.observe(contentEl, { childList: true, subtree: true });
    },

    /**
     * Listener de respaldo para hashchange por si el MutationObserver
     * no captura el cambio a tiempo.
     */
    setupHashScrollListener() {
        window.addEventListener('hashchange', () => {
            if (this.pendingScrollTo) {
                const segment = this.pendingScrollTo;
                this.pendingScrollTo = null;
                setTimeout(() => this.scrollToSegment(segment), 150);
            }
        });
    },

    /**
     * Atajo de teclado Ctrl+K / Cmd+K para enfocar el buscador.
     */
    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const input = this.container?.querySelector('.filter-search');
                if (input) {
                    input.focus();
                    input.select();
                }
            }
        });
    },

    /**
     * Retorna el nombre del tema del componente.
     * Usa el tema adaptative que se adapta automáticamente al data-theme del HTML.
     *
     * @returns {string} Nombre del tema ('adaptative')
     */
    getCurrentTheme() {
        return 'adaptative';
    },

    /**
     * Sincroniza el tema del buscador con el tema activo del sitio.
     * Con el tema adaptative, no es necesario llamar setTheme() ya que
     * el CSS responde directamente al atributo data-theme del HTML.
     */
    updateTheme() {
        // El tema adaptative se actualiza automáticamente via CSS
        // No es necesario llamar setTheme()
    }
};

export default DocSearch;
