/**
 * Sincroniza la versión de package.json hacia la documentación estática.
 *
 * Uso:  npm run docs:version
 *       (se ejecuta automáticamente antes de `npm run build` vía prebuild)
 *
 * Hace dos cosas:
 *  1. Escribe DocumentacionV2/version.json con la versión actual (consumido
 *     en runtime por DocumentacionV2/js/version.js).
 *  2. Reemplaza la versión en los marcadores estáticos de la documentación
 *     (atributos data-doc-version, meta description y el log de app.js),
 *     de modo que los HTML sirven la versión correcta incluso sin servidor.
 *
 * Nota: los archivos se leen/escriben en latin1 para preservar byte a byte
 * cualquier carácter no ASCII (la versión siempre es ASCII).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;

if (!/^\d+\.\d+\.\d+/.test(version)) {
    console.error(`[docs:version] Versión inválida en package.json: "${version}"`);
    process.exit(1);
}

const targets = [
    {
        file: 'DocumentacionV2/index.html',
        replacements: [
            // Meta description: "... v1.0.2 en npm ..."
            { pattern: /(buscador-dinamico v)\d+\.\d+\.\d+( en npm)/, replace: `$1${version}$2` },
            // Cualquier elemento marcado: data-doc-version>v1.0.2</span>
            { pattern: /(data-doc-version>v)\d+\.\d+\.\d+(<\/span>)/g, replace: `$1${version}$2` }
        ]
    },
    {
        file: 'DocumentacionV2/js/app.js',
        replacements: [
            // Log de consola: Documentación vX.Y.Z (única ocurrencia de versión en el archivo)
            { pattern: /v\d+\.\d+\.\d+/, replace: `v${version}` }
        ]
    },
    {
        file: 'DocumentacionV2/sections/installation.html',
        replacements: [
            { pattern: /(data-doc-version>v)\d+\.\d+\.\d+(<\/span>)/g, replace: `$1${version}$2` }
        ]
    },
    {
        file: 'DocumentacionV2/sections/introduction.html',
        replacements: [
            { pattern: /(data-doc-version>v)\d+\.\d+\.\d+(<\/span>)/g, replace: `$1${version}$2` }
        ]
    }
];

let changed = 0;

for (const { file, replacements } of targets) {
    const path = join(root, file);
    if (!existsSync(path)) {
        console.warn(`[docs:version] Omitido (no existe): ${file}`);
        continue;
    }
    let text = readFileSync(path).toString('latin1');
    const before = text;
    for (const { pattern, replace } of replacements) {
        text = text.replace(pattern, replace);
    }
    if (text !== before) {
        writeFileSync(path, Buffer.from(text, 'latin1'));
        changed++;
        console.log(`[docs:version] Actualizado: ${file}`);
    }
}

const versionJson = join(root, 'DocumentacionV2', 'version.json');
writeFileSync(versionJson, JSON.stringify({ version }, null, 2) + '\n');
console.log(`[docs:version] version.json escrito con v${version}`);
console.log(`[docs:version] Listo (${changed} archivo(s) de HTML/JS actualizados).`);
