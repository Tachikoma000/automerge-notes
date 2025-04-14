import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// For ESM compatibility
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        wasm(),
        topLevelAwait()
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
});
