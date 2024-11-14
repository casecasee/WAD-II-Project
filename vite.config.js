import { defineConfig } from 'vite';

export default defineConfig({
    envPrefix: 'VITE_',
    build: {
        outDir: 'dist'
    },
    server: {
        port: 3000
    }
}); 