import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'core.css') {
                        return 'css/core.css';
                    }
                    if (assetInfo.name === 'theme.css') {
                        return 'css/theme.css';
                    }
                    return 'css/[name].[hash][extname]';
                }
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/buscadorDinamico/src/php': {
                target: 'http://localhost',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
